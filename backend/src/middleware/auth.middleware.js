// paste into backend/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change_me_access';

function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'no_auth' });
  const token = auth.split(' ')[1];
  try {
    const data = jwt.verify(token, ACCESS_SECRET);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

module.exports = authMiddleware;
