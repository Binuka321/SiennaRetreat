const mongoose = require('mongoose');

const ExternalCalendarSchema = new mongoose.Schema({
  name: String,
  provider: String, // e.g., 'airbnb', 'booking.com', 'ical'
  url: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  active: { type: Boolean, default: true },
  lastFetched: Date,
}, { timestamps: true });

module.exports = mongoose.model('ExternalCalendar', ExternalCalendarSchema);
