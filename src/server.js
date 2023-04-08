const express = require('express');
const socket = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./modules/message/models/messageModel');
const {Server} = require("socket.io");

// App setup
const app = express();

// Use static files instead of routing
app.use(express.static('public'));

// Set the port
const port = process.env.PORT || 4000;

// Start the server and log the port
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

// Connect to MongoDB
const dbUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
mongoose.connect(`${dbUrl}/chat`, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});


io.on("connection", async (socket) => {
    console.log("We are connected");

    const messages = await Message.find({});
    if (messages) {
        io.emit("messages", messages);
    }

    socket.on("chat", async (chat) => {
        if (chat) {
            console.log(chat);

            const newMessage = {
                name: chat.name,
                message: chat.message,
                avatar: chat.avatar,
                timestamp: Date.now(),
            };

            const message = new Message(newMessage);
            await message.save();

            const messages = await Message.find({});
            io.emit("messages", messages);
        } else {
            return;
        }
    });

    socket.on("disconnect", () => {
        console.log("disconnected");
    });
});

// Handle server errors
server.on('error', err => {
    console.error(`Server error: ${err.message}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, p) => {
    console.error(`Unhandled Rejection at: Promise ${p}, reason: ${reason}`);
});
