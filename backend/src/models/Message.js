// backend/src/models/Message.js
const { Schema, model } = require('mongoose');

const MediaSchema = new Schema({
  fileId: String,
  type: String,
  filename: String,
}, { _id: false });

const MessageSchema = new Schema({
  room: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  username: { type: String, required: true },
  text: { type: String, default: '' },
  media: { type: MediaSchema, default: null },
  attachments: { type: [MediaSchema], default: [] },
  xp: { type: Number, default: 2 },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = model('Message', MessageSchema);
