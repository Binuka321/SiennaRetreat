const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  photoURL: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', UserProfileSchema);
