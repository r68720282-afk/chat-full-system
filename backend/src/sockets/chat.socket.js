// backend/src/sockets/chat.socket.js
const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');

module.exports = function (io) {
  // in-memory room -> Set(socketId) map for online counts
  const roomUsers = new Map();

  io.on('connection', (socket) => {
    // join room
    socket.on('join_room', async (room) => {
      if (!room) return;
      socket.join(room);
      // track
      const set = roomUsers.get(room) || new Set();
      set.add(socket.id);
      roomUsers.set(room, set);
      io.to(room).emit('room_user_count', { room, count: set.size });
    });

    socket.on('leave_room', (room) => {
      socket.leave(room);
      const set = roomUsers.get(room);
      if (set) {
        set.delete(socket.id);
        roomUsers.set(room, set);
        io.to(room).emit('room_user_count', { room, count: set.size });
      }
    });

    // typing indicator: { room, username, isTyping }
    socket.on('typing', (data) => {
      if (!data || !data.room) return;
      socket.to(data.room).emit('typing', { username: data.username, isTyping: !!data.isTyping });
    });

    // chat_message: { room, userId, username, text, media }
    socket.on('chat_message', async (payload) => {
      try {
        if (!payload || !payload.room) return;
        // check room lock
        const r = await Room.findOne({ slug: payload.room });
        if (r && r.isLocked) {
          // simply ignore or send error to sender
          socket.emit('error_message', { error: 'room_locked' });
          return;
        }

        const m = await Message.create({
          room: payload.room,
          userId: payload.userId || null,
          username: payload.username || 'Guest',
          text: payload.text || '',
          media: payload.media || null,
          attachments: payload.attachments || [],
          xp: payload.xp || 2
        });

        // increment xp if userId present
        if (payload.userId) {
          try {
            await User.findByIdAndUpdate(payload.userId, { $inc: { xp: m.xp } });
          } catch (e) { /* ignore */ }
        }

        io.to(payload.room).emit('message', m);
      } catch (err) {
        console.error('chat_message error', err);
      }
    });

    // delete message (socket request)
    socket.on('delete_message', async ({ id, actorId }) => {
      try {
        const msg = await Message.findById(id);
        if (!msg) return;
        // permission checks are ideally done server-side via auth; here assume actorId and later validate
        msg.deleted = true;
        await msg.save();
        io.to(msg.room).emit('message_deleted', { id });
      } catch (e) {
        console.warn('delete_message err', e);
      }
    });

    socket.on('disconnecting', () => {
      // update room counts
      const rooms = Object.keys(socket.rooms || {});
      rooms.forEach((rm) => {
        const set = roomUsers.get(rm);
        if (set) {
          set.delete(socket.id);
          roomUsers.set(rm, set);
          io.to(rm).emit('room_user_count', { room: rm, count: set.size });
        }
      });
    });

  });
};
