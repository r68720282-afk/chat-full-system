// public/ownerpanel.js
// Owner panel UI logic (simple fetches). Owner token from URL query param.
function qs(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}
const OWNER_TOKEN = qs('token') || '';

function apiGET(path){
  const sep = path.includes('?') ? '&' : '?';
  return fetch(path + sep + 'token=' + encodeURIComponent(OWNER_TOKEN)).then(r=>r.json());
}

// UI
const onlineList = document.getElementById('onlineList');
const partnersBox = document.getElementById('partnersBox');
const dmThread = document.getElementById('dmThread');
const logsBox = document.getElementById('logsBox');
const alertsBox = document.getElementById('alertsBox');
const selectedUserEl = document.getElementById('selectedUser');

let selectedUser = null;

document.getElementById('refreshBtn').onclick = ()=> loadAll();
document.getElementById('loadOnlineBtn').onclick = ()=> loadOnline();
document.getElementById('viewPartners').onclick = ()=> {
  if(!selectedUser) return alert('Select a user');
  loadPartners(selectedUser);
};

function loadAll(){ loadOnline(); loadLogs(); loadAlerts(); }
function loadOnline(){
  apiGET('/owner/online').then(res=>{
    if(!res.ok) return alert('no permission');
    onlineList.innerHTML = res.users.map(u=>{
      return `<div class="user-item" onclick="selectUser('${u.username}')">${u.username}</div>`;
    }).join('');
  });
}
function selectUser(username){
  selectedUser = username;
  selectedUserEl.textContent = username;
  partnersBox.innerHTML = '';
  dmThread.innerHTML = '';
}
function loadPartners(username){
  apiGET('/owner/dm-partners?user='+encodeURIComponent(username)).then(res=>{
    if(!res.ok) return alert('no permission');
    partnersBox.innerHTML = res.list.map(p=>{
      return `<div style="padding:8px;border-bottom:1px solid #111;cursor:pointer" onclick="loadThread('${username}','${p}')">${p}</div>`;
    }).join('');
  });
}
function loadThread(a,b){
  apiGET('/owner/read-dm?a='+encodeURIComponent(a)+'&b='+encodeURIComponent(b)).then(res=>{
    if(!res.ok) return alert('no permission');
    dmThread.innerHTML = res.thread.map(m=>{
      return `<div style="margin-bottom:8px"><b>${m.from}</b>: ${m.text || ''} ${m.file?'<i> [file]</i>':''}</div>`;
    }).join('');
  });
}
function loadLogs(){
  apiGET('/owner/logs').then(res=>{
    if(!res.ok) return alert('no permission');
    logsBox.innerHTML = res.list.map(l=> `<pre>${new Date(l.time).toLocaleString()} ${l.type} ${JSON.stringify(l.data)}</pre>` ).join('');
  });
}
function loadAlerts(){
  apiGET('/owner/alerts').then(res=>{
    if(!res.ok) return;
    alertsBox.innerHTML = res.alerts.map(a=>`<div style="padding:8px;border-bottom:1px solid #111">${new Date(a.time).toLocaleString()} - ${a.type}</div>`).join('');
  });
}

// initial
loadAll();

