const express = require('express');
const router = express.Router();
const controller = require('../controllers/roomsController');

// Get all rooms
router.get('/', controller.getAll);

// Search for available rooms by date range
router.get('/search', controller.search);

// Simplified search (for debugging)
router.get('/search-simple', controller.searchSimple);

// Get single room by ID
router.get('/:id', controller.getById);

// Create a new booking
router.post('/book', controller.book);
// Create bookings for multiple rooms
router.post('/book-multiple', controller.bookMultiple);

// Get all bookings (admin)
router.get('/bookings', controller.getAllBookings);

// Cancel a booking
router.put('/:id/cancel', controller.cancelBooking);

module.exports = router;
