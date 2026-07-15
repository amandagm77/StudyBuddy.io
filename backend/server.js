require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const noteRoutes = require('./routes/noteRoutes');
const quizRoutes = require('./routes/quizRoutes');

const app = express();

connectDB();

app.use(express.json()); // parse JSON request bodies
app.use(cookieParser()); // parse cookies into req.cookies
app.use(
  cors({
    origin: process.env.CLIENT_URL, // only allow your React app's origin
    credentials: true, // REQUIRED so the browser will send/receive cookies cross-origin
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/quizzes', quizRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));