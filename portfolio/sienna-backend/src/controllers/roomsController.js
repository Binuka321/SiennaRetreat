const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Get all rooms
exports.getAll = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Search for available rooms by date range
exports.search = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, roomType } = req.query;

    // Validate dates
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'checkInDate and checkOutDate are required' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({ message: 'checkInDate must be before checkOutDate' });
    }

    // Get all rooms (filtered by type if provided)
    let roomQuery = {};
    if (roomType) {
      roomQuery.type = roomType;
    }
    const rooms = await Room.find(roomQuery);

    // Check availability for each room
    const availableRooms = await Promise.all(
      rooms.map(async (room) => {
        // Find bookings that overlap with the requested date range
        const conflictingBookings = await Booking.findOne({
          roomId: room._id,
          status: 'confirmed',
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn }
        });

        return {
          ...room.toObject(),
          isAvailable: !conflictingBookings
        };
      })
    );

    res.json(availableRooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get single room by ID
exports.getById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Create a new booking
exports.book = async (req, res) => {
  try {
    const { roomId, userEmail, userName, userPhone, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;

    // Validate required fields
    if (!roomId || !userEmail || !userName || !userPhone || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({ message: 'checkInDate must be before checkOutDate' });
    }

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room is available for the requested dates
    const conflictingBooking = await Booking.findOne({
      roomId,
      status: 'confirmed',
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn }
    });

    if (conflictingBooking) {
      return res.status(409).json({ message: 'Room is not available for the selected dates' });
    }

    // Create the booking
    const booking = new Booking({
      roomId,
      userEmail,
      userName,
      userPhone,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests: numberOfGuests || 1,
      specialRequests,
      roomType: room.type,
      roomTitle: room.title,
      roomPrice: room.price,
      status: 'confirmed'
    });

    const savedBooking = await booking.save();
    res.status(201).json({
      message: 'Booking confirmed successfully',
      booking: savedBooking
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get all bookings (admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('roomId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
