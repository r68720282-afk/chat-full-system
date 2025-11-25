/**
 * MAIN BACKEND SERVER
 * Loads:
 *  - Rooms Module
 *  - Messages Module
 *  - (Later) DM, Owner, Security, Calls, Reports
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

// Express App
const app = express();
app.use(cors());
app.use(express.json());

// HTTP Server
const server = http.createServer(app);

// Socket.io Server
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// ------------------ LOAD MODULES ------------------

const roomsModule = require("./modules/rooms.js");
const messagesModule = require("./modules/messages.js");

// --------------------------------------------------

// USER CONNECTED
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // TEMP username system (later replace with login/auth)
  socket.username = "user_" + socket.id.substring(0, 5);

  // Mark as non-owner (later change in owner panel)
  socket.isOwner = false;

  // -------------- MODULE ATTACH -------------------

  roomsModule.handle(io, socket);
  messagesModule.handle(io, socket);

  // ------------------------------------------------

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ------------------ START SERVER ------------------

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Chat Server Running on Port:", PORT);
});
