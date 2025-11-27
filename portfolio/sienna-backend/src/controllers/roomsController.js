const Room = require('../models/Room');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// Mock rooms for development when DB is unavailable
const MOCK_ROOMS = [
  {
    _id: '507f1f77bcf86cd799439011',
    type: 'double',
    title: 'Double Room with Garden View',
    price: '$15/night',
    details: '12 m² | 1-3 guests | Free WIFI',
    img: '/assets/room1.jpg'
  },
  {
    _id: '507f1f77bcf86cd799439012',
    type: 'shared',
    title: 'Family Room with Shared Bathroom',
    price: '$20/night',
    details: '20 m² | 2-4 guests | Free WIFI',
    img: '/assets/room2.jpg'
  },
  {
    _id: '507f1f77bcf86cd799439013',
    type: 'Twin',
    title: 'Double or Twin Room with Shared Bathroom',
    price: '$18/night',
    details: '15 m² | 1-3 guests | Free WIFI',
    img: '/assets/room3.jpg'
  }
];

function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

// ---------------------- GET ALL ROOMS ----------------------
exports.getAll = async (req, res) => {
  try {
    if (!isDBConnected()) {
      console.log('[getAll] DB not connected → returning mock rooms');
      return res.json(MOCK_ROOMS);
    }
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    console.log('[getAll] DB error → fallback to mock rooms');
    res.json(MOCK_ROOMS);
  }
};

// ---------------------- SEARCH ROOMS (MULTI-TYPE, MULTI-ROOM SUPPORT, CURRENT-DAY ONWARD) ----------------------
exports.search = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, roomTypes } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'checkInDate and checkOutDate are required' });
    }

    const today = new Date();
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Ensure search is for current day or later
    if (checkIn < today.setHours(0,0,0,0)) {
      return res.status(400).json({ message: 'checkInDate must be today or later' });
    }

    if (checkIn >= checkOut) {
      return res.status(400).json({ message: 'checkInDate must be before checkOutDate' });
    }

    // Normalize requested room types
    let requestedTypes = [];
    if (roomTypes) {
      requestedTypes = Array.isArray(roomTypes)
        ? roomTypes.map(t => t.trim().toLowerCase())
        : roomTypes.split(',').map(t => t.trim().toLowerCase());
    }

    // MOCK fallback if DB not connected
    if (!isDBConnected()) {
      const filtered = requestedTypes.length > 0
        ? MOCK_ROOMS.filter(r => requestedTypes.includes(r.type.toLowerCase()))
        : MOCK_ROOMS;

      return res.json(filtered.map(r => ({ ...r, isAvailable: true })));
    }

    // Build query for multiple types
    let roomQuery = {};
    if (requestedTypes.length === 1) roomQuery.type = new RegExp(`^${requestedTypes[0]}$`, 'i');
    else if (requestedTypes.length > 1) roomQuery.type = { $in: requestedTypes.map(t => new RegExp(`^${t}$`, 'i')) };

    const rooms = await Room.find(roomQuery);

    const availableRooms = [];
    for (const room of rooms) {
      const conflictingBookings = await Booking.find({
        roomId: room._id,
        status: 'confirmed',
        checkInDate: { $lt: checkOut },
        checkOutDate: { $gt: checkIn }
      });

      availableRooms.push({
        ...room.toObject(),
        isAvailable: conflictingBookings.length === 0
      });
    }

    const finalAvailableRooms = availableRooms.filter(r => r.isAvailable);

    // Group by type if requestedTypes exists
    let result;
    if (requestedTypes.length > 0) {
      result = requestedTypes.map(type => ({
        type,
        rooms: finalAvailableRooms.filter(r => r.type.toLowerCase() === type)
      })).filter(group => group.rooms.length > 0); // remove empty groups
    } else {
      result = finalAvailableRooms;
    }

    res.json(result);

  } catch (err) {
    console.error('[search] error:', err);

    // fallback to mock rooms
    const filtered = roomTypes
      ? MOCK_ROOMS.filter(r => roomTypes.split(',').map(t => t.trim().toLowerCase()).includes(r.type.toLowerCase()))
      : MOCK_ROOMS;

    res.json(filtered.map(r => ({ ...r, isAvailable: true })));
  }
};

