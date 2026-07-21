const mongoose = require('mongoose');

const passwordResetCodeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    codeHash: { type: String, required: true }, // never store the raw 6-digit code
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 }, // caps brute-force guessing
  },
  { timestamps: true }
);

module.exports = mongoose.model('PasswordResetCode', passwordResetCodeSchema);