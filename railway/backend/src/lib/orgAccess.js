// Organisation-scoped edit rules: admins edit everything; other users may only
// create/edit records that carry their own organisation's name.
const norm = (s) => String(s ?? '').trim().toLowerCase();

const splitOrgs = (v) => {
  if (v == null) return [];
  if (Array.isArray(v)) return v.flatMap(splitOrgs);
  if (typeof v === 'string' && v.trim().startsWith('[')) {
    try { return splitOrgs(JSON.parse(v)); } catch { /* fall through */ }
  }
  return String(v).split(/[;,]/).map(norm).filter(Boolean);
};

async function userOrganisation(pool, userId) {
  const [rows] = await pool.execute('SELECT organization FROM users WHERE id = ?', [userId]);
  return rows[0]?.organization || '';
}

// Returns true when allowed; otherwise sends 403 and returns false.
async function ensureOrgAccess(req, res, values) {
  if (req.user?.role === 'admin') return true;
  const org = norm(await userOrganisation(req.app.locals.pool, req.user.id));
  if (org && values.flatMap(splitOrgs).includes(org)) return true;
  res.status(403).json({ message: 'You can only add or edit records for your own organisation' });
  return false;
}

module.exports = { ensureOrgAccess, splitOrgs, userOrganisation };
