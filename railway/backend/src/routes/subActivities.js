const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query('SELECT * FROM sub_activities ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sub-activities' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { project_id, name, description } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO sub_activities (project_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [project_id, name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create sub-activity' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.query('DELETE FROM sub_activities WHERE id = $1', [req.params.id]);
    res.json({ message: 'Sub-activity deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete sub-activity' });
  }
});

module.exports = router;
