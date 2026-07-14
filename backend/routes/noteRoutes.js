const express = require('express');
const Note = require('../models/Note');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// GET /api/notes?subject=<subjectId>
router.get('/', async (req, res) => {
  const filter = { owner: req.userId };
  if (req.query.subject) filter.subject = req.query.subject;
  const notes = await Note.find(filter).sort({ createdAt: -1 });
  res.json(notes);
});

// POST /api/notes
router.post('/', async (req, res) => {
  const { title, body, subject } = req.body;
  if (!title || !body || !subject) {
    return res.status(400).json({ error: 'Title, body, and subject are required' });
  }
  const note = await Note.create({ title, body, subject, owner: req.userId });
  res.status(201).json(note);
});

// PUT /api/notes/:id
router.put('/:id', async (req, res) => {
  const { title, body } = req.body;
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { title, body },
    { new: true } // return the updated doc, not the old one
  );
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

// DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  const deleted = await Note.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!deleted) return res.status(404).json({ error: 'Note not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;

// Flashcard routes and Cheatsheet routes: copy this file, swap Note -> Flashcard/Cheatsheet,
// and swap { title, body } for the relevant fields ({ front, back } or { title, content }).