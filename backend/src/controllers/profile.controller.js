// backend/src/controllers/profile.controller.js
const User = require('../models/User');

// Level formula: example simple formula
function calcLevel(xp = 0) {
  const level = Math.floor(Math.sqrt(xp / 20));
  const nextXp = Math.pow(level + 1, 2) * 20;
  const progress = Math.min(100, Math.floor((xp / nextXp) * 100));
  return { level, nextXp, progress };
}

// GET /api/users/me
async function getMyProfile(req, res) {
  try {
    const id = req.user && req.user.id;
    if (!id) return res.status(401).json({ error: 'no_auth' });

    const u = await User.findById(id).select('-passwordHash -sessions');
    if (!u) return res.status(404).json({ error: 'not_found' });

    const lvl = calcLevel(u.xp || 0);

    res.json({ user: u, level: lvl });
  } catch (err) {
    console.error('getMyProfile error', err);
    res.status(500).json({ error: 'server_error' });
  }
}

// PUT /api/users/me
async function updateProfile(req, res) {
  try {
    const id = req.user && req.user.id;
    if (!id) return res.status(401).json({ error: 'no_auth' });

    const { bio, publicSlug, theme } = req.body;

    // slug uniqueness check
    if (publicSlug) {
      const exists = await User.findOne({ publicSlug, _id: { $ne: id } });
      if (exists) return res.status(400).json({ error: 'slug_taken' });
    }

    const update = {};
    if (bio !== undefined) update.bio = bio;
    if (publicSlug !== undefined) update.publicSlug = publicSlug || null;
    if (theme !== undefined) update.theme = theme;

    const u = await User.findByIdAndUpdate(id, { $set: update }, { new: true }).select('-passwordHash -sessions');
    const lvl = calcLevel(u.xp || 0);

    res.json({ user: u, level: lvl });
  } catch (err) {
    console.error('updateProfile error', err);
    res.status(500).json({ error: 'server_error' });
  }
}

// GET /api/users/public/:slug
async function getPublicProfile(req, res) {
  try {
    const slug = req.params.slug;
    if (!slug) return res.status(400).json({ error: 'missing_slug' });

    const u = await User.findOne({ publicSlug: slug })
      .select('username avatarUrl coverUrl bio xp badges theme createdAt');

    if (!u) return res.status(404).json({ error: 'not_found' });

    const lvl = calcLevel(u.xp || 0);

    res.json({ user: u, level: lvl });
  } catch (err) {
    console.error('getPublicProfile error', err);
    res.status(500).json({ error: 'server_error' });
  }
}

module.exports = { getMyProfile, updateProfile, getPublicProfile };
