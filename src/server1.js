const express = require('express');
const socket = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./modules/message/models/messageModel');

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
const io = socket(server);

// Connect to MongoDB
const dbUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
mongoose.connect(`${dbUrl}/chat`, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Handle Socket.io connections
io.on('connection', socket => {
    // Log the client's IP address
    const clientIp = socket.request.connection.remoteAddress;
    console.log(`New connection from ${clientIp}`);

    // Handle chat events
    socket.on('chat', data => {
        console.log(`Received message: ${data.message}`);

        // Create a new message document
        const message = new Message({
            name: data.name,
            message: data.message,
            timestamp: new Date(),
        });

        // Save the message to the database
        message.save(message).then(result => {
            console.log('Message saved to database:', message);
        })
            .catch(err => {
                console.error('Error saving message to database:', err);
            });

        io.emit('chat', message);
    });

    // Handle typing events
    socket.on('typing', data => {
        socket.broadcast.emit('typing', data);
    });

    // Handle finishTyping events
    socket.on('finishTyping', data => {
        socket.broadcast.emit('finishTyping', data);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('Client disconnected');
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
