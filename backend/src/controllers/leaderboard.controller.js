// backend/src/controllers/leaderboard.controller.js
const User = require("../models/User");

async function topXP(req, res) {
  const users = await User.find({})
    .sort({ xp: -1 })
    .select("username avatarUrl xp level likes giftsReceived")
    .limit(50);

  res.json({ users });
}

async function topLikes(req, res) {
  const users = await User.find({})
    .sort({ likes: -1 })
    .select("username avatarUrl xp level likes giftsReceived")
    .limit(50);

  res.json({ users });
}

async function topGifts(req, res) {
  const users = await User.find({})
    .sort({ giftsReceived: -1 })
    .select("username avatarUrl xp level likes giftsReceived")
    .limit(50);

  res.json({ users });
}

async function likeUser(req, res) {
  const { id } = req.params;
  const current = req.user.id;

  if (String(id) === String(current))
    return res.status(400).json({ error: "cannot_like_self" });

  // सोचा समझा: हर user किसी को एक बार ही like कर सकता है
  const me = await User.findById(current);
  if (!me) return res.status(404).json({ error: "not_found" });

  if (!me._liked) me._liked = [];

  if (me._liked.includes(id))
    return res.status(400).json({ error: "already_liked" });

  me._liked.push(id);
  await me.save();

  await User.findByIdAndUpdate(id, { $inc: { likes: 1 } });

  res.json({ ok: true });
}

module.exports = { topXP, topLikes, topGifts, likeUser };
