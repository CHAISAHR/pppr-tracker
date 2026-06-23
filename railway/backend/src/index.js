const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const projectsRoutes = require('./routes/projects');
const meetingsRoutes = require('./routes/meetings');
const workshopsRoutes = require('./routes/workshops');
const indicatorsRoutes = require('./routes/indicators');
const subActivitiesRoutes = require('./routes/subActivities');
const organisationsRoutes = require('./routes/organisations');
const userRequestsRoutes = require('./routes/userRequests');
const capacityAssessmentsRoutes = require('./routes/capacityAssessments');
const orgLogosRoutes = require('./routes/orgLogos');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection pool
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL || process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Make pool available to routes
app.locals.pool = pool;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/workshops', workshopsRoutes);
app.use('/api/indicators', indicatorsRoutes);
app.use('/api/sub-activities', subActivitiesRoutes);
app.use('/api/organisations', organisationsRoutes);
app.use('/api/user-requests', userRequestsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
