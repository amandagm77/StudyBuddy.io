const express = require('express');
const Flashcard = require('../models/Flashcard');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const MAX_PER_SUBJECT = 15;
const MAX_CHARS = 100;

// GET /api/flashcards?subject=<subjectId>
router.get('/', async (req, res) => {
  const filter = { owner: req.userId };
  if (req.query.subject) filter.subject = req.query.subject;
  const flashcards = await Flashcard.find(filter).sort({ createdAt: 1 });
  res.json(flashcards);
});

// POST /api/flashcards
router.post('/', async (req, res) => {
  const { front, back, subject } = req.body;

  if (!front || !back || !subject) {
    return res.status(400).json({ error: 'front, back, and subject are required' });
  }
  if (front.length > MAX_CHARS || back.length > MAX_CHARS) {
    return res.status(400).json({ error: `Front and back must each be ${MAX_CHARS} characters or fewer` });
  }

  // Enforce the 15-per-subject cap BEFORE inserting, to avoid a race where
  // two rapid requests both pass the check — acceptable tradeoff for this scale of app
  const count = await Flashcard.countDocuments({ subject, owner: req.userId });
  if (count >= MAX_PER_SUBJECT) {
    return res.status(400).json({ error: `This subject already has the maximum of ${MAX_PER_SUBJECT} flashcards` });
  }

  const flashcard = await Flashcard.create({ front, back, subject, owner: req.userId });
  res.status(201).json(flashcard);
});

// DELETE /api/flashcards?subject=<subjectId> — bulk delete all flashcards in a subject
router.delete('/', async (req, res) => {
  const { subject } = req.query;
  if (!subject) {
    return res.status(400).json({ error: 'subject query parameter is required' });
  }
  const result = await Flashcard.deleteMany({ subject, owner: req.userId });
  res.json({ message: 'Deleted', count: result.deletedCount });
});

// DELETE /api/flashcards/:id
router.delete('/:id', async (req, res) => {
  const deleted = await Flashcard.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!deleted) return res.status(404).json({ error: 'Flashcard not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;