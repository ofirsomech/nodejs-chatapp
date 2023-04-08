const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// GET route for retrieving all messages
router.get('/', messageController.getAllMessages);

// POST route for creating a new message
router.post('/', messageController.createMessage);

module.exports = router;
