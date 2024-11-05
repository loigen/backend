const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

// CORS Configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://safeplace-murex.vercel.app/"
      : "http://localhost:3000", // Allow localhost for development
  methods: ["GET", "POST"],
  credentials: true,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Your socket.io setup
let onlineUser = [];

const socketServer = (server) => {
  const io = new Server(server, {
    cors: corsOptions, // Use the same CORS options for socket.io
  });

  io.on("connection", (socket) => {
    console.log("New Connection", socket.id);

    socket.on("addNewUser", (userId) => {
      if (!onlineUser.some((user) => user.userId === userId)) {
        onlineUser.push({
          userId,
          socketId: socket.id,
        });
      }
      console.log("online users", onlineUser);
      io.emit("getOnlineUsers", onlineUser);
    });

    socket.on("sendMessage", (message) => {
      const user = onlineUser.find(
        (user) => user.userId === message.recipientId
      );

      if (user) {
        io.to(user.socketId).emit("getMessage", message);
        io.to(user.socketId).emit("getNotification", {
          senderId: message.senderId,
          isRead: false,
          date: new Date(),
        });
      }
    });

    socket.on("disconnect", () => {
      onlineUser = onlineUser.filter((user) => user.socketId !== socket.id);
      io.emit("getOnlineUsers", onlineUser);
    });
  });
};

// Start your Express server and socket server
const server = app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

socketServer(server);
