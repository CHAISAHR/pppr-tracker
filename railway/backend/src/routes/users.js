const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute('SELECT id, email, name, role, organization, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// PUT /api/users/:id
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const { name, email, role, organization } = req.body;

  try {
    await pool.execute(
      'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), organization = ? WHERE id = ?',
      [name, email, role, organization || null, id]
    );
    const [rows] = await pool.execute('SELECT id, email, name, role, organization FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
