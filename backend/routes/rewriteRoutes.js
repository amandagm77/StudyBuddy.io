const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const Note = require('../models/Note');
const Cheatsheet = require('../models/Cheatsheet');
const Rewrite = require('../models/Rewrite');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Same pattern as quizRoutes.js: only instantiate if the key exists
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Same stripping helper as quizRoutes.js — Claude should read clean text, not HTML markup
function stripHtml(html) {
  return html
    .replace(/<\/(p|li|div)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&') // must run after other &xxx; replacements, not before
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

// POST /api/rewrites/generate
// Body: EITHER { noteId } OR { cheatsheetId, side: 'front' | 'back' }
router.post('/generate', async (req, res) => {
  if (!anthropic) {
    return res.status(500).json({ error: 'AI service is not configured (missing API key)' });
  }

  const { noteId, cheatsheetId, side } = req.body;
  if (!noteId && !cheatsheetId) {
    return res.status(400).json({ error: 'Either noteId or cheatsheetId is required' });
  }
  if (cheatsheetId && side !== 'front' && side !== 'back') {
    return res.status(400).json({ error: 'side must be "front" or "back" when using cheatsheetId' });
  }

  try {
    // Ownership check — same as everywhere else, never trust the client's id alone
    let originalHtml;
    if (noteId) {
      const note = await Note.findOne({ _id: noteId, owner: req.userId });
      if (!note) return res.status(404).json({ error: 'Note not found' });
      originalHtml = note.body;
    } else {
      const cheatsheet = await Cheatsheet.findOne({ _id: cheatsheetId, owner: req.userId });
      if (!cheatsheet) return res.status(404).json({ error: 'Cheatsheet not found' });
      originalHtml = side === 'front' ? cheatsheet.frontContent : cheatsheet.backContent;
    }

    const plainText = stripHtml(originalHtml);
    if (!plainText) {
      return res.status(400).json({ error: 'There is no content to rewrite yet' });
    }

    // Unlike the quiz prompt, we want plain text back, not JSON — so the
    // instructions are simpler, but still explicit about format to avoid
    // Claude adding a conversational preamble like "Sure, here's a rewrite:"
    const prompt = `Rewrite the following study material to be clearer and more concise, making it easier to read and remember. Preserve every fact, term, and detail — do not add information that isn't in the original, and do not remove any key facts.

Original:
"""
${plainText}
"""

Respond with ONLY the rewritten text. No preamble, no "Here is the rewritten version," no markdown headers, no explanation — just the rewritten text itself.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const rewrittenText = response.content[0].text.trim();

    if (!rewrittenText) {
      return res.status(502).json({ error: 'AI returned an empty response. Please try again.' });
    }

    const rewrite = await Rewrite.create({
      note: noteId || undefined,
      cheatsheet: cheatsheetId || undefined,
      owner: req.userId,
      originalText: plainText,
      rewrittenText,
    });

    res.status(201).json(rewrite);
  } catch (err) {
    // Identical error-handling shape to quizRoutes.js
    if (err.status === 401) {
      console.error('Anthropic auth error:', err.message);
      return res.status(500).json({ error: 'AI service authentication failed (check API key)' });
    }
    if (err.status === 429) {
      console.error('Anthropic rate limit hit:', err.message);
      return res.status(429).json({ error: 'AI service is busy right now. Please try again shortly.' });
    }
    console.error('Rewrite generation error:', err);
    res.status(500).json({ error: 'Failed to generate rewrite' });
  }
});

module.exports = router;