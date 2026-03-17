const express = require('express');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute('SELECT * FROM workshops ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch workshops' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { name, activity, date, venue, number_of_days } = req.body;
  const id = crypto.randomUUID();

  try {
    await pool.execute(
      `INSERT INTO workshops (id, name, activity, date, venue, number_of_days, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, activity || null, date, venue || null, number_of_days || 1, req.user.id]
    );
    const [rows] = await pool.execute('SELECT * FROM workshops WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create workshop' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.execute('DELETE FROM workshops WHERE id = ?', [req.params.id]);
    res.json({ message: 'Workshop deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete workshop' });
  }
});

// POST /api/workshops/attendance
router.post('/attendance', async (req, res) => {
  const pool = req.app.locals.pool;
  const { workshop_id, name, email, organization, phone_number } = req.body;
  const id = crypto.randomUUID();

  try {
    await pool.execute(
      `INSERT INTO workshop_attendance (id, workshop_id, name, email, organization, phone_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, workshop_id, name, email || null, organization || null, phone_number || null]
    );
    await pool.execute('UPDATE workshops SET registrations = registrations + 1 WHERE id = ?', [workshop_id]);
    const [rows] = await pool.execute('SELECT * FROM workshop_attendance WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit attendance' });
  }
});

// GET /api/workshops/attendance
router.get('/attendance', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute(`
      SELECT wa.*, w.name as workshop_name, w.date as workshop_date
      FROM workshop_attendance wa
      JOIN workshops w ON wa.workshop_id = w.id
      ORDER BY wa.submitted_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

// GET /api/workshops/:id/attendance
router.get('/:id/attendance', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute(
      `SELECT wa.*, w.name as workshop_name, w.date as workshop_date
       FROM workshop_attendance wa
       JOIN workshops w ON wa.workshop_id = w.id
       WHERE wa.workshop_id = ?
       ORDER BY wa.submitted_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

module.exports = router;
