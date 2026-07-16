const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
  {
    front: { type: String, required: true, trim: true, maxlength: 100 },
    back: { type: String, required: true, trim: true, maxlength: 100 },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flashcard', flashcardSchema);