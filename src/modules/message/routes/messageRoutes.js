const express = require('express');
const messageController = require("../controllers/messageController");


module.exports = (io) => {
    const messageRouter = express.Router();
    const messageController = require('../controllers/messageController');

// GET route for retrieving all messages
    messageRouter.get('/', messageController.getAllMessages);

// POST route for creating a new message
    messageRouter.post('/', (req, res) => messageController.createMessage(req, res, io));

    return messageRouter;
};
