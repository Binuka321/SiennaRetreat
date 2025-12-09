const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware');

// Get user profile by email (public)
router.get('/profile/:email', controller.getByEmail);

// Create or update user profile (authenticated)
router.post('/', authMiddleware, controller.createOrUpdate);
router.put('/profile/:email', authMiddleware, controller.createOrUpdate);

module.exports = router;
