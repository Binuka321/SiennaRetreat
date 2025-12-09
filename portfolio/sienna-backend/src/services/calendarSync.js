const ExternalCalendar = require('../models/ExternalCalendar');
const calendarController = require('../controllers/calendarController');

// Simple periodic sync: fetch feeds every N milliseconds
const SYNC_INTERVAL_MS = parseInt(process.env.CALENDAR_SYNC_INTERVAL_MS || '300000', 10); // default 5 minutes

let timer = null;

async function syncOnce() {
  try {
    const feeds = await ExternalCalendar.find({ active: true });
    for (const feed of feeds) {
      await calendarController.fetchAndImport(feed);
    }
  } catch (err) {
    console.error('[CalendarSync] syncOnce error', err && err.message ? err.message : err);
  }
}

exports.start = () => {
  if (timer) return;
  // run immediately, then schedule
  syncOnce();
  timer = setInterval(syncOnce, SYNC_INTERVAL_MS);
};

exports.stop = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

module.exports = exports;
