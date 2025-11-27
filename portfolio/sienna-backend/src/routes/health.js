const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', (req, res) => {
  res.json({ status: 'ok', dbReadyState: mongoose.connection.readyState });
});

module.exports = router;
