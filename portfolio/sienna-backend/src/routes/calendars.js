const express = require('express');
const router = express.Router();
const controller = require('../controllers/calendarController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, controller.addFeed);
router.get('/', authMiddleware, controller.listFeeds);
router.delete('/:id', authMiddleware, controller.removeFeed);

// Export iCal for room
router.get('/export/:roomId.ics', controller.exportRoomIcal);
// Get list of rooms with export URLs
router.get('/room-links', controller.roomLinks);

module.exports = router;
