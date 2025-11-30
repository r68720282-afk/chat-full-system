// backend/src/routes/message.routes.js
const express = require('express');
const router = express.Router();
const msgCtrl = require('../controllers/message.controller');
const auth = require('../middleware/auth.middleware');

router.get('/:room', msgCtrl.fetchMessages);
router.delete('/:id', auth, msgCtrl.deleteMessage);

module.exports = router;
