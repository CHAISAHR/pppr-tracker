const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/indicators
router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query('SELECT * FROM indicators ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch indicators' });
  }
});

// POST /api/indicators
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const d = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO indicators (name, description, unit, country, workstream, organisation, implementing_entity,
       activity_id, activity, long_term_outcome, core_indicators, indicator_type, indicator_definition,
       naphs, responsibility, cost_usd, data_source, evidence, year, target, q1, q2, q3, q4, quarter_3,
       annual_performance, baseline_proposal_year, target_year_1, target_year_2, target_year_3,
       target_year_4, target_year_5, target_year_6, subactivity_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34)
       RETURNING *`,
      [d.name, d.description, d.unit, d.country, d.workstream, d.organisation, d.implementing_entity,
       d.activity_id, d.activity, d.long_term_outcome, d.core_indicators, d.indicator_type, d.indicator_definition,
       d.naphs, d.responsibility, d.cost_usd, d.data_source, d.evidence, d.year, d.target,
       d.q1, d.q2, d.q3, d.q4, d.quarter_3, d.annual_performance,
       d.baseline_proposal_year, d.target_year_1, d.target_year_2, d.target_year_3,
       d.target_year_4, d.target_year_5, d.target_year_6, d.subactivity_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create indicator error:', error);
    res.status(500).json({ message: 'Failed to create indicator' });
  }
});

// POST /api/indicators/bulk
router.post('/bulk', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const indicators = req.body;

  try {
    const results = [];
    for (const d of indicators) {
      const result = await pool.query(
        `INSERT INTO indicators (name, description, unit, country, workstream, organisation, implementing_entity,
         activity_id, activity, long_term_outcome, core_indicators, indicator_type, indicator_definition,
         naphs, responsibility, cost_usd, data_source, evidence, year, target, q1, q2, q3, q4, quarter_3,
         annual_performance, baseline_proposal_year, target_year_1, target_year_2, target_year_3,
         target_year_4, target_year_5, target_year_6, subactivity_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34)
         RETURNING *`,
        [d.name, d.description, d.unit, d.country, d.workstream, d.organisation, d.implementing_entity,
         d.activity_id, d.activity, d.long_term_outcome, d.core_indicators, d.indicator_type, d.indicator_definition,
         d.naphs, d.responsibility, d.cost_usd, d.data_source, d.evidence, d.year, d.target,
         d.q1, d.q2, d.q3, d.q4, d.quarter_3, d.annual_performance,
         d.baseline_proposal_year, d.target_year_1, d.target_year_2, d.target_year_3,
         d.target_year_4, d.target_year_5, d.target_year_6, d.subactivity_id]
      );
      results.push(result.rows[0]);
    }
    res.status(201).json(results);
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ message: 'Failed to import indicators' });
  }
});

// PUT /api/indicators/:id
router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const d = req.body;

  try {
    const result = await pool.query(
      `UPDATE indicators SET
       name = COALESCE($1, name), description = COALESCE($2, description), unit = COALESCE($3, unit),
       country = COALESCE($4, country), workstream = COALESCE($5, workstream), organisation = COALESCE($6, organisation),
       implementing_entity = COALESCE($7, implementing_entity), activity_id = COALESCE($8, activity_id),
       activity = COALESCE($9, activity), long_term_outcome = COALESCE($10, long_term_outcome),
       core_indicators = COALESCE($11, core_indicators), indicator_type = COALESCE($12, indicator_type),
       indicator_definition = COALESCE($13, indicator_definition), naphs = COALESCE($14, naphs),
       responsibility = COALESCE($15, responsibility), cost_usd = COALESCE($16, cost_usd),
       data_source = COALESCE($17, data_source), evidence = COALESCE($18, evidence),
       year = COALESCE($19, year), target = COALESCE($20, target),
       q1 = COALESCE($21, q1), q2 = COALESCE($22, q2), q3 = COALESCE($23, q3), q4 = COALESCE($24, q4),
       annual_performance = COALESCE($25, annual_performance),
       baseline_proposal_year = COALESCE($26, baseline_proposal_year),
       target_year_1 = COALESCE($27, target_year_1), target_year_2 = COALESCE($28, target_year_2),
       target_year_3 = COALESCE($29, target_year_3), target_year_4 = COALESCE($30, target_year_4),
       target_year_5 = COALESCE($31, target_year_5), target_year_6 = COALESCE($32, target_year_6)
       WHERE id = $33 RETURNING *`,
      [d.name, d.description, d.unit, d.country, d.workstream, d.organisation,
       d.implementing_entity, d.activity_id, d.activity, d.long_term_outcome,
       d.core_indicators, d.indicator_type, d.indicator_definition, d.naphs,
       d.responsibility, d.cost_usd, d.data_source, d.evidence,
       d.year, d.target, d.q1, d.q2, d.q3, d.q4, d.annual_performance,
       d.baseline_proposal_year, d.target_year_1, d.target_year_2,
       d.target_year_3, d.target_year_4, d.target_year_5, d.target_year_6, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Indicator not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update indicator' });
  }
});

// DELETE /api/indicators/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.query('DELETE FROM indicators WHERE id = $1', [req.params.id]);
    res.json({ message: 'Indicator deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete indicator' });
  }
});

module.exports = router;
