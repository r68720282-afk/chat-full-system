
// backend/src/routes/presence.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/:id', async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select('online lastSeen sessions');
    if (!u) return res.status(404).json({ error: 'not_found' });
    res.json({ user: u });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
