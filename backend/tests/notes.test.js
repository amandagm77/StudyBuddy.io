const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('../routes/authRoutes');
const subjectRoutes = require('../routes/subjectRoutes');
const noteRoutes = require('../routes/noteRoutes');
const { connect, closeDatabase, clearDatabase } = require('../test-utils/setupTestDB');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/notes', noteRoutes);

async function registerAndLogin(email) {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email,
    password: 'password123',
  });
  return res.headers['set-cookie'];
}

async function createSubject(cookie, title = 'Test Subject') {
  const res = await request(app).post('/api/subjects').set('Cookie', cookie).send({ title });
  return res.body._id;
}

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-key';
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('POST /api/notes', () => {
  it('creates a note under a subject', async () => {
    const cookie = await registerAndLogin('noteuser1@example.com');
    const subjectId = await createSubject(cookie);

    const res = await request(app)
      .post('/api/notes')
      .set('Cookie', cookie)
      .send({ title: 'Mitosis', body: '<p>Cell division</p>', subject: subjectId });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Mitosis');
  });

  it('rejects a note with no body', async () => {
    const cookie = await registerAndLogin('noteuser2@example.com');
    const subjectId = await createSubject(cookie);

    const res = await request(app)
      .post('/api/notes')
      .set('Cookie', cookie)
      .send({ title: 'Mitosis', subject: subjectId });

    expect(res.status).toBe(400);
  });

  it('rejects a title longer than 30 characters', async () => {
    const cookie = await registerAndLogin('noteuser3@example.com');
    const subjectId = await createSubject(cookie);

    const res = await request(app)
      .post('/api/notes')
      .set('Cookie', cookie)
      .send({ title: 'a'.repeat(31), body: '<p>content</p>', subject: subjectId });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/notes', () => {
  it('only returns notes belonging to the logged-in user', async () => {
    const cookieA = await registerAndLogin('noteownerA@example.com');
    const cookieB = await registerAndLogin('noteownerB@example.com');
    const subjectA = await createSubject(cookieA, "A's Subject");
    const subjectB = await createSubject(cookieB, "B's Subject");

    await request(app).post('/api/notes').set('Cookie', cookieA)
      .send({ title: "A's Note", body: '<p>a</p>', subject: subjectA });
    await request(app).post('/api/notes').set('Cookie', cookieB)
      .send({ title: "B's Note", body: '<p>b</p>', subject: subjectB });

    const resA = await request(app).get('/api/notes').set('Cookie', cookieA);

    expect(resA.status).toBe(200);
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].title).toBe("A's Note");
  });
});

describe('PUT /api/notes/:id', () => {
  it("prevents a user from editing another user's note", async () => {
    const cookieA = await registerAndLogin('editownerA@example.com');
    const cookieB = await registerAndLogin('editattackerB@example.com');
    const subjectA = await createSubject(cookieA);

    const noteRes = await request(app).post('/api/notes').set('Cookie', cookieA)
      .send({ title: 'Original', body: '<p>original</p>', subject: subjectA });

    const res = await request(app)
      .put(`/api/notes/${noteRes.body._id}`)
      .set('Cookie', cookieB)
      .send({ title: 'Hacked', body: '<p>hacked</p>' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/notes', () => {
  it('bulk deletes all notes in a subject', async () => {
    const cookie = await registerAndLogin('bulkdelete@example.com');
    const subjectId = await createSubject(cookie);

    await request(app).post('/api/notes').set('Cookie', cookie)
      .send({ title: 'Note 1', body: '<p>1</p>', subject: subjectId });
    await request(app).post('/api/notes').set('Cookie', cookie)
      .send({ title: 'Note 2', body: '<p>2</p>', subject: subjectId });

    const res = await request(app).delete(`/api/notes?subject=${subjectId}`).set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);

    const remaining = await request(app).get(`/api/notes?subject=${subjectId}`).set('Cookie', cookie);
    expect(remaining.body).toHaveLength(0);
  });
});