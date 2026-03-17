const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/projects
router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// POST /api/projects
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { title, description, status, start_date, end_date, budget, delivery_partners, country, organisation } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO projects (title, description, status, start_date, end_date, budget, delivery_partners, country, organisation, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [title, description, status || 'active', start_date, end_date, budget, delivery_partners || [], country, organisation, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// PUT /api/projects/:id
router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const { title, description, status, start_date, end_date, budget, delivery_partners, country, organisation } = req.body;

  try {
    const result = await pool.query(
      `UPDATE projects SET title = COALESCE($1, title), description = COALESCE($2, description), status = COALESCE($3, status),
       start_date = COALESCE($4, start_date), end_date = COALESCE($5, end_date), budget = COALESCE($6, budget),
       delivery_partners = COALESCE($7, delivery_partners), country = COALESCE($8, country), organisation = COALESCE($9, organisation)
       WHERE id = $10 RETURNING *`,
      [title, description, status, start_date, end_date, budget, delivery_partners, country, organisation, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

module.exports = router;
