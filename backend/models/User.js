const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // stores the HASH, never plaintext
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Runs automatically before a user document is saved
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // only re-hash if password changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to check a login attempt against the stored hash
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);