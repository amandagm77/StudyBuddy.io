const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const Note = require('../models/Note');
const Quiz = require('../models/Quiz');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Only instantiate the client if the key exists — lets us give a clear error instead of a crash
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// POST /api/quizzes/generate
// Body: { subjectId: string, noteIds: string[], numQuestions: number }
router.post('/generate', async (req, res) => {
  // Fail fast with a clear message if the key was never configured
  if (!anthropic) {
    return res.status(500).json({ error: 'AI service is not configured (missing API key)' });
  }

  const { subjectId, noteIds, numQuestions = 5 } = req.body;

  if (!subjectId || !noteIds?.length) {
    return res.status(400).json({ error: 'subjectId and at least one noteId are required' });
  }

  try {
    // Only pull notes that belong to THIS user — same ownership check pattern as everywhere else
    const notes = await Note.find({ _id: { $in: noteIds }, owner: req.userId });
    if (notes.length === 0) {
      return res.status(404).json({ error: 'No matching notes found' });
    }

    // Combine note content into one block of study material for Claude to read
    const studyMaterial = notes
      .map((n) => `Title: ${n.title}\n${n.body}`)
      .join('\n\n---\n\n');

    // The prompt is the core "product" decision here: we ask for STRICT JSON,
    // matching the exact shape our Quiz model and React UI expect, so we can
    // parse it directly with no manual cleanup.
    const prompt = `You are a study assistant helping a student review their notes.

Below is the student's study material:
"""
${studyMaterial}
"""

Generate exactly ${numQuestions} multiple-choice quiz questions that test understanding of this material.

Respond with ONLY valid JSON, no other text, no markdown code fences, in exactly this shape:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "string, briefly explaining why the correct answer is right"
    }
  ]
}

Rules:
- Exactly 4 options per question.
- correctIndex is a 0-based index (0, 1, 2, or 3) pointing to the correct option.
- Base every question strictly on the provided material — do not invent facts not present in it.
- Vary difficulty and question phrasing across the set.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = response.content[0].text;

    // Claude can occasionally wrap JSON in ```json fences despite instructions — strip defensively
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse Claude response as JSON:', rawText);
      return res.status(502).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return res.status(502).json({ error: 'AI response did not contain valid questions' });
    }

    // Persist the quiz so it can be retaken later
    const quiz = await Quiz.create({
      subject: subjectId,
      owner: req.userId,
      questions: parsed.questions,
    });

    res.status(201).json(quiz);
  } catch (err) {
    // Distinguish Anthropic-specific errors from generic ones for clearer debugging
    if (err.status === 401) {
      console.error('Anthropic auth error:', err.message);
      return res.status(500).json({ error: 'AI service authentication failed (check API key)' });
    }
    if (err.status === 429) {
      console.error('Anthropic rate limit hit:', err.message);
      return res.status(429).json({ error: 'AI service is busy right now. Please try again shortly.' });
    }
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// GET /api/quizzes?subject=<subjectId> — view past quizzes for retaking
router.get('/', async (req, res) => {
  const filter = { owner: req.userId };
  if (req.query.subject) filter.subject = req.query.subject;
  const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
  res.json(quizzes);
});

module.exports = router;