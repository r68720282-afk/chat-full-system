// backend/src/routes/gift.routes.js
const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const giftCtrl = require("../controllers/gift.controller");

router.get("/", giftCtrl.listGifts);
router.post("/room", auth, giftCtrl.sendGiftRoom);
router.post("/dm", auth, giftCtrl.sendGiftDM);

module.exports = router;
