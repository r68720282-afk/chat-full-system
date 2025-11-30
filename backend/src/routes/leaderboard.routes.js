// backend/src/routes/leaderboard.routes.js
const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const ctrl = require("../controllers/leaderboard.controller");

router.get("/xp", ctrl.topXP);
router.get("/likes", ctrl.topLikes);
router.get("/gifts", ctrl.topGifts);

router.post("/like/:id", auth, ctrl.likeUser);

module.exports = router;
