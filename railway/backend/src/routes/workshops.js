const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/workshops
router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query('SELECT * FROM workshops ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch workshops' });
  }
});

// POST /api/workshops
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { name, activity, date, venue, number_of_days } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO workshops (name, activity, date, venue, number_of_days, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, activity, date, venue, number_of_days || 1, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create workshop' });
  }
});

// DELETE /api/workshops/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.query('DELETE FROM workshops WHERE id = $1', [req.params.id]);
    res.json({ message: 'Workshop deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete workshop' });
  }
});

// POST /api/workshops/attendance
router.post('/attendance', async (req, res) => {
  const pool = req.app.locals.pool;
  const { workshop_id, name, email, organization, phone_number } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO workshop_attendance (workshop_id, name, email, organization, phone_number)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [workshop_id, name, email, organization, phone_number]
    );
    
    // Update registration count
    await pool.query('UPDATE workshops SET registrations = registrations + 1 WHERE id = $1', [workshop_id]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit attendance' });
  }
});

// GET /api/workshops/attendance
router.get('/attendance', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query(`
      SELECT wa.*, w.name as workshop_name, w.date as workshop_date
      FROM workshop_attendance wa
      JOIN workshops w ON wa.workshop_id = w.id
      ORDER BY wa.submitted_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

// GET /api/workshops/:id/attendance
router.get('/:id/attendance', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query(
      `SELECT wa.*, w.name as workshop_name, w.date as workshop_date
       FROM workshop_attendance wa
       JOIN workshops w ON wa.workshop_id = w.id
       WHERE wa.workshop_id = $1
       ORDER BY wa.submitted_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

module.exports = router;
