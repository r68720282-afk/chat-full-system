// paste into backend/src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change_me_access';
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';

function generateAccess(user){
  return jwt.sign({ id: user._id, username: user.username, roles: user.roles }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

async function register(req, res){
  try {
    const { username, email, password, age, gender } = req.body;
    if(!username || !email || !password) return res.status(400).json({ error: 'missing_fields' });
    // basic uniqueness checks
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(400).json({ error: 'user_exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash: hash, isGuest:false, age, gender, roles:['user'] });
    const token = generateAccess(user);
    res.json({ user: { id: user._id, username: user.username, email: user.email, roles: user.roles }, accessToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
}

async function login(req, res){
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) return res.status(400).json({ error: 'missing' });
    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
    if (!user) return res.status(400).json({ error: 'no_user' });
    if (!user.passwordHash) return res.status(400).json({ error: 'no_password_set' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'bad_credentials' });
    const token = generateAccess(user);
    res.json({ accessToken: token, user: { id: user._id, username: user.username, roles: user.roles } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
}

async function guestLogin(req, res){
  try {
    const { username, age, gender } = req.body;
    if (!username || !age) return res.status(400).json({ error: 'missing' });
    // username must be unique
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'user_exists' });
    const user = await User.create({ username, isGuest: true, age, gender, roles:['guest'] });
    const token = generateAccess(user);
    res.json({ accessToken: token, user: { id: user._id, username: user.username, roles: user.roles } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
}

module.exports = { register, login, guestLogin };
