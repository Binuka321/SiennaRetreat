const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Return raw rooms (no availability mapping) - useful for debugging DB contents
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json({ count: rooms.length, rooms });
  } catch (err) {
    console.error('debug /rooms error', err && err.stack ? err.stack : err);
    res.status(500).json({ message: 'Failed to fetch rooms', error: err && err.message ? err.message : String(err) });
  }
});

// Return raw bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('roomId');
    res.json({ count: bookings.length, bookings });
  } catch (err) {
    console.error('debug /bookings error', err && err.stack ? err.stack : err);
    res.status(500).json({ message: 'Failed to fetch bookings', error: err && err.message ? err.message : String(err) });
  }
});

module.exports = router;
