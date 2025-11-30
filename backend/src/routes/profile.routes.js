const express = require('express');
const router = express.Router();
const profileCtrl = require('../controllers/profile.controller');
const auth = require('../middleware/auth.middleware');

router.get('/me', auth, profileCtrl.me);

module.exports = router;
