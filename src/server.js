const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const messageRouter = require("./modules/message/routes/messageRoutes");
const socketService = require("./services/socketService/socketService");
require("dotenv").config();
const cors = require("cors");

// App setup
const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the port
const port = process.env.PORT || 4000;

// Start the server and log the port
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Connect to MongoDB
const dbUrl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
console.log("dbUrl", dbUrl);
mongoose.connect(`${dbUrl}/chat`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use("/chat", messageRouter(io));

socketService(io);

// Handle server errors
server.on("error", (err) => {
  console.error(`Server error: ${err.message}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, p) => {
  console.error(`Unhandled Rejection at: Promise ${p}, reason: ${reason}`);
});
