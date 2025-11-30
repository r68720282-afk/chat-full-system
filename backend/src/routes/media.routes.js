// backend/src/routes/media.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const { uploadFile, getFile } = require("../utils/gridfs");
const { attachMediaToRoomMessage, attachMediaToDM } = require("../controllers/media.controller");

const mongoose = require("mongoose");
const { GridFsStorage } = require("multer-gridfs-storage");
const multer = require("multer");

// Storage Engine
const storage = new GridFsStorage({
  url: process.env.MONGO_URL,
  file: (req, file) => {
    return {
      filename: Date.now() + "-" + file.originalname,
      bucketName: "uploads"
    };
  }
});

const upload = multer({ storage });

// Upload media → GridFS
router.post("/upload", auth, upload.single("file"), uploadFile);

// Attach to room message
router.post("/room", auth, upload.single("file"), attachMediaToRoomMessage);

// Attach to DM message
router.post("/dm", auth, upload.single("file"), attachMediaToDM);

// Stream media file
router.get("/:id", getFile);

module.exports = router;
