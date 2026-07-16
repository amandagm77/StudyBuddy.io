const mongoose = require('mongoose');

const cheatsheetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    frontContent: { type: String, default: '' }, // Quill HTML — side 1
    backContent: { type: String, default: '' }, // Quill HTML — side 2
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cheatsheet', cheatsheetSchema);