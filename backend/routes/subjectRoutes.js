const express = require('express');
const Subject = require('../models/Subject');
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

  const subject = await Subject.create({ title, owner: req.userId });
  res.status(201).json(subject);
});

// DELETE /api/subjects/:id
router.delete('/:id', async (req, res) => {
  // Match on BOTH id and owner — prevents a user from deleting someone else's subject
  // by just guessing/changing the id in the URL
  const deleted = await Subject.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!deleted) return res.status(404).json({ error: 'Subject not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;