// server/modules/security.js
// Basic IP/device tracking & multi-account detector (in-memory)
const geoip = null; // placeholder - do not require now; optionally add geoip-lite

const USER_DEVICES = {}; // username -> {devices: Set(...), ips: Set(...)}
const ALERTS = [];

function trackLogin(username, ip, deviceFingerprint){
  if(!username) return;
  if(!USER_DEVICES[username]) USER_DEVICES[username] = { devices: new Set(), ips: new Set() };
  USER_DEVICES[username].devices.add(deviceFingerprint || "unknown");
  USER_DEVICES[username].ips.add(ip || "unknown");

  // simple multi-account detection: same IP used by many usernames
  // this will be checked by owner endpoint if needed
}

function getUserInfo(username){
  const rec = USER_DEVICES[username];
  if(!rec) return { devices: [], ips: [] };
  return { devices: Array.from(rec.devices), ips: Array.from(rec.ips) };
}

function addAlert(type, data){
  ALERTS.push({ id: Date.now()+"_"+Math.random().toString(36).slice(2,8), type, data, time: Date.now() });
  if(ALERTS.length > 2000) ALERTS.shift();
}

function getAlerts(limit=200){
  return ALERTS.slice(-limit).reverse();
}

module.exports = {
  trackLogin,
  getUserInfo,
  addAlert,
  getAlerts
};

