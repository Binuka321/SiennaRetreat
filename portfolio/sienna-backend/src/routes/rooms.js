const express = require('express');
const router = express.Router();
const controller = require('../controllers/roomsController');

// Get all rooms
router.get('/', controller.getAll);

// Search for available rooms by date range
router.get('/search', controller.search);

// Get single room by ID
router.get('/:id', controller.getById);

// Create a new booking
router.post('/book', controller.book);

// Get all bookings (admin)
router.get('/bookings', controller.getAllBookings);

// Cancel a booking
router.put('/:id/cancel', controller.cancelBooking);

module.exports = router;
