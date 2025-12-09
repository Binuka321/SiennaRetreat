const UserProfile = require('../models/UserProfile');
const mongoose = require('mongoose');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    console.log('[Admin] MongoDB connection state:', mongoose.connection.readyState); // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    console.log('[Admin] Fetching all users from UserProfile collection...');
    
    const users = await UserProfile.find({}).sort({ createdAt: -1 });
    console.log(`[Admin] Found ${users.length} users`);
    res.json(users);
  } catch (err) {
    console.error('[Admin] Get all users error:', err.message || err);
    console.error('[Admin] Stack:', err.stack);
    // Return empty array instead of error to allow UI to render
    res.json([]);
  }
};

exports.getByEmail = async (req, res) => {
  try {
    const user = await UserProfile.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

exports.createOrUpdate = async (req, res) => {
  try {
    const { name, phone, address, photoURL } = req.body;
    const email = req.params.email || req.body.email; // Get email from URL param or body
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await UserProfile.findOneAndUpdate(
      { email },
      { name, phone, address, photoURL },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(user);
  } catch (err) {
    console.error('[Users] Update profile error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
