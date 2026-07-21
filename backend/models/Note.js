const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 30 },
    body: { type: String, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);

// NOTE: Flashcard.js and Cheatsheet.js will look almost identical to this.
// Flashcard: { front: String, back: String, subject, owner }
// Cheatsheet: { title: String, content: String, subject, owner }