const express = require('express');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute('SELECT * FROM indicators ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch indicators' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const d = req.body;
  const id = crypto.randomUUID();

  try {
    await pool.execute(
      `INSERT INTO indicators (id, name, description, unit, country, workstream, organisation, implementing_entity,
       activity_id, activity, long_term_outcome, core_indicators, indicator_type, indicator_definition,
       naphs, responsibility, cost_usd, data_source, evidence, year, target, q1, q2, q3, q4, quarter_3,
       annual_performance, baseline_proposal_year, target_year_1, target_year_2, target_year_3,
       target_year_4, target_year_5, target_year_6, subactivity_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, d.name, d.description || null, d.unit, d.country || null, d.workstream || null, d.organisation || null,
       d.implementing_entity || null, d.activity_id || null, d.activity || null, d.long_term_outcome || null,
       d.core_indicators || null, d.indicator_type || null, d.indicator_definition || null,
       d.naphs || null, d.responsibility || null, d.cost_usd || null, d.data_source || null, d.evidence || null,
       d.year || null, d.target || null, d.q1 || null, d.q2 || null, d.q3 || null, d.q4 || null,
       d.quarter_3 || null, d.annual_performance || null,
       d.baseline_proposal_year || null, d.target_year_1 || null, d.target_year_2 || null,
       d.target_year_3 || null, d.target_year_4 || null, d.target_year_5 || null, d.target_year_6 || null,
       d.subactivity_id || null]
    );
    const [rows] = await pool.execute('SELECT * FROM indicators WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create indicator error:', error);
    res.status(500).json({ message: 'Failed to create indicator' });
  }
});

router.post('/bulk', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const indicators = req.body;

  try {
    const results = [];
    for (const d of indicators) {
      const id = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO indicators (id, name, description, unit, country, workstream, organisation, implementing_entity,
         activity_id, activity, long_term_outcome, core_indicators, indicator_type, indicator_definition,
         naphs, responsibility, cost_usd, data_source, evidence, year, target, q1, q2, q3, q4, quarter_3,
         annual_performance, baseline_proposal_year, target_year_1, target_year_2, target_year_3,
         target_year_4, target_year_5, target_year_6, subactivity_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, d.name, d.description || null, d.unit, d.country || null, d.workstream || null, d.organisation || null,
         d.implementing_entity || null, d.activity_id || null, d.activity || null, d.long_term_outcome || null,
         d.core_indicators || null, d.indicator_type || null, d.indicator_definition || null,
         d.naphs || null, d.responsibility || null, d.cost_usd || null, d.data_source || null, d.evidence || null,
         d.year || null, d.target || null, d.q1 || null, d.q2 || null, d.q3 || null, d.q4 || null,
         d.quarter_3 || null, d.annual_performance || null,
         d.baseline_proposal_year || null, d.target_year_1 || null, d.target_year_2 || null,
         d.target_year_3 || null, d.target_year_4 || null, d.target_year_5 || null, d.target_year_6 || null,
         d.subactivity_id || null]
      );
      const [rows] = await pool.execute('SELECT * FROM indicators WHERE id = ?', [id]);
      results.push(rows[0]);
    }
    res.status(201).json(results);
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ message: 'Failed to import indicators' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const d = req.body;

  try {
    await pool.execute(
      `UPDATE indicators SET
       name = COALESCE(?, name), description = COALESCE(?, description), unit = COALESCE(?, unit),
       country = COALESCE(?, country), workstream = COALESCE(?, workstream), organisation = COALESCE(?, organisation),
       implementing_entity = COALESCE(?, implementing_entity), activity_id = COALESCE(?, activity_id),
       activity = COALESCE(?, activity), long_term_outcome = COALESCE(?, long_term_outcome),
       core_indicators = COALESCE(?, core_indicators), indicator_type = COALESCE(?, indicator_type),
       indicator_definition = COALESCE(?, indicator_definition), naphs = COALESCE(?, naphs),
       responsibility = COALESCE(?, responsibility), cost_usd = COALESCE(?, cost_usd),
       data_source = COALESCE(?, data_source), evidence = COALESCE(?, evidence),
       year = COALESCE(?, year), target = COALESCE(?, target),
       q1 = COALESCE(?, q1), q2 = COALESCE(?, q2), q3 = COALESCE(?, q3), q4 = COALESCE(?, q4),
       annual_performance = COALESCE(?, annual_performance),
       baseline_proposal_year = COALESCE(?, baseline_proposal_year),
       target_year_1 = COALESCE(?, target_year_1), target_year_2 = COALESCE(?, target_year_2),
       target_year_3 = COALESCE(?, target_year_3), target_year_4 = COALESCE(?, target_year_4),
       target_year_5 = COALESCE(?, target_year_5), target_year_6 = COALESCE(?, target_year_6)
       WHERE id = ?`,
      [d.name, d.description, d.unit, d.country, d.workstream, d.organisation,
       d.implementing_entity, d.activity_id, d.activity, d.long_term_outcome,
       d.core_indicators, d.indicator_type, d.indicator_definition, d.naphs,
       d.responsibility, d.cost_usd, d.data_source, d.evidence,
       d.year, d.target, d.q1, d.q2, d.q3, d.q4, d.annual_performance,
       d.baseline_proposal_year, d.target_year_1, d.target_year_2,
       d.target_year_3, d.target_year_4, d.target_year_5, d.target_year_6, id]
    );
    const [rows] = await pool.execute('SELECT * FROM indicators WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Indicator not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update indicator' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.execute('DELETE FROM indicators WHERE id = ?', [req.params.id]);
    res.json({ message: 'Indicator deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete indicator' });
  }
});

module.exports = router;
