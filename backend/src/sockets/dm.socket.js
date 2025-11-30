// backend/src/sockets/dm.socket.js
const DMMessage = require('../models/DMMessage');

module.exports = function (io) {
  io.on("connection", (socket) => {

    socket.on("dm_open", ({ from, to }) => {
      const roomId = [from, to].sort().join("_");
      socket.join(roomId);
    });

    socket.on("dm_typing", ({ from, to }) => {
      const roomId = [from, to].sort().join("_");
      socket.to(roomId).emit("dm_typing", { from });
    });

    socket.on("dm_send", async ({ from, to, text, media }) => {
      const msg = await DMMessage.create({
        from,
        to,
        text: text || "",
        attachments: media ? [media] : []
      });

      const roomId = [from, to].sort().join("_");
      io.to(roomId).emit("dm_receive", msg);
    });

    socket.on("dm_seen", async ({ from, to }) => {
      await DMMessage.updateMany(
        { from, to, seen: false },
        { $set: { seen: true, seenAt: new Date() } }
      );

      const roomId = [from, to].sort().join("_");
      io.to(roomId).emit("dm_seen_ack", { from, to });
    });

  });
};
