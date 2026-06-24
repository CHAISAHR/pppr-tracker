const express = require('express');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Map a DB row to the API shape used by the frontend (camelCase + date range)
const mapRow = (r) => ({
  ...r,
  meetingDateFrom: r.meeting_date_from || null,
  meetingDateTo: r.meeting_date_to || null,
  attendees: r.attendees
    ? (typeof r.attendees === 'string' ? JSON.parse(r.attendees) : r.attendees)
    : [],
});

// Pull date range out of an incoming payload, accepting either the new
// from/to fields or the legacy single `date` field (from older clients).
const extractDates = (body) => {
  const from = body.meetingDateFrom ?? body.meeting_date_from ?? body.date ?? null;
  const to = body.meetingDateTo ?? body.meeting_date_to ?? null;
  return { from: from || null, to: to || null };
};

router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM meetings ORDER BY meeting_date_from DESC'
    );
    res.json(rows.map(mapRow));
  } catch (error) {
    console.error('Fetch meetings error:', error);
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { title, description, time, venue, meeting_type, attendees, minutes, action_items, status } = req.body;
  const { from, to } = extractDates(req.body);
  const id = crypto.randomUUID();

  try {
    await pool.execute(
      `INSERT INTO meetings
        (id, title, description, meeting_date_from, meeting_date_to, time, venue, meeting_type, attendees, minutes, action_items, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title || null,
        description || null,
        from,
        to,
        time || null,
        venue || null,
        meeting_type || null,
        JSON.stringify(attendees || []),
        minutes || null,
        action_items || null,
        status || 'scheduled',
        req.user.id,
      ]
    );
    const [rows] = await pool.execute('SELECT * FROM meetings WHERE id = ?', [id]);
    res.status(201).json(mapRow(rows[0]));
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Failed to create meeting' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const { title, description, time, venue, meeting_type, attendees, minutes, action_items, status } = req.body;
  const hasFrom = 'meetingDateFrom' in req.body || 'meeting_date_from' in req.body || 'date' in req.body;
  const hasTo = 'meetingDateTo' in req.body || 'meeting_date_to' in req.body;
  const { from, to } = extractDates(req.body);

  try {
    await pool.execute(
      `UPDATE meetings SET
         title = COALESCE(?, title),
         description = COALESCE(?, description),
         meeting_date_from = CASE WHEN ? THEN ? ELSE meeting_date_from END,
         meeting_date_to = CASE WHEN ? THEN ? ELSE meeting_date_to END,
         time = COALESCE(?, time),
         venue = COALESCE(?, venue),
         meeting_type = COALESCE(?, meeting_type),
         attendees = COALESCE(?, attendees),
         minutes = COALESCE(?, minutes),
         action_items = COALESCE(?, action_items),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [
        title ?? null,
        description ?? null,
        hasFrom ? 1 : 0, from,
        hasTo ? 1 : 0, to,
        time ?? null,
        venue ?? null,
        meeting_type ?? null,
        attendees ? JSON.stringify(attendees) : null,
        minutes ?? null,
        action_items ?? null,
        status ?? null,
        id,
      ]
    );
    const [rows] = await pool.execute('SELECT * FROM meetings WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Meeting not found' });
    res.json(mapRow(rows[0]));
  } catch (error) {
    console.error('Update meeting error:', error);
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
