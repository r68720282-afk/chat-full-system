/**
 * MAIN BACKEND SERVER
 * Loads:
 *  - Rooms Module
 *  - Messages Module
 *  - DM Module
 *  - Calls Module
 *  - Owner Panel
 *  - Security
 *  - Logs
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

// ⭐ OWNER SYSTEM MODULES (must be at top)
const roles = require("./modules/roles.js");
const ownerModule = require("./modules/owner.js");
const logs = require("./modules/logs.js");
const security = require("./modules/security.js");

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

  // TEMP username until login system added
  socket.username = "user_" + socket.id.substring(0, 5);

  // OWNER tracking → device + IP
  const clientIp =
    socket.handshake.address ||
    (socket.request &&
      socket.request.connection &&
      socket.request.connection.remoteAddress) ||
    "unknown";

  const deviceInfo = socket.handshake.headers["user-agent"] || "unknown";

  // TRACK LOGIN FOR SECURITY
  security.trackLogin(socket.username, clientIp, deviceInfo);

  // Add activity log
  logs.addLog("user_connect", { username: socket.username, ip: clientIp });

  // Mark as non-owner (future use)
  socket.isOwner = false;

  // -------------- MODULE ATTACH -------------------

  // Rooms module
  roomsModule.handle(io, socket);

  // Public room messaging system
  messagesModule.handle(io, socket);

  // DM MODULE
  dmModule.handle(io, socket);

  // CALLS MODULE
  callsModule.handle(io, socket, {
    USER_BLOCKS: dmModule.USER_BLOCKS,
    isBlocked: dmModule.isBlocked,
  });

  // OWNER DISCONNECT TRACK
  socket.on("disconnect", () => {
    logs.addLog("user_disconnect", { username: socket.username });
    console.log("User disconnected:", socket.id);
  });
});

// --------------------------------------------------
// ⭐⭐ OWNER ROUTES — paste here (ABOVE server.listen())
// --------------------------------------------------

// Owner Login (returns TOKEN)
app.post("/owner/login", (req, res) => {
  const token = roles.loginOwner(req.body.password);
  if (token) return res.json({ ok: true, token });
  return res.json({ ok: false });
});

// 1️⃣ Owner — Get Online Users
app.get("/owner/online", async (req, res) => {
  const token = req.query.token;
  if (!roles.isOwnerToken(token)) return res.json({ ok: false });

  const users = await ownerModule.getOnlineUsers(io);
  res.json({ ok: true, users });
});

// 2️⃣ Owner — DM Partners for a user
app.get("/owner/dm-partners", (req, res) => {
  const token = req.query.token;
  const user = req.query.user;

  if (!roles.isOwnerToken(token)) return res.json({ ok: false });

  const partners = ownerModule.getDMPartnersForUser(user);
  res.json({ ok: true, list: partners });
});

// 3️⃣ Owner — Read DM thread between A & B
app.get("/owner/read-dm", (req, res) => {
  const token = req.query.token;
  const a = req.query.a;
  const b = req.query.b;

  if (!roles.isOwnerToken(token)) return res.json({ ok: false });

  const thread = ownerModule.readDMThread(a, b);
  res.json({ ok: true, thread });
});

// 4️⃣ Owner — Activity Logs
app.get("/owner/logs", (req, res) => {
  const token = req.query.token;
  if (!roles.isOwnerToken(token)) return res.json({ ok: false });

  const logsList = ownerModule.getLogs(200);
  res.json({ ok: true, list: logsList });
});

// 5️⃣ Owner — Alerts (security)
app.get("/owner/alerts", (req, res) => {
  const token = req.query.token;
  if (!roles.isOwnerToken(token)) return res.json({ ok: false });

  const alerts = security.getAlerts();
  res.json({ ok: true, alerts });
});

// 6️⃣ Owner — User device/IP info
app.get("/owner/userinfo", (req, res) => {
  const token = req.query.token;
  const user = req.query.user;

  if (!roles.isOwnerToken(token)) return res.json({ ok: false });

  const info = ownerModule.getUserInfo(user);
  res.json({ ok: true, info });
});

// --------------------------------------------------
// ------------------ START SERVER ------------------
// --------------------------------------------------

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Chat Server Running on Port:", PORT);
});
