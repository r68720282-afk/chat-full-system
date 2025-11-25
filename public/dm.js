// public/dm.js
// FRONTEND DM SYSTEM — FULL VERSION
// Text, Emojis, Audio, Image/Video/GIF/File, Typing, Read, Block, Calls

const socket = io();

let CURRENT_USER = null;     // whom you are chatting with
let MY_NAME = null;          // your username set by backend

// ---------- UTILITY ----------
function escapeHtml(s){
    return (s || '').toString()
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;');
}

// append message bubbles
function appendMessage(msg, mine){
    const box = document.getElementById("dm-messages");
    let html = "";

    if(msg.type === "image" || msg.type === "gif"){
        html = `
        <div class="dm-row ${mine ? "me" : ""}">
            <div class="bubble">
                <img src="${msg.file}" class="dm-img"/>
            </div>
        </div>`;
    }
    else if(msg.type === "video"){
        html = `
        <div class="dm-row ${mine ? "me" : ""}">
            <div class="bubble">
                <video controls src="${msg.file}" class="dm-video"></video>
            </div>
        </div>`;
    }
    else if(msg.type === "audio"){
        html = `
        <div class="dm-row ${mine ? "me" : ""}">
            <div class="bubble">
                <audio controls src="${msg.audio}"></audio>
            </div>
        </div>`;
    }
    else if(msg.type === "file"){
        html = `
        <div class="dm-row ${mine ? "me" : ""}">
            <div class="bubble">
                <a href="${msg.file}" download="${msg.name}">
                    📄 ${msg.name}
                </a>
            </div>
        </div>`;
    }
    else {
        html = `
        <div class="dm-row ${mine ? "me" : ""}">
            <div class="bubble">
                <b>${msg.from}:</b> ${escapeHtml(msg.text)}
                ${msg.edited ? "<i>(edited)</i>" : ""}
            </div>
        </div>`;
    }

    box.insertAdjacentHTML("beforeend", html);
    box.scrollTop = box.scrollHeight;
}

// ---------- UI ELEMENTS ----------
const dmUserEl  = document.getElementById("dm-username");
const msgBox    = document.getElementById("dm-messages");
const inputEl   = document.getElementById("dm-input");
const sendBtn   = document.getElementById("dm-send");
const attachBtn = document.getElementById("attach-btn");
const filePicker= document.getElementById("file-picker");
const emojiBtn  = document.getElementById("emoji-btn");
const emojiBox  = document.getElementById("emoji-box");
const micBtn    = document.querySelector(".dm-mic-btn");
const blockBtn  = document.getElementById("block-btn");

// emoji list
const emojis = "😀😁😂🤩😍🥰😅🤣😊😉😉😘😎🙄😴😤😬😑🤐😯😪😫😴😌😓😔🙏🙃".split("");
emojiBox.innerHTML = emojis.map(e => `<span class="emoji">${e}</span>`).join("");

// emoji click handler
emojiBox.onclick = (e)=>{
    if(e.target.classList.contains("emoji")){
        inputEl.value += e.target.textContent;
    }
};

// ---------- OPEN DM ----------
function openDM(target, myName){
    CURRENT_USER = target;
    MY_NAME = myName;

    dmUserEl.textContent = CURRENT_USER;

    socket.emit("dm:get", CURRENT_USER, (res)=>{
        if(res && res.ok){
            msgBox.innerHTML = "";
            res.list.forEach(m => appendMessage(m, m.from === MY_NAME));
        }
    });
}
window.openDM = openDM;

// ---------- SEND TEXT ----------
sendBtn.onclick = ()=>{
    const txt = inputEl.value.trim();
    if(!txt) return;

    socket.emit("dm:send", {
        to: CURRENT_USER,
        type: "text",
        text: txt
    }, (res)=>{
        if(res && res.error === "blocked"){
            alert("You are blocked by this user.");
        } else {
            inputEl.value = "";
        }
    });
};

// ---------- ATTACH FILE ----------
attachBtn.onclick = ()=> filePicker.click();

filePicker.onchange = ()=>{
    const file = filePicker.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onloadend = ()=> {
        let type = "file";
        if (file.type.includes("image")) type = file.type.includes("gif") ? "gif" : "image";
        else if (file.type.includes("video")) type = "video";
        else if (file.type.includes("audio")) type = "audio";

        socket.emit("dm:send", {
            to: CURRENT_USER,
            type,
            file: reader.result,
            name: file.name
        }, (res)=>{
            if(res && res.error === "blocked"){
                alert("You are blocked by this user.");
            }
        });
    };
    reader.readAsDataURL(file);
};

// ---------- MIC AUDIO ----------
let mediaRecorder;
let chunks = [];

micBtn.onclick = async ()=>{
    try {
        const stream = await navigator.mediaDevices.getUserMedia({audio:true});
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = e => chunks.push(e.data);

        mediaRecorder.onstop = ()=>{
            const blob = new Blob(chunks, { type: "audio/webm" });
            chunks = [];

            const reader = new FileReader();
            reader.onloadend = ()=>{
                socket.emit("dm:send", {
                    to: CURRENT_USER,
                    type: "audio",
                    audio: reader.result
                }, (res)=>{
                    if(res && res.error === "blocked"){
                        alert("You are blocked by this user.");
                    }
                });
            };
            reader.readAsDataURL(blob);
        };

        mediaRecorder.start();
        setTimeout(()=>{ try{ mediaRecorder.stop(); }catch(e){} }, 12000);

    } catch(err){
        alert("Mic access denied");
    }
};

// ---------- TYPING ----------
inputEl.oninput = ()=>{
    socket.emit("dm:typing", CURRENT_USER);
};

socket.on("dm:typing", (d)=>{
    console.log(`${d.from} is typing...`);
});

// ---------- RECEIVE DM ----------
socket.on("dm:new", (msg)=>{
    appendMessage(msg, msg.from === MY_NAME);
});

// ---------- READ RECEIPTS ----------
socket.on("dm:read", (d)=>{
    console.log("read:", d);
});

// ---------- DELETE / EDIT ----------
socket.on("dm:deleted", (d)=>{
    console.log("message deleted", d.id);
});

socket.on("dm:edited", (msg)=>{
    console.log("message edited", msg);
});

// ---------- BLOCK USER ----------
blockBtn.onclick = ()=>{
    socket.emit("user:block", CURRENT_USER, (res)=>{
        if(res.ok) alert("User blocked.");
    });
};

// ==================================================================
// ⭐⭐⭐ CALL SYSTEM — Chatsite.cc Style ⭐⭐⭐
// ==================================================================

// INCOMING CALL EVENT (A → B)
socket.on("call:incoming", (data)=>{
    alert(`${data.from} is calling you (${data.type})`);
    // Later: custom modal UI add karenge
});

// ACCEPT CALL
function acceptCall(from){
    socket.emit("call:accept", { from });
}
window.acceptCall = acceptCall;

// REJECT CALL
function rejectCall(from){
    socket.emit("call:reject", { from });
}
window.rejectCall = rejectCall;

// ==================================================================

// Helper for testing
window.initForTest = (me, target)=>{
    MY_NAME = me;
    openDM(target, me);
};
