const Message = require("../../modules/message/models/messageModel");

module.exports = (io) => {
  const activeUsers = new Set();

  io.on("connection", async (socket) => {
    console.log("We are connected");

    const messages = await Message.find({});
    if (messages) {
      io.emit("messages", messages);
    }

    socket.on("join", (user) => {
      activeUsers[socket.id] = user;
      activeUsers.add(user);
      socket.username = user;
      io.emit("activeUsers", [...activeUsers]);
      console.log(`${user} has joined the chat`);
    });

    socket.on("disconnect", () => {
      const user = activeUsers[socket.id];
      activeUsers.delete(socket.username);
      io.emit("activeUsers", [...activeUsers]);
      console.log(`${user} has left the chat`);
    });
  });
};
