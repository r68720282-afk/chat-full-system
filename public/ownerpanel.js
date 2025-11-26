// =============================
// Owner Panel JavaScript
// =============================

// Read owner token from ?token= in URL
function qs(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name);
}
let OWNER_TOKEN = qs("token") || "";

// GLOBAL helper for API GET
async function apiGET(path) {
  if (!OWNER_TOKEN) {
    alert("Owner token missing.");
    throw "NO_TOKEN";
  }
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(path + sep + "token=" + encodeURIComponent(OWNER_TOKEN));
  return res.json();
}

// GLOBAL helper for API POST
async function apiPOST(path, body) {
  if (!OWNER_TOKEN) {
    alert("Owner token missing.");
    throw "NO_TOKEN";
  }
  body.token = OWNER_TOKEN;
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

// UI Elements
const onlineList = document.getElementById("onlineList");
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

// Selected user
let SELECTED_USER = null;

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

  const res = await apiGET("/owner/online");
  if (!res.ok) return alert("Invalid token");

  const found = (res.users || []).filter((u) => u.username.includes(q));

  onlineList.innerHTML =
    found.length === 0
      ? `<div class="small">No user found</div>`
      : found
          .map(
            (u) =>
              `<div class="user-item" onclick="selectOwnerUser('${u.username}')">${u.username}</div>`
          )
          .join("");
};

// ------------------------------
// LIST ALL ONLINE
// ------------------------------
btnListAll.onclick = () => loadOnline();

// ------------------------------
// LOAD ALERTS
// ------------------------------
btnLoadAlerts.onclick = () => loadAlerts();

// ------------------------------
// KICK
// ------------------------------
btnKick.onclick = async () => {
  if (!SELECTED_USER) return alert("Select user first");
  if (!confirm("Kick user " + SELECTED_USER + " ?")) return;

  const r = await apiPOST("/owner/action/kick", { user: SELECTED_USER });
  alert(r.ok ? "User kicked" : "Failed");
  loadOnline();
};

// ------------------------------
// MUTE
// ------------------------------
btnMute.onclick = async () => {
  if (!SELECTED_USER) return alert("Select user first");

  const r = await apiPOST("/owner/action/mute", { user: SELECTED_USER });
  alert(r.ok ? "Muted" : "Failed");
};

// ------------------------------
// BLOCK
// ------------------------------
btnBlock.onclick = async () => {
  if (!SELECTED_USER) return alert("Select user first");

  const r = await apiPOST("/owner/action/block", { user: SELECTED_USER });
  alert(r.ok ? "Blocked" : "Failed");
};

// ------------------------------
// UNBLOCK
// ------------------------------
btnUnblock.onclick = async () => {
  if (!SELECTED_USER) return alert("Select user first");

  const r = await apiPOST("/owner/action/unblock", { user: SELECTED_USER });
  alert(r.ok ? "Unblocked" : "Failed");
};

// ------------------------------
// SELECT USER
// ------------------------------
window.selectOwnerUser = function (username) {
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
  if (!res.ok) {
    onlineList.innerHTML = "Token invalid";
    return;
  }
  onlineList.innerHTML = res.users
    .map(
      (u) =>
        `<div class="user-item" onclick="selectOwnerUser('${u.username}')">${u.username}</div>`
    )
    .join("");
}

// ------------------------------
// LOAD PARTNERS
// ------------------------------
async function loadPartners(user) {
  const res = await apiGET("/owner/dm-partners?user=" + encodeURIComponent(user));

  if (!res.ok) {
    partnersBox.innerHTML = "No permission";
    return;
  }

  if (!res.list || res.list.length === 0) {
    partnersBox.innerHTML = "<div class='small'>No DM partners</div>";
    return;
  }

  partnersBox.innerHTML = res.list
    .map(
      (p) =>
        `<div onclick="loadThread('${user}','${p.replace(/'/g, "\\'")}')" style="padding:8px;border-bottom:1px solid #222;cursor:pointer">${p}</div>`
    )
    .join("");
}

// ------------------------------
// LOAD DM THREAD
// ------------------------------
window.loadThread = async function (a, b) {
  dmThread.innerHTML = "Loading...";
  const res = await apiGET(
    "/owner/read-dm?a=" + encodeURIComponent(a) + "&b=" + encodeURIComponent(b)
  );

  if (!res.ok) {
    dmThread.innerHTML = "No permission";
    return;
  }

  dmThread.innerHTML = res.thread
    .map(
      (m) =>
        `<div style="margin-bottom:10px"><b>${m.from}</b>: ${m.text || ""} ${
          m.file ? "<i>[file]</i>" : ""
        }</div>`
    )
    .join("");
};

// ------------------------------
// LOAD DEVICE INFO
// ------------------------------
async function loadDeviceInfo(user) {
  const res = await apiGET("/owner/userinfo?user=" + encodeURIComponent(user));

  if (!res.ok) {
    deviceInfo.innerHTML = "<div class='small'>No permission</div>";
    return;
  }

  const d = res.info;

  deviceInfo.innerHTML = `
    <div class="small">Devices:</div>
    <div>${(d.devices || []).map((x) => `<span class="chip">${x}</span>`).join(" ")}</div>

    <div style="margin-top:8px" class="small">IPs:</div>
    <div>${(d.ips || []).map((x) => `<span class="chip">${x}</span>`).join(" ")}</div>
  `;
}

// ------------------------------
// LOAD LOGS
// ------------------------------
async function loadLogs() {
  const res = await apiGET("/owner/logs");
  if (!res.ok) {
    logsBox.innerHTML = "<div class='small'>No permission</div>";
    return;
  }

  logsBox.innerHTML = res.list
    .map(
      (l) =>
        `<pre>${new Date(l.time).toLocaleString()}\n${l.type}\n${JSON.stringify(
          l.data,
          null,
          2
        )}</pre>`
    )
    .join("");
}

// ------------------------------
// LOAD ALERTS
// ------------------------------
async function loadAlerts() {
  const res = await apiGET("/owner/alerts");

  if (!res.ok) {
    alertsBox.innerHTML = "<div class='small'>No permission</div>";
    return;
  }

  alertsBox.innerHTML = res.alerts
    .map(
      (a) =>
        `<div style="padding:8px;border-bottom:1px solid #222">
           <b>${a.type}</b>
           <div class="small">${new Date(a.time).toLocaleString()}</div>
         </div>`
    )
    .join("");
}

// ------------------------------
// LOAD ALL (initial load)
// ------------------------------
function loadAll() {
  loadOnline();
  loadLogs();
  loadAlerts();
}

// auto load if token exists
if (OWNER_TOKEN) loadAll();
