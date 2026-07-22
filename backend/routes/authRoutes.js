const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');
const crypto = require('crypto');
const PasswordResetCode = require('../models/PasswordResetCode');
const { sendResetCodeEmail } = require('../utils/mailer');

const router = express.Router();

// Shared cookie settings — httpOnly means client-side JS can NEVER read this cookie,
// which is what protects the token from XSS attacks stealing it.
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    if (name.length > 30) {
      return res.status(400).json({ error: 'Name must be 30 characters or fewer' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const user = await User.create({ email, password, name }); // password gets hashed by the pre-save hook
    const token = signToken(user._id);

    res.cookie('token', token, cookieOptions);
    res.status(201).json({ id: user._id, email: user.email, name: user.name });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    // Deliberately vague error message — don't reveal whether the email exists
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.cookie('token', token, cookieOptions);
    res.json({ id: user._id, email: user.email, name: user.name });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me — used by the frontend on page load to check "am I logged in?"
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PUT /api/auth/name — update display name, no password required (not security-sensitive)
router.put('/name', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be blank' });
    }
    if (name.length > 30) {
      return res.status(400).json({ error: 'Name must be 30 characters or fewer' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name: name.trim() },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update name' });
  }
});

// PUT /api/auth/email — update email, requires current password confirmation
router.put('/email', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newEmail } = req.body;
    if (!currentPassword || !newEmail) {
      return res.status(400).json({ error: 'Current password and new email are required' });
    }

    const user = await User.findById(req.userId);
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.email = newEmail.toLowerCase().trim();
    await user.save();

    res.json({ id: user._id, email: user.email, name: user.name });
  } catch (err) {
    // Mongoose throws error code 11000 on a duplicate unique-index violation (email already taken)
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// PUT /api/auth/password — update password, requires current password confirmation
router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and repeat password do not match' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword; // pre-save hook in User.js re-hashes this automatically
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Always respond the same way whether or not the account exists —
  // this prevents attackers from using this endpoint to discover which
  // emails have accounts on the site (a real security consideration)
  const genericResponse = {
    message: 'If an account with that email exists, a reset code has been sent.',
  };

  if (!user) {
    return res.json(genericResponse);
  }

  // Generate a random 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();
  const codeHash = await bcrypt.hash(code, 10);

  // Only one active code per user at a time
  await PasswordResetCode.deleteMany({ user: user._id });
  await PasswordResetCode.create({
    user: user._id,
    codeHash,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });

  try {
    await sendResetCodeEmail(user.email, code);
  } catch (err) {
    console.error('Failed to send reset email:', err);
    return res.status(500).json({ error: 'Failed to send reset email. Please try again.' });
  }

  res.json(genericResponse);
});

// POST /api/auth/verify-reset-code
router.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired code' });
  }

  const resetRecord = await PasswordResetCode.findOne({ user: user._id });
  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired code. Please request a new one.' });
  }

  if (resetRecord.attempts >= 5) {
    return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new code.' });
  }

  const isMatch = await bcrypt.compare(code, resetRecord.codeHash);
  if (!isMatch) {
    resetRecord.attempts += 1;
    await resetRecord.save();
    return res.status(400).json({ error: 'Incorrect code. Please try again.' });
  }

  // Code is correct — issue a short-lived, single-purpose token so the
  // final reset-password step doesn't need the code re-entered, but also
  // can't be used for anything except resetting THIS user's password
  const resetToken = jwt.sign(
    { userId: user._id, purpose: 'password-reset' },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );

  await PasswordResetCode.deleteOne({ _id: resetRecord._id }); // single-use

  res.json({ resetToken });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;
  if (!resetToken || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  let payload;
  try {
    payload = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Reset session expired. Please start over.' });
  }

  if (payload.purpose !== 'password-reset') {
    return res.status(401).json({ error: 'Invalid reset session.' });
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.password = newPassword; // pre-save hook rehashes automatically
  await user.save();

  res.json({ message: 'Password reset successful' });
});

module.exports = router;