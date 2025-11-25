/**
 * server/modules/dm.js
 * Full DM module with:
 *  - text / image / video / gif / file / audio messages
 *  - mic recording (audio) support (base64)
 *  - emojis (frontend)
 *  - typing / read receipts
 *  - edit / delete
 *  - user block system (block/unblock/blockList)
 *
 * In-memory storage (DM_THREADS, USER_BLOCKS). Optional MongoDB hooks can be added later.
 */

const crypto = require("crypto");

// In-memory DM store and blocks
const DM_THREADS = {}; // key -> [{id, from, to, type, text, file, audio, name, time, edited}]
const USER_BLOCKS = {}; // user -> Set(blocked usernames)

// helper: pair key
function dmKey(a,b){
  return [a,b].sort().join("_");
}

// helper: check block (receiver blocked sender)
function isBlocked(sender, receiver){
  if(!USER_BLOCKS[receiver]) return false;
  return USER_BLOCKS[receiver].has(sender);
}

module.exports.USER_BLOCKS = USER_BLOCKS;
module.exports.isBlocked = isBlocked;

module.exports.handle = function(io, socket){

  socket._dmHistory = [];

  // --- BLOCK / UNBLOCK / LIST ---
  socket.on("user:block", (username, cb) => {
    const me = socket.username;
    if(!me || !username) return cb && cb({ ok:false });
    if(!USER_BLOCKS[me]) USER_BLOCKS[me] = new Set();
    USER_BLOCKS[me].add(username);
    return cb && cb({ ok:true, blocked: username });
  });

  socket.on("user:unblock", (username, cb) => {
    const me = socket.username;
    if(!me || !username) return cb && cb({ ok:false });
    if(USER_BLOCKS[me]) USER_BLOCKS[me].delete(username);
    return cb && cb({ ok:true, unblocked: username });
  });

  socket.on("user:blockList", (cb) => {
    const me = socket.username;
    const list = USER_BLOCKS[me] ? Array.from(USER_BLOCKS[me]) : [];
    return cb && cb({ ok:true, list });
  });

  // --- SEND DM ---
  // data: { to, type, text, file, name, audio }
  socket.on("dm:send", (data, cb) => {
    try {
      data = data || {};
      const from = socket.username;
      const to = data.to;
      if(!from || !to) return cb && cb({ ok:false });

      // block check: if receiver blocked sender -> blocked
      if(isBlocked(from, to)) {
        return cb && cb({ ok:false, error:"blocked" });
      }

      const key = dmKey(from, to);
      if(!DM_THREADS[key]) DM_THREADS[key] = [];

      const msg = {
        id: crypto.randomBytes(6).toString("hex"),
        from,
        to,
        type: data.type || "text", // text|image|video|gif|file|audio
        text: data.text || "",
        file: data.file || null,   // base64 for image/video/gif/file
        name: data.name || null,   // original filename
        audio: data.audio || null, // base64 audio
        time: Date.now(),
        edited: false
      };

      DM_THREADS[key].push(msg);

      // emit to sender
      socket.emit("dm:new", msg);

      // emit to receiver if connected
      for (let [sid, s] of io.of("/").sockets) {
        if (s.username === to) {
          s.emit("dm:new", msg);
        }
      }

      return cb && cb({ ok:true, msgId: msg.id });
    } catch(e) {
      console.error("dm:send err", e);
      return cb && cb({ ok:false, error:"exception" });
    }
  });

  // --- GET DM HISTORY ---
  socket.on("dm:get", (username, cb) => {
    try {
      const me = socket.username;
      if(!me || !username) return cb && cb({ ok:false });
      const key = dmKey(me, username);
      return cb && cb({ ok:true, list: DM_THREADS[key] || [] });
    } catch(e){
      return cb && cb({ ok:false });
    }
  });

  // --- TYPING ---
  socket.on("dm:typing", (user) => {
    const from = socket.username;
    if(!from || !user) return;
    for (let [sid, s] of io.of("/").sockets) {
      if (s.username === user) {
        s.emit("dm:typing", { from });
      }
    }
  });

  // --- READ RECEIPT ---
  socket.on("dm:read", (data) => {
    try {
      const me = socket.username;
      const to = data.from;
      const id = data.id;
      if(!me || !to || !id) return;
      for (let [sid, s] of io.of("/").sockets) {
        if (s.username === to) {
          s.emit("dm:read", { id, user: me });
        }
      }
    } catch(e){}
  });

  // --- DELETE DM ---
  socket.on("dm:delete", (data, cb) => {
    try {
      const me = socket.username;
      const other = data.user;
      const id = data.id;
      if(!me || !other || !id) return cb && cb({ ok:false });

      const key = dmKey(me, other);
      const list = DM_THREADS[key] || [];
      const msg = list.find(m => m.id === id);
      if(!msg) return cb && cb({ ok:false });

      // only sender or owner (socket.isOwner) can delete
      if(msg.from !== me && !socket.isOwner) return cb && cb({ ok:false, error:"no_permission" });

      DM_THREADS[key] = list.filter(m => m.id !== id);

      // notify both sides
      socket.emit("dm:deleted", { id });
      for (let [sid, s] of io.of("/").sockets) {
        if (s.username === other) {
          s.emit("dm:deleted", { id });
        }
      }

      return cb && cb({ ok:true });
    } catch(e){ return cb && cb({ ok:false }); }
  });

  // --- EDIT DM ---
  socket.on("dm:edit", (data, cb) => {
    try {
      const me = socket.username;
      const other = data.user;
      const id = data.id;
      const text = data.text;
      if(!me || !other || !id || typeof text !== "string") return cb && cb({ ok:false });

      const key = dmKey(me, other);
      const list = DM_THREADS[key] || [];
      const msg = list.find(m => m.id === id);
      if(!msg) return cb && cb({ ok:false });

      if(msg.from !== me && !socket.isOwner) return cb && cb({ ok:false, error:"no_permission" });

      msg.text = text;
      msg.edited = true;

      // notify both
      socket.emit("dm:edited", msg);
      for (let [sid, s] of io.of("/").sockets) {
        if (s.username === other) {
          s.emit("dm:edited", msg);
        }
      }

      return cb && cb({ ok:true });
    } catch(e){ return cb && cb({ ok:false }); }
  });

  // --- cleanup on disconnect no special action needed ---
  socket.on("disconnect", () => { /* nothing extra here */ });

};

