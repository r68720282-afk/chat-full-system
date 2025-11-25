// public/dm.js
// Requires: socket.io client served at /socket.io/socket.io.js
const socket = io();
let CURRENT_USER = null;   // the user you're chatting TO (target)
let MY_NAME = null;        // your own username (set by server via handshake in production)

// For testing locally set these manually if needed
// MY_NAME = "alice"; CURRENT_USER = "bob";

// Utility to append message node
function appendMessage(msg, mine){
  const box = document.getElementById("dm-messages");
  let html = '';
  if(msg.type === "image" || msg.type === "gif"){
    html = `<div class="dm-row ${mine? 'me':''}"><div class="bubble"><img src="${msg.file}" class="dm-img"/></div></div>`;
  } else if(msg.type === "video"){
    html = `<div class="dm-row ${mine? 'me':''}"><div class="bubble"><video controls src="${msg.file}" class="dm-video"></video></div></div>`;
  } else if(msg.type === "audio"){
    html = `<div class="dm-row ${mine? 'me':''}"><div class="bubble"><audio controls src="${msg.audio}"></audio></div></div>`;
  } else if(msg.type === "file"){
    html = `<div class="dm-row ${mine? 'me':''}"><div class="bubble"><a href="${msg.file}" download="${msg.name}">📄 ${msg.name}</a></div></div>`;
  } else {
    html = `<div class="dm-row ${mine? 'me':''}"><div class="bubble"><b>${msg.from}:</b> ${escapeHtml(msg.text)} ${msg.edited?'<i>(edited)</i>':''}</div></div>`;
  }
  box.insertAdjacentHTML('beforeend', html);
  box.scrollTop = box.scrollHeight;
}

function escapeHtml(s){ return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// UI elements
const dmUsernameEl = document.getElementById("dm-username");
const inputEl = document.getElementById("dm-input");
const sendBtn = document.getElementById("dm-send");
const attachBtn = document.getElementById("attach-btn");
const filePicker = document.getElementById("file-picker");
const emojiBtn = document.getElementById("emoji-btn");
const emojiBox = document.getElementById("emoji-box");
const micBtn = document.querySelector(".dm-mic-btn");
const blockBtn = document.getElementById("block-btn");

// simple emoji list
const emojis = "😀😁😂🤣😅😉😊😍😘😗😙😚😋😛😜😝🤔😐🙄😏😣😥😮🤐😯😪😫😴😌😓😔😕🙃".split("");
emojiBox.innerHTML = emojis.map(e => `<span class="emoji">${e}</span>`).join("");

// handle emoji click
emojiBox.addEventListener('click', (ev) => {
  if(ev.target.classList.contains('emoji')){
    inputEl.value += ev.target.textContent;
  }
});

// set target user function (call this when opening DM)
function openDM(targetUsername, myName){
  CURRENT_USER = targetUsername;
  MY_NAME = myName || MY_NAME;
  dmUsernameEl.textContent = CURRENT_USER;
  // fetch history
  socket.emit("dm:get", CURRENT_USER, (res) => {
    if(res && res.ok){
      document.getElementById("dm-messages").innerHTML = '';
      res.list.forEach(m => appendMessage(m, m.from === MY_NAME));
    }
  });
}

// send text
sendBtn.onclick = () => {
  const txt = inputEl.value.trim();
  if(!txt) return;
  socket.emit("dm:send", { to: CURRENT_USER, type:"text", text: txt }, (res)=>{
    if(res && res.ok){
      inputEl.value = '';
    } else if(res && res.error === 'blocked'){
      alert("You are blocked by this user.");
    }
  });
};

// attach (file)
attachBtn.onclick = () => filePicker.click();
filePicker.onchange = () => {
  const file = filePicker.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onloadend = () => {
    let type = "file";
    if(file.type.includes("image")) type = file.type.includes("gif") ? "gif":"image";
    else if(file.type.includes("video")) type = "video";
    else if(file.type.includes("audio")) type = "audio";
    socket.emit("dm:send", { to: CURRENT_USER, type, file: reader.result, name: file.name }, (res)=>{
      if(res && res.error === 'blocked') alert("You are blocked by this user.");
    });
  };
  reader.readAsDataURL(file);
};

// emoji toggle
emojiBtn.onclick = () => {
  emojiBox.style.display = emojiBox.style.display === 'block' ? 'none' : 'block';
};

// typing indicator
inputEl.oninput = () => {
  socket.emit("dm:typing", CURRENT_USER);
};

// receive typing
socket.on("dm:typing", (d) => {
  // show small typing indicator (console for now)
  // you can show "d.from is typing..." in UI
  console.log(d.from + " is typing...");
});

// receive new dm
socket.on("dm:new", (msg) => {
  appendMessage(msg, msg.from === MY_NAME);
});

// read receipt
socket.on("dm:read", (d) => {
  console.log("read:", d);
});

// delete / edited
socket.on("dm:deleted", (d) => {
  // simple approach: reload thread or remove element by id if you map DOM ids
  console.log("deleted", d.id);
});
socket.on("dm:edited", (msg) => {
  console.log("edited", msg);
});

// BLOCK button
blockBtn.onclick = () => {
  if(!CURRENT_USER) return;
  socket.emit("user:block", CURRENT_USER, (res) => {
    if(res && res.ok) alert("User blocked.");
  });
};

// MIC (record audio send)
let mediaRecorder, chunks = [];
micBtn.onclick = async () => {
  try{
    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      chunks = [];
      const reader = new FileReader();
      reader.onloadend = () => {
        socket.emit("dm:send", { to: CURRENT_USER, type:"audio", audio: reader.result }, (res)=>{
          if(res && res.error === 'blocked') alert("You are blocked by this user.");
        });
      };
      reader.readAsDataURL(blob);
    };
    mediaRecorder.start();
    // stop after 12s
    setTimeout(()=> { try{ mediaRecorder.stop(); }catch(e){} }, 12000);
  }catch(e){
    alert("Mic access denied");
  }
};

// helper: escape html not to break UI
function initForTest(myName, target){
  MY_NAME = myName;
  openDM(target, myName);
}

// EXPORT for dev
window.openDM = openDM;
window.initForTest = initForTest;