// ---------------------- GET SINGLE ROOM BY ID ----------------------
exports.getById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// ---------------------- BOOK ROOM ----------------------
exports.book = async (req, res) => {
  try {
    const { roomId, userEmail, userName, userPhone, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;

    if (!roomId || !userEmail || !userName || !userPhone || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const today = new Date();
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn < today.setHours(0,0,0,0)) {
      return res.status(400).json({ message: 'checkInDate must be today or later' });
    }

    if (checkIn >= checkOut) {
      return res.status(400).json({ message: 'checkInDate must be before checkOutDate' });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const conflicting = await Booking.find({
      roomId,
      status: 'confirmed',
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn }
    });

    if (conflicting.length > 0) {
      return res.status(409).json({ message: 'Room is not available for the selected dates' });
    }

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
    res.status(201).json({ message: 'Booking confirmed successfully', booking: savedBooking });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// ---------------------- BOOK MULTIPLE ROOMS ----------------------
exports.bookMultiple = async (req, res) => {
  const session = await Booking.startSession();
  try {
    const { roomIds, userEmail, userName, userPhone, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;

    if (!roomIds || !Array.isArray(roomIds) || roomIds.length === 0 ||
      !userEmail || !userName || !userPhone || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const today = new Date();
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn < today.setHours(0,0,0,0)) {
      return res.status(400).json({ message: 'checkInDate must be today or later' });
    }

    if (checkIn >= checkOut) return res.status(400).json({ message: 'checkInDate must be before checkOutDate' });

    const rooms = await Room.find({ _id: { $in: roomIds } });
    if (rooms.length !== roomIds.length) {
      return res.status(404).json({ message: 'One or more rooms not found' });
    }

    const conflicts = [];
    for (const room of rooms) {
      const conflicting = await Booking.find({
        roomId: room._id,
        status: 'confirmed',
        checkInDate: { $lt: checkOut },
        checkOutDate: { $gt: checkIn }
      });
      if (conflicting.length > 0) conflicts.push({ roomId: room._id, title: room.title });
    }

    if (conflicts.length > 0) {
      return res.status(409).json({ message: 'One or more rooms are not available', conflicts });
    }

    let createdBookings = [];
    try {
      await session.withTransaction(async () => {
        const docs = rooms.map(room => ({
          roomId: room._id,
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
        }));
        createdBookings = await Booking.insertMany(docs, { session });
      });
    } catch {
      createdBookings = [];
      for (const room of rooms) {
        createdBookings.push(await new Booking({
          roomId: room._id,
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
        }).save());
      }
    }

    res.status(201).json({ message: 'Bookings confirmed successfully', bookings: createdBookings });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  } finally {
    session.endSession();
  }
};

// ---------------------- GET ALL BOOKINGS (ADMIN) ----------------------
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('roomId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// ---------------------- CANCEL BOOKING ----------------------
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({ message: 'Booking cancelled successfully', booking });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// ---------------------- SIMPLE SEARCH ----------------------
exports.searchSimple = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, roomTypes } = req.query;

    if (!checkInDate || !checkOutDate) return res.status(400).json({ message: 'checkInDate and checkOutDate are required' });

    const today = new Date();
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn < today.setHours(0,0,0,0)) {
      return res.status(400).json({ message: 'checkInDate must be today or later' });
    }

    if (checkIn >= checkOut) return res.status(400).json({ message: 'checkInDate must be before checkOutDate' });

    // Normalize room types
    let requestedTypes = [];
    if (roomTypes) {
      requestedTypes = Array.isArray(roomTypes)
        ? roomTypes.map(t => t.trim().toLowerCase())
        : roomTypes.split(',').map(t => t.trim().toLowerCase());
    }

    let roomQuery = {};
    if (requestedTypes.length === 1) roomQuery.type = new RegExp(`^${requestedTypes[0]}$`, 'i');
    else if (requestedTypes.length > 1) roomQuery.type = { $in: requestedTypes.map(t => new RegExp(`^${t}$`, 'i')) };

    const rooms = await Room.find(roomQuery);

    res.json(rooms.map(room => ({ ...room.toObject(), isAvailable: true })));

  } catch (err) {
    res.status(500).json({ message: 'Server error in searchSimple', error: err });
  }
};
