const express = require('express');
const crypto = require('crypto');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const parseJson = (v, fallback) => {
  if (v == null) return fallback;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return fallback; }
};

// Map a DB row to the API shape used by the frontend.
const mapRow = (r) => ({
  id: r.id,
  activityId: r.activity_id || '',
  subActivityId: r.sub_activity_id || '',
  quarter: r.quarter || '',
  meetingDateFrom: r.meeting_date_from || undefined,
  meetingDateTo: r.meeting_date_to || undefined,
  focusArea: r.focus_area || '',
  implementingEntities: parseJson(r.implementing_entities, []) || [],
  deliveryPartners: parseJson(r.delivery_partners, []) || [],
  keyObjectives: r.key_objectives || '',
  format: r.format || 'Virtual',
  links: r.links || undefined,
  organiserName: r.organiser_name || undefined,
  organiserEmail: r.organiser_email || undefined,
  organiserPhone: r.organiser_phone || undefined,
  preSurveyLink: r.pre_survey_link || undefined,
  postSurveyLink: r.post_survey_link || undefined,
  preSurveyQrCode: r.pre_survey_qr_code || undefined,
  postSurveyQrCode: r.post_survey_qr_code || undefined,
  attachments: r.attachments || undefined,
});

// Build the column/value pair for an incoming meeting payload.
const buildFields = (body) => {
  const dateFrom = body.meetingDateFrom ?? body.meeting_date_from ?? body.date ?? null;
  const dateTo = body.meetingDateTo ?? body.meeting_date_to ?? null;
  return {
    activity_id: body.activityId ?? null,
    sub_activity_id: body.subActivityId ?? null,
    quarter: body.quarter ?? null,
    meeting_date_from: dateFrom || null,
    meeting_date_to: dateTo || null,
    focus_area: body.focusArea ?? null,
    implementing_entities: JSON.stringify(body.implementingEntities || []),
    delivery_partners: JSON.stringify(body.deliveryPartners || []),
    key_objectives: body.keyObjectives ?? null,
    format: body.format ?? null,
    links: body.links ?? null,
    organiser_name: body.organiserName ?? null,
    organiser_email: body.organiserEmail ?? null,
    organiser_phone: body.organiserPhone ?? null,
    pre_survey_link: body.preSurveyLink ?? null,
    post_survey_link: body.postSurveyLink ?? null,
    pre_survey_qr_code: body.preSurveyQrCode ?? null,
    post_survey_qr_code: body.postSurveyQrCode ?? null,
    attachments: body.attachments ?? null,
  };
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

const insertMeeting = async (pool, body, userId) => {
  const f = buildFields(body);
  const id = body.id || crypto.randomUUID();
  const cols = ['id', ...Object.keys(f), 'created_by'];
  const placeholders = cols.map(() => '?').join(', ');
  const values = [id, ...Object.values(f), userId];
  await pool.execute(
    `INSERT INTO meetings (${cols.join(', ')}) VALUES (${placeholders})`,
    values
  );
  const [rows] = await pool.execute('SELECT * FROM meetings WHERE id = ?', [id]);
  return mapRow(rows[0]);
};

router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const meeting = await insertMeeting(pool, req.body, req.user.id);
    res.status(201).json(meeting);
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Failed to create meeting' });
  }
});

// Bulk insert used by the Excel upload — one round-trip per row in a single request.
router.post('/bulk', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const items = Array.isArray(req.body) ? req.body : req.body?.meetings;
  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Expected an array of meetings' });
  }
  const inserted = [];
  const errors = [];
  for (let i = 0; i < items.length; i++) {
    try {
      inserted.push(await insertMeeting(pool, items[i], req.user.id));
    } catch (e) {
      console.error('Bulk meeting row error:', e);
      errors.push({ row: i + 1, message: e.message });
    }
  }
  res.status(errors.length ? 207 : 201).json({ inserted, errors });
});

router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const f = buildFields(req.body);
  const setClause = Object.keys(f).map((k) => `${k} = ?`).join(', ');
  try {
    await pool.execute(
      `UPDATE meetings SET ${setClause} WHERE id = ?`,
      [...Object.values(f), id]
    );
    const [rows] = await pool.execute('SELECT * FROM meetings WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Meeting not found' });
    res.json(mapRow(rows[0]));
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ message: 'Failed to update meeting' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.execute('DELETE FROM meetings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Meeting deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete meeting' });
  }
});

module.exports = router;
