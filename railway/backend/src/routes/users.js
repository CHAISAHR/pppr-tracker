const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query('SELECT id, email, name, role, organization, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
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
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), role = COALESCE($3, role), organization = $4 WHERE id = $5 RETURNING id, email, name, role, organization',
      [name, email, role, organization || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
