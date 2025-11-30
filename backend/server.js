// backend/server.js
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// App + Server
const app = express();
const server = http.createServer(app);

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));

// JSON parser
app.use(express.json());

// Static uploads (avatar + cover + media)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connect
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

// Socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

// Import models for sockets
const User = require('./src/models/User');

// JWT secret
const jwtSecret = process.env.JWT_ACCESS_SECRET || "default_secret";

// -----------------------
//      ROUTES
// -----------------------
app.get("/", (req, res) => {
  res.send("Chatsite backend running");
});

// User/Profile/Avatar/Cover routes
app.use('/api/users', require('./src/routes/user.routes'));

// Rooms List routes
app.use('/api/rooms', require('./src/routes/room.routes'));

// Room Messages routes
app.use('/api/messages', require('./src/routes/message.routes'));

// DM routes
app.use('/api/dm', require('./src/routes/dm.routes'));

// Presence API
app.use('/api/presence', require('./src/routes/presence.routes'));


// -----------------------
//      SOCKET SYSTEM
// -----------------------
require('./src/sockets/chat.socket')(io);      // Room chat socket
require('./src/sockets/dm.socket')(io);        // Direct message socket
require('./src/sockets/presence.socket')(io, { // Online, idle, typing
  jwtSecret,
  User
});


// -----------------------
//      START SERVER
// -----------------------
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port:", PORT);
});
