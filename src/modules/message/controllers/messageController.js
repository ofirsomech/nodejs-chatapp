const Message = require('../models/messageModel');

// Function to retrieve all messages from the database
const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Function to create a new message in the database
const createMessage = async (req, res) => {
    const { name, message } = req.body;
    const newMessage = new Message({ name, message });

    try {
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllMessages,
    createMessage,
};
