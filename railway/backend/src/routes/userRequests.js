const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/user-requests  (public) — submit a new access request
router.post('/', async (req, res) => {
  const pool = req.app.locals.pool;
  const { name, email, password, organization } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const [existingUser] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    const [existingReq] = await pool.execute(
      "SELECT id FROM user_requests WHERE email = ? AND status = 'pending'",
      [email]
    );
    if (existingReq.length > 0) {
      return res.status(400).json({ message: 'A pending request for this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO user_requests (id, name, email, password_hash, organization) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, passwordHash, organization || null]
    );
    res.status(201).json({ message: 'Request submitted. An administrator will review it shortly.' });
  } catch (error) {
    console.error('Create user request error:', error);
    res.status(500).json({ message: 'Failed to submit request' });
  }
});

// GET /api/user-requests  (admin) — list pending requests
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, organization, status, requested_at FROM user_requests WHERE status = 'pending' ORDER BY requested_at DESC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user requests' });
  }
});

// GET /api/user-requests/count  (admin) — pending count for the ribbon
router.get('/count', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS count FROM user_requests WHERE status = 'pending'"
    );
    res.json({ count: Number(rows[0].count) || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch count' });
  }
});

// POST /api/user-requests/:id/approve  (admin)
router.post('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const { role } = req.body; // optional: 'admin' or 'user'

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM user_requests WHERE id = ? AND status = 'pending'",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    const r = rows[0];

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [r.email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const userId = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO users (id, email, password_hash, name, role, organization) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, r.email, r.password_hash, r.name, role === 'admin' ? 'admin' : 'user', r.organization || null]
    );
    await pool.execute(
      "UPDATE user_requests SET status = 'approved', reviewed_at = NOW(), reviewed_by = ? WHERE id = ?",
      [req.user.id, id]
    );
    res.json({ message: 'Request approved', userId });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ message: 'Failed to approve request' });
  }
});

// POST /api/user-requests/:id/reject  (admin)
router.post('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [result] = await pool.execute(
      "UPDATE user_requests SET status = 'rejected', reviewed_at = NOW(), reviewed_by = ? WHERE id = ? AND status = 'pending'",
      [req.user.id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject request' });
  }
});

module.exports = router;
