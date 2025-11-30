// backend/src/controllers/media.controller.js
const mongoose = require("mongoose");
const Message = require("../models/Message");
const DMMessage = require("../models/DMMessage");

async function attachMediaToRoomMessage(req, res) {
  try {
    const { room } = req.body;
    const fileId = req.file.id;

    const msg = await Message.create({
      room,
      from: req.user.id,
      text: "",
      media: {
        fileId,
        type: req.file.contentType
      }
    });

    res.json({ ok: true, message: msg });
  } catch (err) {
    console.error("attachMediaToRoomMessage", err);
    res.status(500).json({ error: "server_error" });
  }
}

async function attachMediaToDM(req, res) {
  try {
    const { to } = req.body;
    const fileId = req.file.id;

    const msg = await DMMessage.create({
      from: req.user.id,
      to,
      text: "",
      attachments: [{
        fileId,
        type: req.file.contentType
      }]
    });

    res.json({ ok: true, message: msg });
  } catch (err) {
    console.error("attachMediaToDM", err);
    res.status(500).json({ error: "server_error" });
  }
}

module.exports = { attachMediaToRoomMessage, attachMediaToDM };
