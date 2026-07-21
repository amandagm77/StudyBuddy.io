const express = require('express');
const Cheatsheet = require('../models/Cheatsheet');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const MAX_PER_SUBJECT = 5;

// GET /api/cheatsheets?subject=<subjectId> — list cheatsheets for a subject
router.get('/', async (req, res) => {
  const filter = { owner: req.userId };
  if (req.query.subject) filter.subject = req.query.subject;
  const cheatsheets = await Cheatsheet.find(filter).sort({ updatedAt: -1 });
  res.json(cheatsheets);
});

// GET /api/cheatsheets/:id — fetch one full cheatsheet
router.get('/:id', async (req, res) => {
  const cheatsheet = await Cheatsheet.findOne({ _id: req.params.id, owner: req.userId });
  if (!cheatsheet) return res.status(404).json({ error: 'Cheatsheet not found' });
  res.json(cheatsheet);
});

// POST /api/cheatsheets — create a new cheatsheet for a subject
router.post('/', async (req, res) => {
  const { title, subject } = req.body;
  if (!title || !subject) {
    return res.status(400).json({ error: 'title and subject are required' });
  }
  if (title.length > 30) {
    return res.status(400).json({ error: 'Title must be 30 characters or fewer' });
  }

  const count = await Cheatsheet.countDocuments({ subject, owner: req.userId });
  if (count >= MAX_PER_SUBJECT) {
    return res.status(400).json({ error: `This subject already has the maximum of ${MAX_PER_SUBJECT} cheatsheets` });
  }

  const cheatsheet = await Cheatsheet.create({ title, subject, owner: req.userId, frontContent: '', backContent: '' });
  res.status(201).json(cheatsheet);
});

// PUT /api/cheatsheets/:id — update title, front content, and/or back content
router.put('/:id', async (req, res) => {
  const { title, frontContent, backContent } = req.body;
  const update = {};
  if (title !== undefined) update.title = title;
  if (frontContent !== undefined) update.frontContent = frontContent;
  if (backContent !== undefined) update.backContent = backContent;

  const cheatsheet = await Cheatsheet.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    update,
    { new: true }
  );
  if (!cheatsheet) return res.status(404).json({ error: 'Cheatsheet not found' });
  res.json(cheatsheet);
});

// DELETE /api/cheatsheets?subject=<subjectId> — bulk delete all cheatsheets in a subject
router.delete('/', async (req, res) => {
  const { subject } = req.query;
  if (!subject) {
    return res.status(400).json({ error: 'subject query parameter is required' });
  }
  const result = await Cheatsheet.deleteMany({ subject, owner: req.userId });
  res.json({ message: 'Deleted', count: result.deletedCount });
});

// DELETE /api/cheatsheets/:id
router.delete('/:id', async (req, res) => {
  const deleted = await Cheatsheet.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!deleted) return res.status(404).json({ error: 'Cheatsheet not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;