const express = require('express');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute('SELECT * FROM meetings ORDER BY date DESC');
    const meetings = rows.map(r => ({ ...r, attendees: r.attendees ? JSON.parse(r.attendees) : [] }));
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { title, description, date, time, venue, meeting_type, attendees, minutes, action_items, status } = req.body;
  const id = crypto.randomUUID();

  try {
    await pool.execute(
      `INSERT INTO meetings (id, title, description, date, time, venue, meeting_type, attendees, minutes, action_items, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, date, time || null, venue || null, meeting_type || null, JSON.stringify(attendees || []), minutes || null, action_items || null, status || 'scheduled', req.user.id]
    );
    const [rows] = await pool.execute('SELECT * FROM meetings WHERE id = ?', [id]);
    const meeting = rows[0];
    meeting.attendees = meeting.attendees ? JSON.parse(meeting.attendees) : [];
    res.status(201).json(meeting);
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
    await pool.execute(
      `UPDATE meetings SET title = COALESCE(?, title), description = COALESCE(?, description), date = COALESCE(?, date),
       time = COALESCE(?, time), venue = COALESCE(?, venue), meeting_type = COALESCE(?, meeting_type),
       attendees = COALESCE(?, attendees), minutes = COALESCE(?, minutes), action_items = COALESCE(?, action_items),
       status = COALESCE(?, status) WHERE id = ?`,
      [title, description, date, time, venue, meeting_type, attendees ? JSON.stringify(attendees) : null, minutes, action_items, status, id]
    );
    const [rows] = await pool.execute('SELECT * FROM meetings WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Meeting not found' });
    const meeting = rows[0];
    meeting.attendees = meeting.attendees ? JSON.parse(meeting.attendees) : [];
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update meeting' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.execute('DELETE FROM meetings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Meeting deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete meeting' });
  }
});

module.exports = router;
