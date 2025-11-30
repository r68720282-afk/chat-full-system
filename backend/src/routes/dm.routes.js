// backend/src/routes/dm.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { getDM, seen } = require('../controllers/dm.controller');

// fetch chat messages between two users
router.get('/:id', auth, getDM);

// mark messages as seen
router.post('/seen/:id', auth, seen);

module.exports = router;
