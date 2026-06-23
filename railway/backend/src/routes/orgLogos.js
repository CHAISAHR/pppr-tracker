const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/org-logos - public read
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute(
      `SELECT name, data_url FROM org_logos`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get org logos error:', error);
    res.status(500).json({ message: 'Failed to fetch org logos' });
  }
});

// PUT /api/org-logos/:name - upsert (admin only)
router.put('/:name', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { name } = req.params;
  const { data_url } = req.body || {};
  if (!data_url) return res.status(400).json({ message: 'data_url is required' });
  try {
    await pool.execute(
      `INSERT INTO org_logos (name, data_url) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE data_url = VALUES(data_url)`,
      [name, data_url]
    );
    res.json({ name, data_url });
  } catch (error) {
    console.error('Upsert org logo error:', error);
    res.status(500).json({ message: 'Failed to save org logo' });
  }
});

// DELETE /api/org-logos/:name (admin only)
router.delete('/:name', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.execute(`DELETE FROM org_logos WHERE name = ?`, [req.params.name]);
    res.json({ message: 'Logo deleted' });
  } catch (error) {
    console.error('Delete org logo error:', error);
    res.status(500).json({ message: 'Failed to delete logo' });
  }
});

module.exports = router;
