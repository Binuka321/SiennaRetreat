const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  // Room reference
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },

  // User details
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },

  // Booking dates
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },

  // Room details at booking time
  roomType: String,
  roomTitle: String,
  roomPrice: String,

  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  },

  // Number of guests
  numberOfGuests: {
    type: Number,
    min: 1,
    default: 1
  },

  // Special requests (optional)
  specialRequests: String

  ,
  // External source tracking to avoid duplicate imports
  source: { type: String }, // e.g., 'airbnb', 'booking.com', 'ical'
  externalId: { type: String } // id from external calendar event

}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
