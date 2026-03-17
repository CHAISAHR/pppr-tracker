

## MySQL Workbench Compatibility

The current Railway backend is built for **PostgreSQL** (using the `pg` npm package). MySQL Workbench connects to **MySQL** databases, not PostgreSQL — so they are incompatible as-is.

You have two options:

### Option A: Switch to MySQL on Railway
Convert the entire backend to use MySQL instead of PostgreSQL. This requires:

1. **Railway database**: Add a **MySQL** service instead of PostgreSQL
2. **Backend code changes**: Replace the `pg` package with `mysql2` in `railway/backend/`, update all SQL queries for MySQL syntax differences (e.g., `gen_random_uuid()` → `UUID()`, `TIMESTAMPTZ` → `DATETIME`, no native array columns, `TEXT[]` → separate join tables or JSON columns)
3. **Schema rewrite**: Convert `railway/schema.sql` from PostgreSQL to MySQL dialect
4. **MySQL Workbench**: Connect to the Railway MySQL instance using the host, port, user, and password from Railway's MySQL service variables

### Option B: Keep PostgreSQL, use pgAdmin instead
If your main goal is a GUI database tool, **pgAdmin** (free) or **DBeaver** (free) work with PostgreSQL the same way MySQL Workbench works with MySQL. You'd connect using Railway's `DATABASE_URL` credentials.

### Recommendation
Option A (MySQL) works fine but requires rewriting the schema and backend queries. Option B is simpler if you just need a visual database management tool.

**If you choose MySQL**, here's what changes:
- Rewrite `railway/schema.sql` for MySQL syntax
- Replace `pg` with `mysql2` in all route files
- Convert PostgreSQL arrays (`TEXT[]`) to JSON columns or join tables
- Update connection logic in `railway/backend/src/index.js`

