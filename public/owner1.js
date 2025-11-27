// =============================
// Owner Panel JavaScript — Final
// =============================
(function(){

// ------------------------------
// Theme toggle
// ------------------------------
const toggleThemeBtn = document.getElementById("toggleTheme");
toggleThemeBtn.onclick = () => {
  document.body.classList.toggle("dark-theme");
  document.body.classList.toggle("light-theme");
};

// ------------------------------
// Owner Token
// ------------------------------
function qs(name){ return new URL(location.href).searchParams.get(name);}
let OWNER_TOKEN = qs("token") || "";

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
const btnBlock = document.getElementById("btnBlock");
const btnUnblock = document.getElementById("btnUnblock");

// Selected user
let SELECTED_USER = null;

// ------------------------------
// Helper API
// ------------------------------
async function apiGET(path){
  if(!OWNER_TOKEN) { alert("Owner token missing"); throw "NO_TOKEN"; }
  const sep = path.includes("?") ? "&":"?";
  const res = await fetch(path + sep + "token="+encodeURIComponent(OWNER_TOKEN));
  return res.json();
}

async function apiPOST(path, body){
  if(!OWNER_TOKEN) { alert("Owner token missing"); throw "NO_TOKEN"; }
  body.token = OWNER_TOKEN;
  const res = await fetch(path, {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body)});
  return res.json();
}

// ------------------------------
// Role SVG badges
// ------------------------------
function getRoleBadgeSVG(role){
  switch(role){
    case 'superadmin':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7h7l-5.5 4 2 7-6-4-6 4 2-7L2 9h7z"/></svg>`;
    case 'admin':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a2 2 0 0 1 2 2v2h4v4h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v4h-4v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2H4v-4H2a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2V5h4V3a2 2 0 0 1 2-2h2z"/></svg>`;
    case 'moderator':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l3 6 6 1-4 4 1 6-5-3-5 3 1-6-4-4 6-1 3-6z"/></svg>`;
    case 'vip':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>`;
    default:
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.88-2.18 4.88-4.88S14.7 2.24 12 2.24 7.12 4.42 7.12 7.12 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`;
  }
}

// ------------------------------
// Token & Buttons
// ------------------------------
btnSetToken.onclick = () => {
  const t = inputToken.value.trim();
  if(!t) return alert("Enter token");
  OWNER_TOKEN = t;
  alert("Token saved");
  loadAll();
};

btnRefresh.onclick = () => loadAll();

btnSearch.onclick = async () => {
  const q = document.getElementById("searchUser").value.trim();
  if(!q) return alert("Enter username to search");
  const res = await apiGET("/owner/online");
  if(!res.ok) return alert("Invalid token");
  const found = (res.users||[]).filter(u=>u.username.includes(q));
  onlineList.innerHTML = found.length ? found.map(u=>`<div class="user-item" onclick="selectOwnerUser('${u.username}')">${getRoleBadgeSVG(u.role)} ${u.username}</div>`).join('') : '<div class="small">No user found</div>';
};

btnListAll.onclick = () => loadOnline();
btnLoadAlerts.onclick = () => loadAlerts();

// ------------------------------
// Admin buttons
// ------------------------------
btnKick.onclick = async()=>{ if(!SELECTED_USER) return alert("Select user"); if(!confirm("Kick "+SELECTED_USER+"?")) return; const r=await apiPOST("/owner/action/kick",{user:SELECTED_USER}); alert(r.ok?"User kicked":"Failed"); loadOnline();};
btnMute.onclick = async()=>{ if(!SELECTED_USER) return alert("Select user"); const r=await apiPOST("/owner/action/mute",{user:SELECTED_USER}); alert(r.ok?"Muted":"Failed");};
btnBlock.onclick = async()=>{ if(!SELECTED_USER) return alert("Select user"); const r=await apiPOST("/owner/action/block",{user:SELECTED_USER}); alert(r.ok?"Blocked":"Failed"); loadOnline();};
btnUnblock.onclick = async()=>{ if(!SELECTED_USER) return alert("Select user"); const r=await apiPOST("/owner/action/unblock",{user:SELECTED_USER}); alert(r.ok?"Unblocked":"Failed"); loadOnline();};

// ------------------------------
// Select User
// ------------------------------
window.selectOwnerUser = function(username){
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
// Load Online Users
// ------------------------------
async function loadOnline(){
  onlineList.innerHTML = "Loading...";
  const res = await apiGET("/owner/online");
  if(!res.ok){ onlineList.innerHTML="Token invalid"; return; }
  onlineList.innerHTML = res.users.map(u=>`<div class="user-item" onclick="selectOwnerUser('${u.username}')">${getRoleBadgeSVG(u.role)} ${u.username}</div>`).join('');
}

// ------------------------------
// Load Partners
// ------------------------------
async function loadPartners(user){
  const res = await apiGET("/owner/dm-partners?user="+encodeURIComponent(user));
  if(!res.ok){ partnersBox.innerHTML="<div class='small'>No permission</div>"; return; }
  if(!res.list||!res.list.length){ partnersBox.innerHTML="<div class='small'>No DM partners</div>"; return; }
  partnersBox.innerHTML = res.list.map(p=>`<div onclick="loadThread('${user}','${p.replace(/'/g,"\\'")}')">${p}</div>`).join('');
}

// ------------------------------
// Load DM Thread
// ------------------------------
window.loadThread = async function(a,b){
  dmThread.innerHTML="Loading...";
  const res = await apiGET("/owner/read-dm?a="+encodeURIComponent(a)+"&b="+encodeURIComponent(b));
  if(!res.ok){ dmThread.innerHTML="<div class='small'>No permission</div>"; return; }
  dmThread.innerHTML = res.thread.map(m=>`<div style="margin-bottom:10px"><b>${m.from}</b>: ${m.text||""} ${m.file?'<i>[file]</i>':''}</div>`).join('');
};

// ------------------------------
// Load Device Info
// ------------------------------
async function loadDeviceInfo(user){
  const res = await apiGET("/owner/userinfo?user="+encodeURIComponent(user));
  if(!res.ok){ deviceInfo.innerHTML="<div class='small'>No permission</div>"; return; }
  const d=res.info;
  deviceInfo.innerHTML = `<div class="small">Devices:</div><div>${(d.devices||[]).map(x=>`<span class="chip">${x}</span>`).join(" ")}</div>
  <div class="small" style="margin-top:8px">IPs:</div><div>${(d.ips||[]).map(x=>`<span class="chip">${x}</span>`).join(" ")}</div>`;
}

// ------------------------------
// Load Logs
// ------------------------------
async function loadLogs(){
  const res = await apiGET("/owner/logs");
  if(!res.ok){ logsBox.innerHTML="<div class='small'>No permission</div>"; return; }
  logsBox.innerHTML = res.list.map(l=>`<pre>${new Date(l.time).toLocaleString()}\n${l.type}\n${JSON.stringify(l.data,null,2)}</pre>`).join('');
}

// ------------------------------
// Load Alerts
// ------------------------------
async function loadAlerts(){
  const res = await apiGET("/owner/alerts");
  if(!res.ok){ alertsBox.innerHTML="<div class='small'>No permission</div>"; return; }
  alertsBox.innerHTML = res.alerts.map(a=>`<div style="padding:8px;border-bottom:1px solid #222"><b>${a.type}</b><div class="small">${new Date(a.time).toLocaleString()}</div></div>`).join('');
}

// ------------------------------
// Load All
// ------------------------------
function loadAll(){ loadOnline(); loadLogs(); loadAlerts(); }
if(OWNER_TOKEN) loadAll();

})();
