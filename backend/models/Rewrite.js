const mongoose = require('mongoose');

const rewriteSchema = new mongoose.Schema(
  {
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalText: { type: String, required: true },
    rewrittenText: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rewrite', rewriteSchema);