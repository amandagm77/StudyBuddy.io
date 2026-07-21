const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// POST /api/contact
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message can't be blank" });
  }

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  await ContactMessage.create({
    user: user._id,
    name: user.name,
    email: user.email,
    message: message.trim(),
  });

  res.status(201).json({ message: 'Submitted' });
});

module.exports = router;