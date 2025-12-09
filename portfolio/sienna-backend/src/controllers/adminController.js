const jwt = require('jsonwebtoken');
require('dotenv').config();

// Use environment variables for admin credentials, fallback to provided credentials for local dev
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'siennaretreat@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Sienna1234';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '8h';

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Simple credential check - for production hook this up to a proper admin store
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ email, isAdmin: true }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token: `Bearer ${token}`, email, isAdmin: true });
  } catch (err) {
    console.error('Admin login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Simple middleware to protect admin routes
exports.requireAdmin = (req, res, next) => {
  try {
    const auth = req.headers.authorization || req.body.token || req.query.token;
    if (!auth) return res.status(401).json({ message: 'Missing authorization token' });

    const token = auth.replace(/^Bearer\s+/i, '');
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    req.admin = decoded;
    next();
  } catch (err) {
    console.error('Admin auth middleware error', err && err.message ? err.message : err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
