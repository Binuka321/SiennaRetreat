const ExternalCalendar = require('../models/ExternalCalendar');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const ical = require('node-ical');
const icalGenerator = require('ical-generator');

// Add a new external calendar feed
exports.addFeed = async (req, res) => {
  try {
    const { name, provider, url, roomId } = req.body;
    if (!url) return res.status(400).json({ message: 'url required' });

    const feed = new ExternalCalendar({ name, provider, url, roomId });
    await feed.save();
    res.json(feed);
  } catch (err) {
    console.error('[Calendars] addFeed error', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listFeeds = async (req, res) => {
  try {
    const feeds = await ExternalCalendar.find({});
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.removeFeed = async (req, res) => {
  try {
    const id = req.params.id;
    await ExternalCalendar.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Export site's bookings for a room as iCal
exports.exportRoomIcal = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).send('Room not found');

    const bookings = await Booking.find({ roomId, status: 'confirmed' });
    const cal = icalGenerator({ name: `${room.title} - Sienna Retreat bookings` });

    bookings.forEach(b => {
      cal.createEvent({
        start: b.checkInDate,
        end: b.checkOutDate,
        summary: `Booked: ${b.userName}`,
        id: b.externalId || b._id.toString()
      });
    });

    res.setHeader('Content-Type', 'text/calendar');
    res.send(cal.toString());
  } catch (err) {
    console.error('[Calendars] export error', err.message);
    res.status(500).send('Server error');
  }
};

// Return room-wise export links (roomId, title, exportUrl)
exports.roomLinks = async (req, res) => {
  try {
    const rooms = await Room.find();
    const base = req.protocol + '://' + req.get('host');
    const links = rooms.map(r => ({
      roomId: r._id,
      title: r.title,
      exportUrl: `${base}/api/calendars/export/${r._id}.ics`
    }));
    res.json(links);
  } catch (err) {
    console.error('[Calendars] roomLinks error', err && err.message ? err.message : err);
    res.status(500).json({ message: 'Server error', error: err && err.message ? err.message : err });
  }
};

// Helper to fetch and import events from an iCal URL
exports.fetchAndImport = async (feed) => {
  try {
    const parsed = await ical.async.fromURL(feed.url);
    const events = Object.values(parsed).filter(e => e.type === 'VEVENT');

    for (const ev of events) {
      const externalId = ev.uid || ev.uid || ev.uid;
      // Convert DTSTART/DTEND to Date
      const start = ev.start || ev.dtstart;
      const end = ev.end || ev.dtend;
      if (!start || !end) continue;

      // Skip if already imported
      const exists = await Booking.findOne({ externalId, source: feed.provider });
      if (exists) continue;

      // Create a blocked booking for room (if roomId present) or skip
      if (feed.roomId) {
        // Check overlapping bookings to avoid duplicate blocks
        const overlap = await Booking.findOne({
          roomId: feed.roomId,
          status: { $in: ['confirmed', 'pending'] },
          checkInDate: { $lt: end },
          checkOutDate: { $gt: start }
        });
        if (overlap) {
          // already a booking/block for that range — skip
          continue;
        }
        // Use placeholder user info
        const booking = new Booking({
          roomId: feed.roomId,
          userEmail: `external@${feed.provider}`,
          userName: `External ${feed.provider}`,
          userPhone: '',
          checkInDate: start,
          checkOutDate: end,
          roomType: '',
          roomTitle: '',
          roomPrice: '',
          status: 'confirmed',
          numberOfGuests: 1,
          specialRequests: `Imported from ${feed.provider}`,
          source: feed.provider,
          externalId: externalId
        });
        await booking.save();
      }
    }

    feed.lastFetched = new Date();
    await feed.save();
    return true;
  } catch (err) {
    console.error('[Calendars] fetchAndImport error for feed', feed && feed._id, err.message);
    return false;
  }
};
