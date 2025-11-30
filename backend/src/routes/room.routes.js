// backend/src/routes/room.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const roomCtrl = require('../controllers/room.controller');

router.get('/', roomCtrl.listRooms);
router.post('/', auth, roomCtrl.createRoom);
router.post('/seed', auth, roomCtrl.seedDefault);
router.post('/:slug/lock', auth, roomCtrl.lockRoom);
router.post('/:slug/unlock', auth, roomCtrl.unlockRoom);

module.exports = router;
