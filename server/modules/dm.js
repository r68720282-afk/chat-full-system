/**
 * server/modules/dm.js
 *
 * Full backend DM module (Chatsite.cc style)
 * - Text / Image / Video / GIF / File / Audio (base64) support
 * - Mic audio support (frontend sends base64 audio)
 * - Typing / Read receipts
 * - Edit / Delete
 * - Block / Unblock / blockList (USER_BLOCKS exported)
 * - In-memory storage with optional MongoDB hooks (Message model)
 *
 * Usage:
 *   const dmModule = require('./modules/dm.js');
 *   dmModule.handle(io, socket);
 *   // calls module can use dmModule.USER_BLOCKS and dmModule.isBlocked
 */

const crypto = require('crypto');

// In-memory stores
const DM_THREADS = {};   // key -> [msg,...]  (msg: {id, from, to, type, text, file, audio, name, time, edited})
const USER_BLOCKS = {};  // username -> Set(blockedUsernames)

// Optional mongoose Message/DM model (if you add later)
let DMModel = null;
try {
  const mongoose = require('mongoose');
  DMModel = mongoose.models && (mongoose.models.DM || mongoose.models.Message) ? (mongoose.models.DM || mongoose.models.Message) : null;
} catch (e) {
  DMModel = null;
}

/** helper: deterministic key for two users */
function dmKey(a, b) {
  return [String(a), String(b)].sort().join('_');
}

/** helper: check if receiver has blocked sender */
function isBlocked(sender, receiver) {
  if (!receiver || !sender) return false;
  if (!USER_BLOCKS[receiver]) return false;
  return USER_BLOCKS[receiver].has(sender);
}

// export for other modules (calls/messages)
module.exports.USER_BLOCKS = USER_BLOCKS;
module.exports.isBlocked = isBlocked;

