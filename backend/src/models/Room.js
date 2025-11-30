// backend/src/models/Room.js
const { Schema, model } = require('mongoose');

const RoomSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  isLocked: { type: Boolean, default: false },
  allowedRoles: { type: [String], default: [] }, // optional role-based access
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = model('Room', RoomSchema);
