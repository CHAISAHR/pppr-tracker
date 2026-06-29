const express = require('express');
const crypto = require('crypto');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const shape = (r) => ({
  ...r,
  modifiedBy: r.modified_by_name || null,
  modifiedAt: r.modified_at || null,
});

router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, u.name AS modified_by_name
       FROM projects p
       LEFT JOIN users u ON u.id = p.modified_by
       ORDER BY p.created_at DESC`
    );
    res.json(rows.map(shape));
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const {
    activity_id, activity_description, sub_activity_id, sub_activity_description,
    implementing_entity, delivery_partner, status, start_date, end_date, comments,
  } = req.body;
  const id = crypto.randomUUID();

  try {
    await pool.execute(
      `INSERT INTO projects (
         id, activity_id, activity_description, sub_activity_id, sub_activity_description,
         implementing_entity, delivery_partner, status, start_date, end_date, comments, created_by
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        activity_id || null, activity_description || null,
        sub_activity_id || null, sub_activity_description || null,
        implementing_entity || null, delivery_partner || null,
        status || 'Not Yet Started', start_date || null, end_date || null,
        comments || null, req.user.id,
      ]
    );
    const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
    res.status(201).json(shape(rows[0]));
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const {
    activity_id, activity_description, sub_activity_id, sub_activity_description,
    implementing_entity, delivery_partner, status, start_date, end_date, comments,
  } = req.body;

  try {
    await pool.execute(
      `UPDATE projects SET
         activity_id = COALESCE(?, activity_id),
         activity_description = COALESCE(?, activity_description),
         sub_activity_id = COALESCE(?, sub_activity_id),
         sub_activity_description = COALESCE(?, sub_activity_description),
         implementing_entity = COALESCE(?, implementing_entity),
         delivery_partner = COALESCE(?, delivery_partner),
         status = COALESCE(?, status),
         start_date = COALESCE(?, start_date),
         end_date = COALESCE(?, end_date),
         comments = COALESCE(?, comments),
         modified_by = ?, modified_at = NOW()
       WHERE id = ?`,
      [
        activity_id ?? null, activity_description ?? null,
        sub_activity_id ?? null, sub_activity_description ?? null,
        implementing_entity ?? null, delivery_partner ?? null,
        status ?? null, start_date ?? null, end_date ?? null,
        comments ?? null, req.user.id, id,
      ]
    );
    const [rows] = await pool.execute(
      `SELECT p.*, u.name AS modified_by_name FROM projects p
       LEFT JOIN users u ON u.id = p.modified_by WHERE p.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Project not found' });
    res.json(shape(rows[0]));
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Failed to update project', error: error.message });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

module.exports = router;
