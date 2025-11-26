const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController');

router.get('/:email', controller.getByEmail);
router.post('/', controller.createOrUpdate);

module.exports = router;
