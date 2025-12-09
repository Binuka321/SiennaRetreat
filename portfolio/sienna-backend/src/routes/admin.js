const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');
const bookingsController = require('../controllers/bookingsController');
const usersController = require('../controllers/usersController');
const mongoose = require('mongoose');

// POST /api/admin/login -> returns JWT token when credentials match
router.post('/login', controller.login);

// Example protected route: GET /api/admin/ping
router.get('/ping', controller.requireAdmin, (req, res) => {
  res.json({ ok: true, message: 'pong', admin: req.admin });
});

// GET /api/admin/status -> check database connection (protected)
router.get('/status', controller.requireAdmin, (req, res) => {
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({
    mongoDBStatus: readyStates[mongoose.connection.readyState] || 'unknown',
    mongoDBReadyState: mongoose.connection.readyState
  });
});

// GET /api/admin/debug -> check collection counts (protected)
router.get('/debug', controller.requireAdmin, async (req, res) => {
  try {
    const UserProfile = require('../models/UserProfile');
    const Booking = require('../models/Booking');
    
    const userCount = await UserProfile.countDocuments();
    const bookingCount = await Booking.countDocuments();
    
    res.json({
      mongoDBConnected: mongoose.connection.readyState === 1,
      collections: {
        UserProfile: userCount,
        Booking: bookingCount
      }
    });
  } catch (err) {
    res.json({
      error: err.message,
      mongoDBConnected: mongoose.connection.readyState === 1
    });
  }
});

// UNPROTECTED TEST ROUTE - for debugging only
// POST /api/admin/seed-test-data -> create sample users and bookings
router.post('/seed-test-data', async (req, res) => {
  try {
    console.log('[SEED] Starting test data creation...');
    const UserProfile = require('../models/UserProfile');
    const Booking = require('../models/Booking');
    const Room = require('../models/Room');
    
    // Sample users
    const sampleUsers = [
      { email: 'john@example.com', name: 'John Doe', phone: '+1-555-0101', address: '123 Main St, New York' },
      { email: 'jane@example.com', name: 'Jane Smith', phone: '+1-555-0102', address: '456 Oak Ave, Boston' },
      { email: 'bob@example.com', name: 'Bob Johnson', phone: '+1-555-0103', address: '789 Pine Rd, Chicago' },
      { email: 'alice@example.com', name: 'Alice Williams', phone: '+1-555-0104', address: '321 Elm St, San Francisco' },
    ];
    
    // Clear existing test data (optional - comment out to keep existing data)
    // await UserProfile.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });
    
    // Insert users
    const createdUsers = await UserProfile.insertMany(sampleUsers, { ordered: false }).catch(err => {
      console.log('[SEED] Users may already exist (duplicate key), that\'s okay');
      return [];
    });
    
    console.log('[SEED] Created/verified', createdUsers.length, 'users');
    
    // Get or create sample rooms for bookings
    const rooms = await Room.find({}).limit(3);
    
    if (rooms.length === 0) {
      console.log('[SEED] No rooms found in database. Bookings need valid room references.');
      return res.json({
        success: true,
        message: 'Sample users created. Add rooms via /api/rooms endpoint for bookings.',
        usersCreated: sampleUsers.length
      });
    }
    
    // Sample bookings for the next 30 days
    const today = new Date();
    const sampleBookings = [
      {
        roomId: rooms[0]._id,
        userEmail: 'john@example.com',
        userName: 'John Doe',
        userPhone: '+1-555-0101',
        checkInDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
        checkOutDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
        roomType: rooms[0].type,
        roomTitle: rooms[0].title,
        roomPrice: rooms[0].price,
        numberOfGuests: 2,
        specialRequests: 'High floor preferred'
      },
      {
        roomId: rooms[1]._id,
        userEmail: 'jane@example.com',
        userName: 'Jane Smith',
        userPhone: '+1-555-0102',
        checkInDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
        checkOutDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
        roomType: rooms[1].type,
        roomTitle: rooms[1].title,
        roomPrice: rooms[1].price,
        numberOfGuests: 1,
        specialRequests: 'Quiet room needed'
      },
      {
        roomId: rooms[2]._id,
        userEmail: 'bob@example.com',
        userName: 'Bob Johnson',
        userPhone: '+1-555-0103',
        checkInDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12),
        checkOutDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15),
        roomType: rooms[2].type,
        roomTitle: rooms[2].title,
        roomPrice: rooms[2].price,
        numberOfGuests: 3,
        specialRequests: 'Need crib for baby'
      },
      {
        roomId: rooms[0]._id,
        userEmail: 'alice@example.com',
        userName: 'Alice Williams',
        userPhone: '+1-555-0104',
        checkInDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 18),
        checkOutDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 22),
        roomType: rooms[0].type,
        roomTitle: rooms[0].title,
        roomPrice: rooms[0].price,
        numberOfGuests: 2,
        specialRequests: null
      }
    ];
    
    const createdBookings = await Booking.insertMany(sampleBookings, { ordered: false }).catch(err => {
      console.log('[SEED] Bookings may already exist, that\'s okay');
      return [];
    });
    
    console.log('[SEED] Created/verified', createdBookings.length, 'bookings');
    
    res.json({
      success: true,
      usersCreated: sampleUsers.length,
      bookingsCreated: sampleBookings.length,
      message: 'Test data seeded successfully! Refresh admin panel to see users and bookings on calendar.'
    });
  } catch (err) {
    console.error('[SEED] Error:', err.message);
    res.json({
      success: false,
      error: err.message
    });
  }
});

// Protected routes for admin dashboard
// GET /api/admin/users -> list all users
router.get('/users', controller.requireAdmin, usersController.getAllUsers);

// GET /api/admin/bookings -> list all bookings
router.get('/bookings', controller.requireAdmin, bookingsController.getAllBookings);

// Cancel a booking (admin)
router.put('/bookings/:id/cancel', controller.requireAdmin, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update room details (admin)
router.put('/rooms/:id', controller.requireAdmin, async (req, res) => {
  try {
    const Room = require('../models/Room');
    const update = req.body || {};
    const room = await Room.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
