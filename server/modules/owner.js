// server/modules/owner.js
const roles = require("./roles");
const logs = require("./logs");
const security = require("./security");
const dmModule = require("./dm"); // ensure dm.js exports needed helpers

// Owner actions (server-side helpers)
function requireOwner(token){
  return roles.isOwnerToken(token);
}

async function getOnlineUsers(io){
  const out = [];
  for(const [id, s] of io.sockets.sockets){
    out.push({ socketId:id, username: s.username || null, isOwner: s.isOwner || false });
  }
  return out;
}

function getDMPartnersForUser(username){
  if(!dmModule || !dmModule.USER_DM_LIST) return [];
  const set = dmModule.USER_DM_LIST[username];
  return set ? Array.from(set) : [];
}

function readDMThread(a,b){
  if(!dmModule || !dmModule.getDMThread) return [];
  return dmModule.getDMThread(a,b) || [];
}

function getLogs(limit){
  return logs.getLogs(limit || 200);
}

function getUserInfo(username){
  return security.getUserInfo(username);
}

function addOwnerLog(action, data){
  logs.addLog(action, data);
}

module.exports = {
  requireOwner,
  getOnlineUsers,
  getDMPartnersForUser,
  readDMThread,
  getLogs,
  getUserInfo,
  addOwnerLog
};

