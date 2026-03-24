const express = require('express');
const crypto = require('crypto');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/organisations
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute(
      `SELECT o.id, o.name, o.description, o.created_at,
        (SELECT COUNT(DISTINCT wa.id) FROM workshop_attendance wa WHERE wa.organization = o.name) as attendee_count
       FROM organisations o
       ORDER BY o.name ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get organisations error:', error);
    // Fallback: derive from workshop_attendance if organisations table doesn't exist
    try {
      const [rows] = await pool.execute(
        `SELECT organization as name, COUNT(DISTINCT name) as count
         FROM workshop_attendance
         WHERE organization IS NOT NULL AND organization != ''
         GROUP BY organization
         ORDER BY count DESC`
      );
      res.json(rows.map(r => ({ id: null, name: r.name, description: null, attendee_count: r.count })));
    } catch (fallbackError) {
      res.status(500).json({ message: 'Failed to fetch organisations' });
    }
  }
});

// POST /api/organisations
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { name, description } = req.body;

  if (!name) return res.status(400).json({ message: 'Organisation name is required' });

  try {
    const id = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO organisations (id, name, description) VALUES (?, ?, ?)',
      [id, name, description || null]
    );
    const [rows] = await pool.execute('SELECT * FROM organisations WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create organisation error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Organisation already exists' });
    }
    res.status(500).json({ message: 'Failed to create organisation' });
  }
});

// PUT /api/organisations/:id
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    await pool.execute(
      'UPDATE organisations SET name = COALESCE(?, name), description = ? WHERE id = ?',
      [name, description || null, id]
    );
    const [rows] = await pool.execute('SELECT * FROM organisations WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Organisation not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Update organisation error:', error);
    res.status(500).json({ message: 'Failed to update organisation' });
  }
});

// DELETE /api/organisations/:id
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.execute('DELETE FROM organisations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Organisation deleted' });
  } catch (error) {
    console.error('Delete organisation error:', error);
    res.status(500).json({ message: 'Failed to delete organisation' });
  }
});

module.exports = router;
