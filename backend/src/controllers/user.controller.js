// backend/src/controllers/user.controller.js
const User = require('../models/User');
const path = require('path');

async function listUsers(req, res) {
  try {
    const users = await User.find({}, 'username avatarUrl isGuest roles xp publicSlug online lastSeen').sort({ username: 1 });
    res.json({ users });
  } catch (err) {
    console.error('listUsers error', err);
    res.status(500).json({ error: 'server_error' });
  }
}

async function getProfile(req, res) {
  try {
    const id = req.params.id;
    const u = await User.findById(id).select('-passwordHash -sessions');
    if (!u) return res.status(404).json({ error: 'not_found' });
    res.json({ user: u });
  } catch (err) {
    console.error('getProfile error', err);
    res.status(500).json({ error: 'server_error' });
  }
}

// avatar upload handled by multer in routes
async function uploadAvatar(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'no_auth' });
    if (!req.file) return res.status(400).json({ error: 'no_file' });

    const avatarUrl = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user.id, { $set: { avatarUrl } });

    res.json({ ok: true, avatarUrl });
  } catch (err) {
    console.error('uploadAvatar error', err);
    res.status(500).json({ error: 'server_error' });
  }
}

module.exports = { listUsers, getProfile, uploadAvatar };
