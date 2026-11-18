require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initSchema, db } = require('./db/database');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { seed } = require('./seed');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// API Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'TheCarePal Care Quality & Feedback Engine'
  });
});

// Admin re-seed endpoint for quick testing
app.post('/api/admin/reset-seed', async (req, res) => {
  try {
    await seed();
    res.json({ success: true, message: 'Database successfully re-seeded with realistic CarePal sample data!' });
  } catch (error) {
    console.error('Error re-seeding database:', error);
    res.status(500).json({ error: 'Failed to re-seed database' });
  }
});

// Start server
async function startServer() {
  try {
    await initSchema();
    
    // Auto-seed if database has no nurses
    const nurseCount = await db.get('SELECT COUNT(*) as count FROM nurses');
    if (!nurseCount || nurseCount.count === 0) {
      console.log('Empty database detected. Running initial seed...');
      await seed();
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n=================================================`);
      console.log(`  TheCarePal Feedback API running on port ${PORT}`);
      console.log(`  Health check: http://localhost:${PORT}/api/health`);
      console.log(`=================================================\n`);
    });
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
}

startServer();
