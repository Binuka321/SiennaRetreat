const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// Get all bookings (admin only)
exports.getAllBookings = async (req, res) => {
  try {
    console.log('[Admin] MongoDB connection state:', mongoose.connection.readyState); // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    console.log('[Admin] Fetching all bookings from Booking collection...');
    const bookings = await Booking.find({})
      .populate('roomId', 'title img price')
      .sort({ checkInDate: -1 });
    
    console.log(`[Admin] Found ${bookings.length} bookings`);
    res.json(bookings);
  } catch (err) {
    console.error('[Admin] Get all bookings error:', err.message || err);
    console.error('[Admin] Stack:', err.stack);
    // Return empty array instead of error to allow UI to render
    res.json([]);
  }
};

// Create a booking
exports.create = async (req, res) => {
  try {
    const { roomId, userEmail, userName, userPhone, checkInDate, checkOutDate, roomType, roomTitle, roomPrice, numberOfGuests, specialRequests } = req.body;
    
    if (!roomId || !userEmail || !userName || !userPhone || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const booking = new Booking({
      roomId,
      userEmail,
      userName,
      userPhone,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      roomType,
      roomTitle,
      roomPrice,
      numberOfGuests: numberOfGuests || 1,
      specialRequests: specialRequests || '',
      status: 'confirmed'
    });

    const saved = await booking.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create booking error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
