// server/modules/roles.js
const crypto = require("crypto");

// Simple in-memory role store (replace with DB in prod)
let OWNER_PASSWORD = process.env.OWNER_PASSWORD || "change_this_owner_pass"; // set env in Render
let OWNER_TOKEN = process.env.OWNER_TOKEN || null;
let ADMINS = new Set(); // usernames (or user ids)

function generateOwnerToken() {
  OWNER_TOKEN = crypto.randomBytes(20).toString("hex");
  return OWNER_TOKEN;
}
function loginOwner(pass) {
  if (pass === OWNER_PASSWORD) return generateOwnerToken();
  return null;
}
function isOwnerToken(token) { return token && token === OWNER_TOKEN; }
function isAdmin(username) { return ADMINS.has(username); }
function addAdmin(username) { ADMINS.add(username); }
function removeAdmin(username) { ADMINS.delete(username); }
function getAdmins() { return Array.from(ADMINS); }

module.exports = {
  loginOwner,
  isOwnerToken,
  isAdmin,
  addAdmin,
  removeAdmin,
  getAdmins,
  // for runtime config
  _setOwnerPassword: (p)=>{ OWNER_PASSWORD = p; },
  _getOwnerToken: ()=> OWNER_TOKEN
};

