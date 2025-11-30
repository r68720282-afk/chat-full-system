// backend/src/sockets/presence.socket.js
// usage: require('./src/sockets/presence.socket')(io, jwtSecret, UserModel)
const jwt = require('jsonwebtoken');

module.exports = function(io, options = {}) {
  const { jwtSecret, User } = options;
  // in-memory map userId => Set(socketId)
  const userSockets = new Map();

  io.on('connection', async (socket) => {
    try {
      // token expected in handshake query: ?token=...
      const token = socket.handshake.query && socket.handshake.query.token;
      if (!token) {
        // allow anonymous sockets (e.g., guest or non-auth) but skip presence updates
        return;
      }
      const payload = jwt.verify(token, jwtSecret);
      const userId = payload.id || payload._id || payload.id;
      if (!userId) return;

      // add socket to in-memory map
      const set = userSockets.get(String(userId)) || new Set();
      set.add(socket.id);
      userSockets.set(String(userId), set);

      // add session record in DB
      try {
        await User.findByIdAndUpdate(userId, {
          $set: { online: true },
          $push: { sessions: { socketId: socket.id, device: socket.handshake.headers['user-agent'] || 'unknown', connectedAt: new Date() } }
        });
      } catch (e) {
        console.warn('presence: failed to add session in DB', e);
      }

      // notify others that user is online
      io.emit('presence_update', { userId, online: true });

      // handle heartbeat from client (optional)
      socket.on('presence_heartbeat', async (data) => {
        // could update lastSeen or keep alive
        // we won't touch DB here to avoid writes per heartbeat
      });

      // handle manual idle event from client (isIdle: true/false)
      socket.on('presence_idle', ({ isIdle }) => {
        io.emit('user_idle_update', { userId, isIdle });
      });

      // typing events (room/DM)
      socket.on('typing', (data) => {
        // data: { room, username, isTyping } or { dmWith }
        if (data && data.room) {
          socket.to(data.room).emit('typing', { username: data.username, isTyping: data.isTyping });
        } else if (data && data.dmWith) {
          const roomId = [userId, data.dmWith].sort().join('_');
          socket.to(roomId).emit('typing', { from: userId, isTyping: data.isTyping });
        }
      });

      socket.on('disconnect', async () => {
        // remove socket from in-memory map
        const s = userSockets.get(String(userId));
        if (s) {
          s.delete(socket.id);
          if (s.size === 0) {
            userSockets.delete(String(userId));
            // mark offline in DB and update lastSeen
            try {
              await User.findByIdAndUpdate(userId, { $set: { online: false, lastSeen: new Date() }, $pull: { sessions: { socketId: socket.id } } });
            } catch (e) {
              console.warn('presence: failed to set offline', e);
            }
            io.emit('presence_update', { userId, online: false, lastSeen: new Date() });
          } else {
            // remove session entry for this socket id only
            try {
              await User.findByIdAndUpdate(userId, { $pull: { sessions: { socketId: socket.id } } });
            } catch (e) {}
          }
        }
      });

    } catch (err) {
      // token invalid or other error
      // silent
      return;
    }
  });
};
