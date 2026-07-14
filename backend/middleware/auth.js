const jwt = require('jsonwebtoken');

// This middleware runs before any "protected" route handler.
// It checks for a valid JWT in the httpOnly cookie and attaches the user id to req.
function requireAuth(req, res, next) {
  const token = req.cookies.token; // cookie-parser puts cookies here

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // now every protected route knows who's asking
    next(); // move on to the actual route handler
  } catch (err) {
    // Covers expired tokens and tampered/invalid tokens
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

module.exports = requireAuth;