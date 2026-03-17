const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query('SELECT * FROM meetings ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { title, description, date, time, venue, meeting_type, attendees, minutes, action_items, status } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO meetings (title, description, date, time, venue, meeting_type, attendees, minutes, action_items, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [title, description, date, time, venue, meeting_type, attendees || [], minutes, action_items, status || 'scheduled', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Failed to create meeting' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const { title, description, date, time, venue, meeting_type, attendees, minutes, action_items, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE meetings SET title = COALESCE($1, title), description = COALESCE($2, description), date = COALESCE($3, date),
       time = COALESCE($4, time), venue = COALESCE($5, venue), meeting_type = COALESCE($6, meeting_type),
       attendees = COALESCE($7, attendees), minutes = COALESCE($8, minutes), action_items = COALESCE($9, action_items),
       status = COALESCE($10, status) WHERE id = $11 RETURNING *`,
      [title, description, date, time, venue, meeting_type, attendees, minutes, action_items, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Meeting not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update meeting' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.query('DELETE FROM meetings WHERE id = $1', [req.params.id]);
    res.json({ message: 'Meeting deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete meeting' });
  }
});

module.exports = router;
