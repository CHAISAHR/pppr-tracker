const express = require('express');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute('SELECT * FROM projects ORDER BY created_at DESC');
    // Parse JSON delivery_partners back to arrays
    const projects = rows.map(r => ({ ...r, delivery_partners: r.delivery_partners ? JSON.parse(r.delivery_partners) : [] }));
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { title, description, status, start_date, end_date, budget, delivery_partners, country, organisation } = req.body;
  const id = crypto.randomUUID();

  try {
    await pool.execute(
      `INSERT INTO projects (id, title, description, status, start_date, end_date, budget, delivery_partners, country, organisation, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, status || 'active', start_date || null, end_date || null, budget || null, JSON.stringify(delivery_partners || []), country || null, organisation || null, req.user.id]
    );
    const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
    const project = rows[0];
    project.delivery_partners = project.delivery_partners ? JSON.parse(project.delivery_partners) : [];
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const { title, description, status, start_date, end_date, budget, delivery_partners, country, organisation } = req.body;

  try {
    await pool.execute(
      `UPDATE projects SET title = COALESCE(?, title), description = COALESCE(?, description), status = COALESCE(?, status),
       start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date), budget = COALESCE(?, budget),
       delivery_partners = COALESCE(?, delivery_partners), country = COALESCE(?, country), organisation = COALESCE(?, organisation)
       WHERE id = ?`,
      [title, description, status, start_date, end_date, budget, delivery_partners ? JSON.stringify(delivery_partners) : null, country, organisation, id]
    );
    const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Project not found' });
    const project = rows[0];
    project.delivery_partners = project.delivery_partners ? JSON.parse(project.delivery_partners) : [];
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

module.exports = router;