module.exports.handle = function (io, socket) {

  // per-socket rate / spam structures can be added here if needed
  socket._dm_history = socket._dm_history || [];

  // -------------------------
  // BLOCK / UNBLOCK / LIST
  // -------------------------
  socket.on('user:block', (username, cb) => {
    try {
      const me = socket.username;
      if (!me || !username) return cb && cb({ ok: false, error: 'invalid' });
      if (!USER_BLOCKS[me]) USER_BLOCKS[me] = new Set();
      USER_BLOCKS[me].add(username);
      return cb && cb({ ok: true, blocked: username });
    } catch (e) {
      return cb && cb({ ok: false, error: 'exception' });
    }
  });

  socket.on('user:unblock', (username, cb) => {
    try {
      const me = socket.username;
      if (!me || !username) return cb && cb({ ok: false, error: 'invalid' });
      if (USER_BLOCKS[me]) USER_BLOCKS[me].delete(username);
      return cb && cb({ ok: true, unblocked: username });
    } catch (e) {
      return cb && cb({ ok: false, error: 'exception' });
    }
  });

  socket.on('user:blockList', (cb) => {
    try {
      const me = socket.username;
      if (!me) return cb && cb({ ok: false, error: 'invalid' });
      const list = USER_BLOCKS[me] ? Array.from(USER_BLOCKS[me]) : [];
      return cb && cb({ ok: true, list });
    } catch (e) {
      return cb && cb({ ok: false, error: 'exception' });
    }
  });

  // -------------------------
  // SEND DM
  // data: { to, type, text, file, name, audio }
  // -------------------------
  socket.on('dm:send', async (data, cb) => {
    try {
      data = data || {};
      const from = socket.username;
      const to = data.to;
      if (!from || !to) return cb && cb({ ok: false, error: 'invalid' });

      // Block check: if receiver has blocked sender => reject
      if (isBlocked(from, to)) {
        return cb && cb({ ok: false, error: 'blocked' });
      }

      const key = dmKey(from, to);
      if (!DM_THREADS[key]) DM_THREADS[key] = [];

      const msg = {
        id: crypto.randomBytes(6).toString('hex'),
        from,
        to,
        type: data.type || 'text',    // text | image | video | gif | file | audio
        text: (data.text || '').toString(),
        file: data.file || null,      // base64 for files (image/video/gif/file)
        name: data.name || null,      // original filename (optional)
        audio: data.audio || null,    // base64 audio (if type === 'audio')
        time: Date.now(),
        edited: false
      };

      // push to in-memory history
      DM_THREADS[key].push(msg);

      // persist to DB if model available (best-effort)
      if (DMModel) {
        try {
          await DMModel.create({
            id: msg.id,
            from: msg.from,
            to: msg.to,
            type: msg.type,
            text: msg.text,
            file: msg.file ? true : false,
            name: msg.name || null,
            audio: msg.audio ? true : false,
            time: msg.time
          });
        } catch (e) {
          // ignore DB errors for now
          console.warn('dm.js: db save failed', e && e.message);
        }
      }

      // emit to sender (ack + new event)
      socket.emit('dm:new', msg);

      // emit to receiver if online
      for (const [sid, s] of io.sockets.sockets) {
        if (s && s.username === to) {
          s.emit('dm:new', msg);
        }
      }

      return cb && cb({ ok: true, id: msg.id });

    } catch (e) {
      console.error('dm:send error', e);
      return cb && cb({ ok: false, error: 'exception' });
    }
  });

  // -------------------------
  // GET DM HISTORY
  // socket.on('dm:get', username, cb)
  // -------------------------
  socket.on('dm:get', async (username, cb) => {
    try {
      const me = socket.username;
      if (!me || !username) return cb && cb({ ok: false, error: 'invalid' });
      const key = dmKey(me, username);
      const list = DM_THREADS[key] || [];
      return cb && cb({ ok: true, list });
    } catch (e) {
      return cb && cb({ ok: false, error: 'exception' });
    }
  });

  // -------------------------
  // TYPING
  // socket.on('dm:typing', username)
  // -------------------------
  socket.on('dm:typing', (username) => {
    try {
      const from = socket.username;
      if (!from || !username) return;
      for (const [sid, s] of io.sockets.sockets) {
        if (s && s.username === username) {
          s.emit('dm:typing', { from });
        }
      }
    } catch (e) {}
  });

  // -------------------------
  // READ RECEIPT
  // socket.on('dm:read', { id, from })
  // -------------------------
  socket.on('dm:read', (data) => {
    try {
      const me = socket.username;
      if (!me || !data || !data.from || !data.id) return;
      const target = data.from;
      for (const [sid, s] of io.sockets.sockets) {
        if (s && s.username === target) {
          s.emit('dm:read', { id: data.id, user: me });
        }
      }
    } catch (e) {}
  });

  // -------------------------
  // DELETE DM MESSAGE
  // socket.on('dm:delete', { user, id }, cb)
  // -------------------------
  socket.on('dm:delete', (data, cb) => {
    try {
      const me = socket.username;
      const other = data && data.user;
      const id = data && data.id;
      if (!me || !other || !id) return cb && cb({ ok: false, error: 'invalid' });

      const key = dmKey(me, other);
      const list = DM_THREADS[key] || [];
      const msg = list.find(m => m.id === id);
      if (!msg) return cb && cb({ ok: false, error: 'not_found' });

      // only sender or owner can delete
      if (msg.from !== me && !socket.isOwner) return cb && cb({ ok: false, error: 'no_permission' });

      DM_THREADS[key] = list.filter(m => m.id !== id);

      // notify both sides
      socket.emit('dm:deleted', { id });
      for (const [sid, s] of io.sockets.sockets) {
        if (s && s.username === other) {
          s.emit('dm:deleted', { id });
        }
      }

      return cb && cb({ ok: true });
    } catch (e) {
      return cb && cb({ ok: false, error: 'exception' });
    }
  });

  // -------------------------
  // EDIT DM MESSAGE
  // socket.on('dm:edit', { user, id, text }, cb)
  // -------------------------
  socket.on('dm:edit', (data, cb) => {
    try {
      const me = socket.username;
      const other = data && data.user;
      const id = data && data.id;
      const text = data && data.text;
      if (!me || !other || !id || typeof text !== 'string') return cb && cb({ ok: false, error: 'invalid' });

      const key = dmKey(me, other);
      const list = DM_THREADS[key] || [];
      const msg = list.find(m => m.id === id);
      if (!msg) return cb && cb({ ok: false, error: 'not_found' });

      if (msg.from !== me && !socket.isOwner) return cb && cb({ ok: false, error: 'no_permission' });

      msg.text = text;
      msg.edited = true;

      // notify both sides
      socket.emit('dm:edited', msg);
      for (const [sid, s] of io.sockets.sockets) {
        if (s && s.username === other) {
          s.emit('dm:edited', msg);
        }
      }

      return cb && cb({ ok: true });
    } catch (e) {
      return cb && cb({ ok: false, error: 'exception' });
    }
  });

  // -------------------------
  // Cleanup on disconnect (update nothing special here)
  // -------------------------
  socket.on('disconnect', () => {
    // nothing special for DM module on disconnect
  });

}; // end handle

