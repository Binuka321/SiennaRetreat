const UserAuth = require('../models/UserAuth');
const UserProfile = require('../models/UserProfile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

// Dev fallback file location
const DEV_USERS_FILE = path.join(__dirname, '..', '..', 'dev_users.json');

async function readDevUsers() {
  try {
    const raw = await fs.readFile(DEV_USERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

async function writeDevUsers(users) {
  await fs.writeFile(DEV_USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function isDbConnected() {
  try {
    return mongoose.connection && mongoose.connection.readyState === 1;
  } catch (e) {
    return false;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const SALT_ROUNDS = 10;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'siennaretreat@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Sienna1234';
const ADMIN_JWT_EXPIRES = process.env.ADMIN_JWT_EXPIRES || '8h';

exports.register = async (req, res) => {
  try {
    const { username, email, password, phone, address } = req.body;
    if (!password || (!username && !email)) {
      return res.status(400).json({ message: 'username or email and password required' });
    }

    // If DB is connected, use MongoDB; otherwise fall back to a local dev file
    if (isDbConnected()) {
      const existing = await UserAuth.findOne({ $or: [{ username }, { email }] });
      if (existing) return res.status(409).json({ message: 'User with that username or email already exists' });

      // bcryptjs provides sync helpers; using sync here is fine for short operations
      const hash = bcrypt.hashSync(password, SALT_ROUNDS);
      const user = new UserAuth({ username, email, passwordHash: hash });
      await user.save();

      // Also create a UserProfile record so admin can see registered users
      try {
        await UserProfile.findOneAndUpdate(
          { email },
          { name: username || email, email, phone: phone || '', address: address || '' },
          { upsert: true, new: true }
        );
        console.log('[Auth] Created UserProfile for', email);
      } catch (profileErr) {
        console.error('[Auth] Could not create UserProfile:', profileErr.message);
        // Don't fail registration if profile creation fails
      }

      const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ message: 'Registered', token, user: { id: user._id, username: user.username, email: user.email } });
    }

    // DEV fallback: store/read users from local JSON file
    const users = await readDevUsers();
    const exists = users.find(u => (username && u.username === username) || (email && u.email === email));
    if (exists) return res.status(409).json({ message: 'User with that username or email already exists (dev)' });

    const hash = bcrypt.hashSync(password, SALT_ROUNDS);
    const newUser = { id: `dev-${Date.now()}-${Math.floor(Math.random()*10000)}`, username: username || null, email: email || null, passwordHash: hash, createdAt: new Date().toISOString() };
    users.push(newUser);
    await writeDevUsers(users);

    const token = jwt.sign({ id: newUser.id, username: newUser.username, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ message: 'Registered (dev)', token, user: { id: newUser.id, username: newUser.username, email: newUser.email } });
  } catch (err) {
    console.error('auth.register error', err);
    res.status(500).json({ message: 'Server error', error: err && err.message ? err.message : String(err) });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, email, password, phone, address } = req.body;
    if (!password || (!username && !email)) {
      return res.status(400).json({ message: 'username or email and password required' });
    }

    // If DB is connected, use MongoDB; otherwise fall back to local dev file
    if (isDbConnected()) {
      const user = await UserAuth.findOne(username ? { username } : { email });
      if (!user || !user.passwordHash) return res.status(401).json({ message: 'Invalid credentials' });

      const ok = bcrypt.compareSync(password, user.passwordHash);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

      // Ensure UserProfile exists for this user and update phone/address if provided
      try {
        const updateData = { name: user.username || user.email, email: user.email };
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        await UserProfile.findOneAndUpdate(
          { email: user.email },
          updateData,
          { upsert: true, new: true }
        );
      } catch (profileErr) {
        console.error('[Auth] Could not ensure UserProfile on login:', profileErr.message);
        // Don't fail login if profile update fails
      }

      const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      // If this credential matches admin, issue an admin token too
      let adminToken = null;
      if ((user.email && user.email === ADMIN_EMAIL) && password === ADMIN_PASSWORD) {
        const at = jwt.sign({ email: ADMIN_EMAIL, isAdmin: true }, JWT_SECRET, { expiresIn: ADMIN_JWT_EXPIRES });
        adminToken = `Bearer ${at}`;
      }
      return res.json({ message: 'Logged in', token, adminToken, user: { id: user._id, username: user.username, email: user.email, isAdmin: !!adminToken } });
    }

    // DEV fallback: read from JSON file
    const users = await readDevUsers();
    const found = users.find(u => (username && u.username === username) || (email && u.email === email));
    if (!found || !found.passwordHash) return res.status(401).json({ message: 'Invalid credentials (dev)' });
    const ok = bcrypt.compareSync(password, found.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials (dev)' });

    const token = jwt.sign({ id: found.id, username: found.username, email: found.email }, JWT_SECRET, { expiresIn: '7d' });
    let adminToken = null;
    if ((found.email && found.email === ADMIN_EMAIL) && password === ADMIN_PASSWORD) {
      const at = jwt.sign({ email: ADMIN_EMAIL, isAdmin: true }, JWT_SECRET, { expiresIn: ADMIN_JWT_EXPIRES });
      adminToken = `Bearer ${at}`;
    }
    return res.json({ message: 'Logged in (dev)', token, adminToken, user: { id: found.id, username: found.username, email: found.email, isAdmin: !!adminToken } });
  } catch (err) {
    console.error('auth.login error', err);
    res.status(500).json({ message: 'Server error', error: err && err.message ? err.message : String(err) });
  }
};
