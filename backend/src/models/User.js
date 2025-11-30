// backend/src/models/User.js
const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },

    avatarUrl: { type: String, default: null },
    coverUrl: { type: String, default: null },

    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    coins: { type: Number, default: 50 },

    likes: { type: Number, default: 0 },           // NEW
    giftsReceived: { type: Number, default: 0 },   // NEW

    gender: { type: String, default: null },
    age: { type: Number, default: null },

    roles: { type: [String], default: ["user"] },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = model("User", UserSchema);
