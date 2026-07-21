const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('../routes/authRoutes');
const subjectRoutes = require('../routes/subjectRoutes');
const Note = require('../models/Note');
const { connect, closeDatabase, clearDatabase } = require('../test-utils/setupTestDB');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);

// Helper: registers a user and returns their session cookie, so each test
// doesn't have to repeat this same boilerplate
async function registerAndLogin(email) {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email,
    password: 'password123',
  });
  return res.headers['set-cookie'];
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

describe('POST /api/subjects', () => {
  it('creates a subject for the logged-in user', async () => {
    const cookie = await registerAndLogin('user1@example.com');

    const res = await request(app)
      .post('/api/subjects')
      .set('Cookie', cookie)
      .send({ title: 'Biology' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Biology');
  });

  it('rejects a request with no title', async () => {
    const cookie = await registerAndLogin('user2@example.com');

    const res = await request(app)
      .post('/api/subjects')
      .set('Cookie', cookie)
      .send({});

    expect(res.status).toBe(400);
  });

  it('rejects a title longer than 30 characters', async () => {
    const cookie = await registerAndLogin('user3@example.com');

    const res = await request(app)
      .post('/api/subjects')
      .set('Cookie', cookie)
      .send({ title: 'a'.repeat(31) });

    expect(res.status).toBe(400);
  });

  it('rejects the request entirely if not logged in', async () => {
    const res = await request(app).post('/api/subjects').send({ title: 'Biology' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/subjects', () => {
  it('only returns subjects belonging to the logged-in user', async () => {
    const cookieA = await registerAndLogin('userA@example.com');
    const cookieB = await registerAndLogin('userB@example.com');

    await request(app).post('/api/subjects').set('Cookie', cookieA).send({ title: "A's Subject" });
    await request(app).post('/api/subjects').set('Cookie', cookieB).send({ title: "B's Subject" });

    const resA = await request(app).get('/api/subjects').set('Cookie', cookieA);

    expect(resA.status).toBe(200);
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].title).toBe("A's Subject");
  });
});

describe('DELETE /api/subjects/:id', () => {
  it("prevents a user from deleting another user's subject", async () => {
    const cookieA = await registerAndLogin('ownerA@example.com');
    const cookieB = await registerAndLogin('attackerB@example.com');

    const created = await request(app)
      .post('/api/subjects')
      .set('Cookie', cookieA)
      .send({ title: 'Private Subject' });

    const res = await request(app)
      .delete(`/api/subjects/${created.body._id}`)
      .set('Cookie', cookieB);

    expect(res.status).toBe(404); // owner mismatch means "not found," not "forbidden" — deliberately vague
  });

  it('cascades deletion to notes within the subject', async () => {
    const cookie = await registerAndLogin('cascade@example.com');

    const subjectRes = await request(app)
      .post('/api/subjects')
      .set('Cookie', cookie)
      .send({ title: 'Chemistry' });
    const subjectId = subjectRes.body._id;

    // Create a note directly via the model, since noteRoutes isn't mounted in this file
    const meRes = await request(app).get('/api/auth/me').set('Cookie', cookie);
    await Note.create({
      title: 'Test Note',
      body: '<p>content</p>',
      subject: subjectId,
      owner: meRes.body._id,
    });

    await request(app).delete(`/api/subjects/${subjectId}`).set('Cookie', cookie);

    const remainingNotes = await Note.find({ subject: subjectId });
    expect(remainingNotes).toHaveLength(0);
  });
});