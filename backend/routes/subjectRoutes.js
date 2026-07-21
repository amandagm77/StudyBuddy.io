const express = require('express');
const Subject = require('../models/Subject');
const Note = require('../models/Note');
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');
const Cheatsheet = require('../models/Cheatsheet');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth); // every route below this line requires login

// GET /api/subjects — only this user's subjects
router.get('/', async (req, res) => {
  const subjects = await Subject.find({ owner: req.userId }).sort({ createdAt: -1 });
  res.json(subjects);
});

// POST /api/subjects
router.post('/', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (title.length > 30) return res.status(400).json({ error: 'Title must be 30 characters or fewer' });

  const subject = await Subject.create({ title, owner: req.userId });
  res.status(201).json(subject);
});

// GET /api/subjects/:id — fetch one subject (used by Flashcards/Cheatsheet pages)
router.get('/:id', async (req, res) => {
  const subject = await Subject.findOne({ _id: req.params.id, owner: req.userId });
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  res.json(subject);
});

// DELETE /api/subjects — bulk delete ALL subjects and everything under them
router.delete('/', async (req, res) => {
  await Subject.deleteMany({ owner: req.userId });
  await Note.deleteMany({ owner: req.userId });
  await Quiz.deleteMany({ owner: req.userId });
  await Flashcard.deleteMany({ owner: req.userId });
  await Cheatsheet.deleteMany({ owner: req.userId });
  res.json({ message: 'Deleted' });
});

// DELETE /api/subjects/:id
router.delete('/:id', async (req, res) => {
  // Match on BOTH id and owner — prevents a user from deleting someone else's subject
  // by just guessing/changing the id in the URL
  const deleted = await Subject.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!deleted) return res.status(404).json({ error: 'Subject not found' });

  // Cascade delete: without this, notes/quizzes referencing this subject would
  // become orphaned in MongoDB — invisible in the UI but still taking up space
  // and no longer tied to a real subject.
  await Note.deleteMany({ subject: req.params.id, owner: req.userId });
  await Quiz.deleteMany({ subject: req.params.id, owner: req.userId });
  await Flashcard.deleteMany({ subject: req.params.id, owner: req.userId });
  await Cheatsheet.deleteMany({ subject: req.params.id, owner: req.userId });

  res.json({ message: 'Deleted' });
});

module.exports = router;