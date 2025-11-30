// backend/src/controllers/dm.controller.js
const DMMessage = require('../models/DMMessage');
const User = require('../models/User');

function dmRoomId(u1, u2) {
  return [u1, u2].sort().join("_");
}

// GET DM HISTORY
async function getDM(req, res) {
  try {
    const user = req.user.id;
    const other = req.params.id;

    const msgs = await DMMessage.find({
      $or: [
        { from: user, to: other },
        { from: other, to: user }
      ]
    }).sort({ createdAt: 1 });

    res.json({ messages: msgs });
  } catch (err) {
    console.error("DM get error:", err);
    res.status(500).json({ error: "server_error" });
  }
}

// MARK AS SEEN
async function seen(req, res) {
  try {
    const user = req.user.id;
    const other = req.params.id;

    await DMMessage.updateMany(
      { from: other, to: user, seen: false },
      { $set: { seen: true, seenAt: new Date() } }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("DM seen error:", err);
    res.status(500).json({ error: "server_error" });
  }
}

module.exports = { getDM, seen, dmRoomId };
