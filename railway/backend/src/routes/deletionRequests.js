const express = require('express');
const crypto = require('crypto');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Record types users may request deletion for, mapped to their tables.
const TABLES = { project: 'projects', indicator: 'indicators', risk: 'risks', meeting: 'meetings' };

const mapRow = (r) => ({
  id: r.id, recordType: r.record_type, recordId: r.record_id, recordLabel: r.record_label,
  reason: r.reason, requestedByName: r.requested_by_name, organisation: r.organisation,
  status: r.status, requestedAt: r.requested_at, reviewedAt: r.reviewed_at,
});

router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { recordType, recordId, recordLabel, reason } = req.body || {};
  if (!TABLES[recordType] || !recordId) return res.status(400).json({ message: 'Unknown record' });
  if (!reason || !String(reason).trim()) return res.status(400).json({ message: 'A reason is required' });
  try {
    const [u] = await pool.execute('SELECT name, organization FROM users WHERE id = ?', [req.user.id]);
    const [dup] = await pool.execute(
      "SELECT id FROM deletion_requests WHERE record_type = ? AND record_id = ? AND status = 'pending'",
      [recordType, recordId]
    );
    if (dup.length) return res.status(409).json({ message: 'A deletion request for this record is already pending' });
    const id = crypto.randomUUID();
    await pool.execute(
      `INSERT INTO deletion_requests (id, record_type, record_id, record_label, reason, requested_by, requested_by_name, organisation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, recordType, recordId, String(recordLabel || '').slice(0, 1000), String(reason).slice(0, 5000),
       req.user.id, u[0]?.name || null, u[0]?.organization || null]
    );
    res.status(201).json({ id });
  } catch (e) {
    console.error('Create deletion request error:', e);
    res.status(500).json({ message: 'Failed to submit deletion request' });
  }
});

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM deletion_requests WHERE status = 'pending' ORDER BY requested_at DESC"
    );
    res.json(rows.map(mapRow));
  } catch (e) {
    console.error('List deletion requests error:', e);
    res.status(500).json({ message: 'Failed to fetch deletion requests' });
  }
});

// Approve deletes the record; reject just closes the request.
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const action = req.body?.action;
  if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'Invalid action' });
  try {
    const [rows] = await pool.execute("SELECT * FROM deletion_requests WHERE id = ? AND status = 'pending'", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Request not found' });
    const r = rows[0];
    if (action === 'approve') {
      await pool.execute(`DELETE FROM ${TABLES[r.record_type]} WHERE id = ?`, [r.record_id]);
    }
    await pool.execute(
      'UPDATE deletion_requests SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
      [action === 'approve' ? 'approved' : 'rejected', req.user.id, r.id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('Review deletion request error:', e);
    res.status(500).json({ message: 'Failed to review deletion request' });
  }
});

module.exports = router;
