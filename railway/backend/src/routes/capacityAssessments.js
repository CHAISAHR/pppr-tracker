const express = require('express');
const crypto = require('crypto');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/capacity-assessments - public read
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute(
      `SELECT id, event_id, event_focus_area, event_date, focus_area, sector,
              participant_name, competency, pre_score, post_score, created_at, updated_at
       FROM capacity_assessments
       ORDER BY event_date DESC, participant_name ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get capacity assessments error:', error);
    res.status(500).json({ message: 'Failed to fetch capacity assessments' });
  }
});

// POST /api/capacity-assessments - bulk insert
// Body: { rows: [{ event_id, event_focus_area, event_date, participant_name, competency, pre_score, post_score }] }
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  if (!rows.length) return res.json({ inserted: 0, ids: [] });

  try {
    const ids = [];
    for (const r of rows) {
      const id = crypto.randomUUID();
      ids.push(id);
      await pool.execute(
        `INSERT INTO capacity_assessments
         (id, event_id, event_focus_area, event_date, participant_name, competency, pre_score, post_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          r.event_id || null,
          r.event_focus_area || '',
          r.event_date || null,
          r.participant_name || '',
          r.competency || '',
          r.pre_score ?? null,
          r.post_score ?? null,
        ]
      );
    }
    res.status(201).json({ inserted: ids.length, ids });
  } catch (error) {
    console.error('Insert capacity assessments error:', error);
    res.status(500).json({ message: 'Failed to insert capacity assessments' });
  }
});

// DELETE /api/capacity-assessments - bulk delete by ids
// Body: { ids: [uuid, ...] }
router.delete('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  if (!ids.length) return res.json({ deleted: 0 });
  try {
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await pool.execute(
      `DELETE FROM capacity_assessments WHERE id IN (${placeholders})`,
      ids
    );
    res.json({ deleted: result.affectedRows });
  } catch (error) {
    console.error('Delete capacity assessments error:', error);
    res.status(500).json({ message: 'Failed to delete capacity assessments' });
  }
});

module.exports = router;
