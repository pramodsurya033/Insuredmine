require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const connectDB = require('./middleware/database');
const CPUMonitorService = require('./services/CPUMonitorService');

// Import routes
const uploadRoutes = require('./routes/uploadRoutes');
const policyRoutes = require('./routes/policyRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// Initialize CPU Monitor
const cpuMonitor = new CPUMonitorService(70, 5000); // 70% threshold, check every 5 seconds

// Start monitoring CPU usage
cpuMonitor.startMonitoring((usage) => {
  console.error(`⚠️  CRITICAL: CPU usage at ${usage}%! Restarting server in 10 seconds...`);
  
  // Graceful shutdown and restart
  setTimeout(() => {
    console.log('Shutting down gracefully...');
    process.exit(0);
  }, 10000);
});

// Connect to MongoDB and start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   Insurance API Server                    ║
║   Running on http://localhost:${PORT}        ║
╚════════════════════════════════════════════╝

📍 Available Endpoints:
  • POST   /api/upload - Upload and process CSV/XLSX file
  • GET    /api/policies/search?username=<name> - Search policies by user
  • GET    /api/policies/aggregated - Get aggregated policies
  • POST   /api/messages/schedule - Schedule a message
  • GET    /health - Health check

🔍 CPU Monitoring: ACTIVE (70% threshold)
    `);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down gracefully...');
    cpuMonitor.stopMonitoring();
    server.close(() => {
      console.log('✓ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Server terminated');
    cpuMonitor.stopMonitoring();
    server.close(() => {
      process.exit(0);
    });
  });
});
