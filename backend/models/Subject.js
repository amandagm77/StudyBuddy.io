const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 30 },
    // Every subject belongs to exactly one user — this is how we scope/protect data
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);