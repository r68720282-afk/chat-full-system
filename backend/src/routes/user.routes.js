// backend/src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const profileCtrl = require('../controllers/profile.controller');
const auth = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure uploads folder exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UPLOAD_DIR); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit

// user list & profile
router.get('/', userCtrl.listUsers);
router.get('/:id', userCtrl.getProfile);

// avatar upload
router.post('/avatar', auth, upload.single('avatar'), userCtrl.uploadAvatar);

// cover upload
router.post('/cover', auth, upload.single('cover'), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'no_auth' });
    if (!req.file) return res.status(400).json({ error: 'no_file' });

    const coverUrl = `/uploads/${req.file.filename}`;
    await require('../models/User').findByIdAndUpdate(req.user.id, { $set: { coverUrl } });

    res.json({ ok: true, coverUrl });
  } catch (err) {
    console.error('cover upload error', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// profile endpoints
router.get('/me', auth, profileCtrl.getMyProfile);
router.put('/me', auth, profileCtrl.updateProfile);

// public profile
router.get('/public/:slug', profileCtrl.getPublicProfile);

module.exports = router;
