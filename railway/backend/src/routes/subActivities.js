const express = require('express');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { project_id } = req.query;

  try {
    let query = 'SELECT * FROM sub_activities';
    let params = [];
    if (project_id) {
      query += ' WHERE project_id = ?';
      params.push(project_id);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sub-activities' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { project_id, name, description } = req.body;
  const id = crypto.randomUUID();

  try {
    await pool.execute(
      'INSERT INTO sub_activities (id, project_id, name, description) VALUES (?, ?, ?, ?)',
      [id, project_id, name, description || null]
    );
    const [rows] = await pool.execute('SELECT * FROM sub_activities WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create sub-activity' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.execute('DELETE FROM sub_activities WHERE id = ?', [req.params.id]);
    res.json({ message: 'Sub-activity deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete sub-activity' });
  }
});

module.exports = router;
