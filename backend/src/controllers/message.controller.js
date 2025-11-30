// backend/src/controllers/message.controller.js
const Message = require('../models/Message');

async function fetchMessages(req, res) {
  try {
    const room = req.params.room;
    const page = Math.max(0, parseInt(req.query.page || '0'));
    const per = Math.min(100, parseInt(req.query.per || '40'));
    const msgs = await Message.find({ room, deleted: false }).sort({ createdAt: -1 }).skip(page * per).limit(per);
    res.json({ messages: msgs.reverse() });
  } catch (err) {
    console.error('fetchMessages error', err);
    res.status(500).json({ error: 'server_error' });
  }
}

async function deleteMessage(req, res) {
  try {
    const { id } = req.params;
    // check role: moderator/admin/owner or message owner
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ error: 'not_found' });
    const actorRoles = (req.user && req.user.roles) || [];
    if (!(actorRoles.includes('admin') || actorRoles.includes('moderator') || String(msg.userId) === String(req.user.id) || actorRoles.includes('owner'))) {
      return res.status(403).json({ error: 'forbidden' });
    }
    msg.deleted = true;
    await msg.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteMessage error', err);
    res.status(500).json({ error: 'server_error' });
  }
}

module.exports = { fetchMessages, deleteMessage };
