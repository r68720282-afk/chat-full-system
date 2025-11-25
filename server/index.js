const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

// Express app
const app = express();
app.use(cors());
app.use(express.json());

// HTTP server
const server = http.createServer(app);

// Socket.io server
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// --- Load Modules ---
const roomsModule = require("./modules/rooms.js");

// Attach module handlers
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // default username (later replace by login/session)
  socket.username = "user_" + socket.id.substring(0, 5);

  // mark as non-owner (owner panel later)
  socket.isOwner = false;

  // attach Rooms module
  roomsModule.handle(io, socket);

  socket.on("

