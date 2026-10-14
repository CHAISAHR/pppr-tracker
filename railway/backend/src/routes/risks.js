const express = require('express');
const crypto = require('crypto');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { ensureOrgAccess } = require('../lib/orgAccess');

const router = express.Router();

const mapRow = (r) => ({
  id: r.id,
  riskId: r.risk_id || '',
  organisation: r.organisation || '',
  description: r.description || '',
  likelihood: r.likelihood == null ? null : Number(r.likelihood),
  impact: r.impact == null ? null : Number(r.impact),
  riskScore: r.likelihood != null && r.impact != null ? Number(r.likelihood) * Number(r.impact) : null,
  mitigation: r.mitigation || '',
  owner: r.owner || '',
  status: r.status || 'Open',
  dateIdentified: r.date_identified || null,
  createdBy: r.created_by || null,
  modifiedBy: r.modified_by || null,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const clampScore = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.max(1, Math.min(5, Math.round(v)));
};

const RISK_ID_PREFIX = 'PF';

// Generates the next sequential risk ID, e.g. PF-01, PF-02, ...
const nextRiskId = async (pool) => {
  const [rows] = await pool.execute(
    `SELECT risk_id FROM risks WHERE risk_id REGEXP '^${RISK_ID_PREFIX}-[0-9]+$'`
  );
  let max = 0;
  for (const r of rows) {
    const n = parseInt(String(r.risk_id).split('-')[1], 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${RISK_ID_PREFIX}-${String(max + 1).padStart(2, '0')}`;
};

const buildFields = (body) => ({
  risk_id: body.riskId ?? body.risk_id ?? null,
  organisation: body.organisation ?? body.organization ?? null,
  description: body.description ?? '',
  likelihood: body.likelihood == null || body.likelihood === '' ? null : clampScore(body.likelihood),
  impact: body.impact == null || body.impact === '' ? null : clampScore(body.impact),
  mitigation: body.mitigation ?? null,
  owner: body.owner ?? null,
  status: body.status ?? 'Open',
  date_identified: body.dateIdentified || body.date_identified || null,
});

router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute('SELECT * FROM risks ORDER BY created_at DESC');
    res.json(rows.map(mapRow));
  } catch (error) {
    console.error('Fetch risks error:', error);
    res.status(500).json({ message: 'Failed to fetch risks' });
  }
});

const insertRisk = async (pool, body, userId) => {
  const f = buildFields(body);
  if (!f.risk_id) f.risk_id = await nextRiskId(pool);
  const id = body.id || crypto.randomUUID();
  const cols = ['id', ...Object.keys(f), 'created_by'];
  const placeholders = cols.map(() => '?').join(', ');
  const values = [id, ...Object.values(f), userId];
  await pool.execute(
    `INSERT INTO risks (${cols.join(', ')}) VALUES (${placeholders})`,
    values
  );
  const [rows] = await pool.execute('SELECT * FROM risks WHERE id = ?', [id]);
  return mapRow(rows[0]);
};


router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  if (!(await ensureOrgAccess(req, res, [req.body.organisation ?? req.body.organization]))) return;
  try {
    const risk = await insertRisk(pool, req.body, req.user.id);
    res.status(201).json(risk);
  } catch (error) {
    console.error('Create risk error:', error);
    res.status(500).json({ message: 'Failed to create risk' });
  }
});

router.post('/bulk', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  const items = Array.isArray(req.body) ? req.body : req.body?.risks;
  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Expected an array of risks' });
  }
  const inserted = [];
  const errors = [];
  for (let i = 0; i < items.length; i++) {
    try {
      inserted.push(await insertRisk(pool, items[i], req.user.id));
    } catch (e) {
      console.error('Bulk risk row error:', e);
      errors.push({ row: i + 1, message: e.message });
    }
  }
  res.status(errors.length ? 207 : 201).json({ inserted, errors });
});

router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const f = buildFields(req.body);
  const setClause = [...Object.keys(f).map((k) => `${k} = ?`), 'modified_by = ?'].join(', ');
  try {
    const [cur] = await pool.execute('SELECT organisation FROM risks WHERE id = ?', [id]);
    if (cur.length === 0) return res.status(404).json({ message: 'Risk not found' });
    if (!(await ensureOrgAccess(req, res, [cur[0].organisation]))) return;
    if (!(await ensureOrgAccess(req, res, [f.organisation ?? cur[0].organisation]))) return;
    await pool.execute(
      `UPDATE risks SET ${setClause} WHERE id = ?`,
      [...Object.values(f), req.user.id, id]
    );
    const [rows] = await pool.execute('SELECT * FROM risks WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Risk not found' });
    res.json(mapRow(rows[0]));
  } catch (error) {
    console.error('Update risk error:', error);
    res.status(500).json({ message: 'Failed to update risk' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.execute('DELETE FROM risks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Risk deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete risk' });
  }
});

module.exports = router;
