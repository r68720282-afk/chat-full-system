// paste into backend/src/config/db.js
const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) {
    console.warn('MONGODB_URI not provided. DB not connected.');
    return;
  }
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    throw err;
  }
}

module.exports = { connectDB, mongoose };
