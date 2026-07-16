const mongoose = require('mongoose');

const rewriteSchema = new mongoose.Schema(
  {
    // Exactly one of these two will be set, depending on what was rewritten
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    cheatsheet: { type: mongoose.Schema.Types.ObjectId, ref: 'Cheatsheet' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalText: { type: String, required: true },
    rewrittenText: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rewrite', rewriteSchema);