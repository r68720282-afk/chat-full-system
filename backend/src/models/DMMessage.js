// backend/src/models/DMMessage.js
const { Schema, model } = require('mongoose');

const AttachmentSchema = new Schema({
  fileId: String,
  type: String,
  filename: String
}, { _id: false });

const DMMessageSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: '' },
  attachments: { type: [AttachmentSchema], default: [] },
  seen: { type: Boolean, default: false },
  seenAt: { type: Date },
}, { timestamps: true });

module.exports = model('DMMessage', DMMessageSchema);
