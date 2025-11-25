/**
 * MAIN BACKEND SERVER
 * Loads:
 *  - Rooms Module
 *  - Messages Module
 *  - DM Module
 *  - Calls Module
 *  - (Later) Owner Panel, Security, Reports
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
app.use(express.static(path.join(__dirname, "..", "public")));
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
const dmModule = require("./modules/dm.js");
const callsModule = require("./modules/calls.js");

// --------------------------------------------------

// USER CONNECTED
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // TEMP username system (later replace with login/auth)
  socket.username = "user_" + socket.id.substring(0, 5);

  // Mark as non-owner (later change in owner panel)
  socket.isOwner = false;

  // -------------- MODULE ATTACH -------------------

  // Rooms module
  roomsModule.handle(io, socket);

  // Public room messaging system
  messagesModule.handle(io, socket);

  // ⭐ DM MODULE ATTACH
  dmModule.handle(io, socket);

  // ⭐ CALLS MODULE ATTACH
  callsModule.handle(io, socket, { 
    USER_BLOCKS: dmModule.USER_BLOCKS, 
    isBlocked: dmModule.isBlocked 
  });

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
