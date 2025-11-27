// =============================
// Owner Panel Updated JS
// =============================

// --- OWNER TOKEN ---
function qs(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name);
}
let OWNER_TOKEN = qs("token") || "";

// --- GLOBAL HELPERS ---
async function apiGET(path) {
  if (!OWNER_TOKEN) { alert("Owner token missing."); throw "NO_TOKEN"; }
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(path + sep + "token=" + encodeURIComponent(OWNER_TOKEN));
  return res.json();
}
async function apiPOST(path, body) {
  if (!OWNER_TOKEN) { alert("Owner token missing."); throw "NO_TOKEN"; }
  body.token = OWNER_TOKEN;
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

// --- UI ELEMENTS ---
const onlineList = document.getElementById("onlineList");
const allUsersBox = document.getElementById("allUsersBox"); // New: All Users List panel
const partnersBox = document.getElementById("partnersBox");
const dmThread = document.getElementById("dmThread");
const logsBox = document.getElementById("logsBox");
const alertsBox = document.getElementById("alertsBox");
const selectedUserEl = document.getElementById("selectedUser");
const deviceInfo = document.getElementById("deviceInfo");

const inputToken = document.getElementById("tokenInput");
const btnSetToken = document.getElementById("btnSetToken");
const btnRefresh = document.getElementById("btnRefresh");
const btnSearch = document.getElementById("btnSearch");
const btnListAll = document.getElementById("btnListAll");
const btnLoadAlerts = document.getElementById("btnLoadAlerts");

const btnKick = document.getElementById("btnKick");
const btnMute = document.getElementById("btnMute");
const btnUnblock = document.getElementById("btnUnblock");
const btnBlock = document.getElementById("btnBlock");
const btnBan = document.getElementById("btnBan"); // New: Ban button

// --- STATE ---
let SELECTED_USER = null;
let ALL_USERS = [];

// ------------------------------
// SET TOKEN
// ------------------------------
btnSetToken.onclick = () => {
  const t = inputToken.value.trim();
  if (!t) return alert("Enter token");
  OWNER_TOKEN = t;
  alert("Token saved");
  loadAll();
};

// ------------------------------
// REFRESH ALL
// ------------------------------
btnRefresh.onclick = () => loadAll();

// ------------------------------
// SEARCH
// ------------------------------
btnSearch.onclick = async () => {
  const q = document.getElementById("searchUser").value.trim();
  if (!q) return alert("Enter username to search");

  await loadAllUsers(); // ensure all users loaded
  const found = ALL_USERS.filter(u => u.username.includes(q));
  renderAllUsers(found);
};

// ------------------------------
// LIST ONLINE USERS
// ------------------------------
btnListAll.onclick = () => loadOnline();

// ------------------------------
// LOAD ALERTS
// ------------------------------
btnLoadAlerts.onclick = () => loadAlerts();

// ------------------------------
// KICK / MUTE / BLOCK / UNBLOCK / BAN
// ------------------------------
btnKick.onclick = async () => { await performAction("kick"); };
btnMute.onclick = async () => { await performAction("mute"); };
btnBlock.onclick = async () => { await performAction("block"); };
btnUnblock.onclick = async () => { await performAction("unblock"); };
btnBan?.onclick = async () => { await performAction("ban"); }; // optional if button exists

async function performAction(action) {
  if (!SELECTED_USER) return alert("Select user first");
  const reason = action === "ban" ? prompt("Enter ban reason:") : undefined;
  if (action === "kick" && !confirm(`Kick user ${SELECTED_USER}?`)) return;

  const body = { user: SELECTED_USER };
  if (reason) body.reason = reason;

  const res = await apiPOST(`/owner/action/${action}`, body);
  alert(res.ok ? `${action.charAt(0).toUpperCase() + action.slice(1)} successful` : "Failed");
  loadOnline();
  if (action === "ban") loadAllUsers();
}

// ------------------------------
// SELECT USER
// ------------------------------
window.selectOwnerUser = function(username) {
  SELECTED_USER = username;
  selectedUserEl.textContent = username;

  partnersBox.innerHTML = "Loading...";
  deviceInfo.innerHTML = "Loading...";
  dmThread.innerHTML = "";

  loadPartners(username);
  loadDeviceInfo(username);
  loadLogs();
};

// ------------------------------
// LOAD ONLINE USERS
// ------------------------------
async function loadOnline() {
  onlineList.innerHTML = "Loading...";
  const res = await apiGET("/owner/online");
  if (!res.ok) { onlineList.innerHTML = "Token invalid"; return; }

  renderUsersWithRoles(res.users);
}

// ------------------------------
// LOAD ALL USERS (New Feature)
// ------------------------------
async function loadAllUsers() {
  const res = await apiGET("/owner/all-users");
  if (!res.ok) { allUsersBox.innerHTML = "Cannot load users"; return; }

  ALL_USERS = res.users; // Save globally
  renderAllUsers(ALL_USERS);
}

function renderAllUsers(users) {
  if (!users.length) { allUsersBox.innerHTML = "<div class='small'>No users found</div>"; return; }
  allUsersBox.innerHTML = users.map(u => `
    <div class="user-item" onclick="selectOwnerUser('${u.username}')">
      ${renderRoleBadge(u.role)} ${u.username} <span class="small">(${u.lastSeen || '–'})</span>
    </div>
  `).join("");
}

// ------------------------------
// RENDER ROLE BADGES (New Feature: SVG + Role)
function renderRoleBadge(role) {
  const icons = {
    "owner": "👑",
    "superadmin": "💎",
    "admin": "🛡️",
    "moderator": "🗡️",
    "vip": "⭐"
  };
  const colors = {
    "owner": "#ffd700",
    "superadmin": "#00ffff",
    "admin": "#ff4500",
    "moderator": "#00ff00",
    "vip": "#ff69b4"
  };
  if (!role) return "";
  return `<span style="color:${colors[role]};margin-right:6px">${icons[role]}</span>`;
}

// ------------------------------
// LOAD PARTNERS
// ------------------------------
async function loadPartners(user) {
  const res = await apiGET("/owner/dm-partners?user=" + encodeURIComponent(user));
  if (!res.ok) { partnersBox.innerHTML = "No permission"; return; }
  if (!res.list || !res.list.length) { partnersBox.innerHTML = "<div class='small'>No DM partners</div>"; return; }

  partnersBox.innerHTML = res.list.map(p => `
    <div onclick="loadThread('${user}','${p.replace(/'/g,"\\'")}')" 
         style="padding:8px;border-bottom:1px solid #222;cursor:pointer">
      ${p}
    </div>
  `).join("");
}

// ------------------------------
// LOAD DM THREAD
// ------------------------------
window.loadThread = async function(a, b) {
  dmThread.innerHTML = "Loading...";
  const res = await apiGET(`/owner/read-dm?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`);
  if (!res.ok) { dmThread.innerHTML = "No permission"; return; }

  dmThread.innerHTML = res.thread.map(m => `
    <div style="margin-bottom:10px">
      <b>${m.from}</b>: ${m.text || ""} ${m.file ? "<i>[file]</i>" : ""}
    </div>
  `).join("");
};

// ------------------------------
// LOAD DEVICE INFO
// ------------------------------
async function loadDeviceInfo(user) {
  const res = await apiGET("/owner/userinfo?user=" + encodeURIComponent(user));
  if (!res.ok) { deviceInfo.innerHTML = "<div class='small'>No permission</div>"; return; }

  const d = res.info;
  deviceInfo.innerHTML = `
    <div class="small">Devices:</div>
    <div>${(d.devices || []).map(x => `<span class="chip">${x}</span>`).join(" ")}</div>
    <div style="margin-top:8px" class="small">IPs:</div>
    <div>${(d.ips || []).map(x => `<span class="chip">${x}</span>`).join(" ")}</div>
  `;

  detectSuspicious(d); // New Feature: Suspicious Activity
}

// ------------------------------
// SUSPICIOUS ACTIVITY DETECTOR (New)
function detectSuspicious(info) {
  let alerts = [];
  if ((info.ips || []).length > 3) alerts.push("Multiple IPs detected");
  if ((info.devices || []).length > 3) alerts.push("Multiple devices detected");
  // You can add more rules like fast switching, spam messages, etc.

  if (alerts.length) {
    alertsBox.innerHTML = alerts.map(a => `<div style="padding:6px;color:#f44">${a}</div>`).join("") + alertsBox.innerHTML;
  }
}

// ------------------------------
// LOAD LOGS
// ------------------------------
async function loadLogs() {
  const res = await apiGET("/owner/logs");
  if (!res.ok) { logsBox.innerHTML = "<div class='small'>No permission</div>"; return; }

  logsBox.innerHTML = res.list.map(l => `
    <pre>${new Date(l.time).toLocaleString()}\n${l.type}\n${JSON.stringify(l.data,null,2)}</pre>
  `).join("");
}

// ------------------------------
// LOAD ALERTS
// ------------------------------
async function loadAlerts() {
  const res = await apiGET("/owner/alerts");
  if (!res.ok) { alertsBox.innerHTML = "<div class='small'>No permission</div>"; return; }

  alertsBox.innerHTML = res.alerts.map(a => `
    <div style="padding:8px;border-bottom:1px solid #222">
      <b>${a.type}</b>
      <div class="small">${new Date(a.time).toLocaleString()}</div>
    </div>
  `).join("");
}

// ------------------------------
// LOAD ALL
// ------------------------------
function loadAll() {
  loadOnline();
  loadAllUsers(); // New: load all users
  loadLogs();
  loadAlerts();
}

// --- AUTO LOAD ---
if (OWNER_TOKEN) loadAll();
