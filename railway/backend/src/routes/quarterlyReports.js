const express = require('express');
const crypto = require('crypto');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const parseJson = (v, fb) => { try { return v ? JSON.parse(v) : fb; } catch { return fb; } };

const mapReport = (r) => ({
  id: r.id, title: r.title, quarter: r.quarter || '', dueDate: r.due_date || null,
  status: r.status, publishedAt: r.published_at, createdAt: r.created_at,
});
const mapResponse = (r) => ({
  id: r.id, reportId: r.report_id, organisation: r.organisation,
  answers: parseJson(r.answers, {}), status: r.status,
  submittedBy: r.submitted_by, submittedAt: r.submitted_at, updatedAt: r.updated_at,
});

const userOrg = async (pool, userId) => {
  const [rows] = await pool.execute('SELECT organization FROM users WHERE id = ?', [userId]);
  return rows[0]?.organization || null;
};

// Admins see all reports; everyone else only published ones.
router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const sql = req.user.role === 'admin'
      ? 'SELECT * FROM quarterly_reports ORDER BY created_at DESC'
      : "SELECT * FROM quarterly_reports WHERE status = 'Published' ORDER BY created_at DESC";
    const [rows] = await pool.execute(sql);
    res.json(rows.map(mapReport));
  } catch (e) {
    console.error('Fetch quarterly reports error:', e);
    res.status(500).json({ message: 'Failed to fetch quarterly reports' });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { title, quarter, dueDate } = req.body || {};
  if (!title) return res.status(400).json({ message: 'Title is required' });
  const id = crypto.randomUUID();
  try {
    await pool.execute(
      'INSERT INTO quarterly_reports (id, title, quarter, due_date, created_by) VALUES (?, ?, ?, ?, ?)',
      [id, String(title).slice(0, 255), quarter || null, dueDate || null, req.user.id]
    );
    const [rows] = await pool.execute('SELECT * FROM quarterly_reports WHERE id = ?', [id]);
    res.status(201).json(mapReport(rows[0]));
  } catch (e) {
    console.error('Create quarterly report error:', e);
    res.status(500).json({ message: 'Failed to create quarterly report' });
  }
});

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const { title, quarter, dueDate, status } = req.body || {};
  const allowed = ['Draft', 'Published', 'Closed'];
  if (status && !allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    const [cur] = await pool.execute('SELECT * FROM quarterly_reports WHERE id = ?', [req.params.id]);
    if (!cur.length) return res.status(404).json({ message: 'Report not found' });
    const c = cur[0];
    const newStatus = status || c.status;
    const publishedAt = newStatus === 'Published' && c.status !== 'Published' ? new Date() : c.published_at;
    await pool.execute(
      'UPDATE quarterly_reports SET title = ?, quarter = ?, due_date = ?, status = ?, published_at = ? WHERE id = ?',
      [title ?? c.title, quarter ?? c.quarter, dueDate === undefined ? c.due_date : (dueDate || null), newStatus, publishedAt, req.params.id]
    );
    const [rows] = await pool.execute('SELECT * FROM quarterly_reports WHERE id = ?', [req.params.id]);
    res.json(mapReport(rows[0]));
  } catch (e) {
    console.error('Update quarterly report error:', e);
    res.status(500).json({ message: 'Failed to update quarterly report' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.execute('DELETE FROM quarterly_reports WHERE id = ?', [req.params.id]);
    res.json({ message: 'Report deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete quarterly report' });
  }
});

// Admins get every organisation's response; users get only their organisation's.
router.get('/:id/responses', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    if (req.user.role === 'admin') {
      const [rows] = await pool.execute(
        'SELECT * FROM quarterly_report_responses WHERE report_id = ? ORDER BY organisation', [req.params.id]);
      return res.json(rows.map(mapResponse));
    }
    const org = await userOrg(pool, req.user.id);
    if (!org) return res.json([]);
    const [rows] = await pool.execute(
      'SELECT * FROM quarterly_report_responses WHERE report_id = ? AND organisation = ?', [req.params.id, org]);
    res.json(rows.map(mapResponse));
  } catch (e) {
    console.error('Fetch responses error:', e);
    res.status(500).json({ message: 'Failed to fetch responses' });
  }
});

// Save (upsert) a response. Users can only save for their own organisation, on a published report.
router.put('/:id/responses', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { answers, status, organisation, submittedBy } = req.body || {};
  try {
    const [rep] = await pool.execute('SELECT status FROM quarterly_reports WHERE id = ?', [req.params.id]);
    if (!rep.length) return res.status(404).json({ message: 'Report not found' });
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && rep[0].status !== 'Published') return res.status(403).json({ message: 'Report is not open' });
    const org = isAdmin && organisation ? organisation : await userOrg(pool, req.user.id);
    if (!org) return res.status(400).json({ message: 'Your account has no organisation' });
    const st = status === 'Submitted' ? 'Submitted' : 'Draft';
    const json = JSON.stringify(answers || {}).slice(0, 60000);
    await pool.execute(
      `INSERT INTO quarterly_report_responses (id, report_id, organisation, answers, status, submitted_by, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE answers = VALUES(answers), status = VALUES(status),
         submitted_by = VALUES(submitted_by), submitted_at = VALUES(submitted_at)`,
      [crypto.randomUUID(), req.params.id, org, json, st, submittedBy ? String(submittedBy).slice(0, 255) : null,
       st === 'Submitted' ? new Date() : null]
    );
    const [rows] = await pool.execute(
      'SELECT * FROM quarterly_report_responses WHERE report_id = ? AND organisation = ?', [req.params.id, org]);
    res.json(mapResponse(rows[0]));
  } catch (e) {
    console.error('Save response error:', e);
    res.status(500).json({ message: 'Failed to save response' });
  }
});

module.exports = router;
