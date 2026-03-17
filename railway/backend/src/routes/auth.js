const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const pool = req.app.locals.pool;
  const { email, password, name, organization } = req.body;

  try {
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO users (id, email, password_hash, name, organization) VALUES (?, ?, ?, ?, ?)',
      [id, email, passwordHash, name, organization || null]
    );

    const [rows] = await pool.execute('SELECT id, email, name, role, organization FROM users WHERE id = ?', [id]);
    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const pool = req.app.locals.pool;
  const { email, password } = req.body;

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, name, role, organization FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out' });
});

module.exports = router;
