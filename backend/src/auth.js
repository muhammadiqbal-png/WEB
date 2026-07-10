const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config');

function createToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: '8h' }
  );
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.auth = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa' });
  }
}

module.exports = { createToken, requireAuth };
