/**
 * CALLS MODULE (Audio + Video) — Chatsite.cc Style
 * Works with DM block system
 */

module.exports.handle = function (io, socket, { USER_BLOCKS, isBlocked }) {

  // 1) CALL REQUEST
  socket.on("call:request", (data, cb) => {
    const from = socket.username;
    const to = data.to;
    const type = data.type; // "audio" | "video"

    if (!from || !to) return cb({ ok:false });

    // BLOCK CHECK
    if (isBlocked(from, to)) {
      return cb({ ok:false, error:"blocked" });
    }

    // find receiver socket
    let receiver = null;
    for (let [sid, s] of io.of("/").sockets) {
      if (s.username === to) receiver = s;
    }

    if (!receiver) return cb({ ok:false, error:"offline" });

    // send incoming call
    receiver.emit("call:incoming", {
      from,
      type
    });

    return cb({ ok:true });
  });

  // 2) CALL ACCEPT
  socket.on("call:accept", (data) => {
    const from = socket.username;
    const to = data.from;

    for (let [sid, s] of io.of("/").sockets) {
      if (s.username === to) {
        s.emit("call:accepted", { to: from });
      }
    }
  });

  // 3) CALL REJECT
  socket.on("call:reject", (data) => {
    const from = socket.username;
    const to = data.from;

    for (let [sid, s] of io.of("/").sockets) {
      if (s.username === to) {
        s.emit("call:rejected", { to: from });
      }
    }
  });

};

