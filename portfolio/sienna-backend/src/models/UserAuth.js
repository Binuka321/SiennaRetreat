const mongoose = require('mongoose');

const UserAuthSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserAuth', UserAuthSchema);
