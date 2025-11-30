// backend/src/controllers/room.controller.js
const Room = require('../models/Room');
const Message = require('../models/Message');

async function listRooms(req, res) {
  try {
    const rooms = await Room.find({}).sort({ createdAt: 1 });
    // send basic counts (messages count can be expensive; we skip heavy aggregates)
    res.json({ rooms });
  } catch (err) {
    console.error('listRooms error', err);
    res.status(500).json({ error: 'server_error' });
  }
}

async function createRoom(req, res) {
  try {
    // only owner role or admin allowed — simple check
    const actorRoles = (req.user && req.user.roles) || [];
    if (!actorRoles.includes('owner') && !actorRoles.includes('admin')) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const { name, slug } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'missing' });

    const exists = await Room.findOne({ slug });
    if (exists) return res.status(400).json({ error: 'slug_exists' });

    const r = await Room.create({ name, slug, ownerId: req.user.id });
    res.json({ room: r });
  } catch (err) {
    console.error('createRoom error', err);
    res.status(500).json({ error: 'server_error' });
  }
}

async function lockRoom(req, res) {
  try {
    const { slug } = req.params;
    const actorRoles = (req.user && req.user.roles) || [];
    if (!actorRoles.includes('owner') && !actorRoles.includes('admin') && !actorRoles.includes('moderator')) {
      return res.status(403).json({ error: 'forbidden' });
    }
    const r = await Room.findOneAndUpdate({ slug }, { $set: { isLocked: true } }, { new: true });
    if (!r) return res.status(404).json({ error: 'not_found' });
    res.json({ room: r });
  } catch (err) {
    console.error('lockRoom error', err);
    res.status(500).json({ error: 'server_error' });
  }
}

async function unlockRoom(req, res) {
  try {
    const { slug } = req.params;
    const actorRoles = (req.user && req.user.roles) || [];
    if (!actorRoles.includes('owner') && !actorRoles.includes('admin') && !actorRoles.includes('moderator')) {
      return res.status(403).json({ error: 'forbidden' });
    }
    const r = await Room.findOneAndUpdate({ slug }, { $set: { isLocked: false } }, { new: true });
    if (!r) return res.status(404).json({ error: 'not_found' });
    res.json({ room: r });
  } catch (err) {
    console.error('unlockRoom error', err);
    res.status(500).json({ error: 'server_error' });
  }
}

// optional: seed default rooms
async function seedDefault(req, res) {
  try {
    const defs = [
      { name: 'Main', slug: 'main' },
      { name: 'English', slug: 'english' },
      { name: 'Quiz', slug: 'quiz' },
      { name: 'Telugu', slug: 'telugu' }
    ];
    const created = [];
    for (const d of defs) {
      const exists = await Room.findOne({ slug: d.slug });
      if (!exists) {
        const r = await Room.create(d);
        created.push(r);
      }
    }
    res.json({ created });
  } catch (err) {
    console.error('seedDefault error', err);
    res.status(500).json({ error: 'server_error' });
  }
}

module.exports = { listRooms, createRoom, lockRoom, unlockRoom, seedDefault };
