const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: String },
  details: { type: String },
  img: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
