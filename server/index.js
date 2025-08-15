require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const SensorReading = require('./models/SensorReading');
const Alert = require('./models/Alert');
const SensorSimulator = require('./services/sensorSimulator');
const alertService = require('./services/alertService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"]
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/environmental_monitoring', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('📊 Connected to MongoDB');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Initialize sensor simulator
const sensorSimulator = new SensorSimulator(io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Send current sensor status to new client
  socket.emit('sensorStatus', sensorSimulator.getSensorStatus());

  // Send latest readings to new client
  SensorReading.getLatestReadings()
    .then(readings => {
      socket.emit('initialData', readings);
    })
    .catch(err => console.error('Error fetching initial data:', err));

  // Send active alerts to new client
  alertService.getActiveAlerts()
    .then(alerts => {
      socket.emit('activeAlerts', alerts);
    })
    .catch(err => console.error('Error fetching active alerts:', err));

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });

  // Handle alert acknowledgment
  socket.on('acknowledgeAlert', async (data) => {
    try {
      const alert = await alertService.acknowledgeAlert(data.alertId, data.acknowledgedBy);
      io.emit('alertAcknowledged', alert);
    } catch (error) {
      socket.emit('error', { message: 'Failed to acknowledge alert' });
    }
  });

  // Handle alert resolution
  socket.on('resolveAlert', async (data) => {
    try {
      const alert = await alertService.resolveAlert(data.alertId);
      io.emit('alertResolved', alert);
    } catch (error) {
      socket.emit('error', { message: 'Failed to resolve alert' });
    }
  });
});

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    simulator: sensorSimulator.getSensorStatus()
  });
});

// Get all sensors
app.get('/api/sensors', async (req, res) => {
  try {
    const sensors = sensorSimulator.getSensorStatus().sensors;
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensors' });
  }
});

// Get latest readings for all sensors
app.get('/api/readings/latest', async (req, res) => {
  try {
    const readings = await SensorReading.getLatestReadings();
    res.json(readings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest readings' });
  }
});

// Get readings for a specific sensor
app.get('/api/readings/:sensorId', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { limit = 100, startDate, endDate } = req.query;

    let query = { sensorId };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const readings = await SensorReading.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(readings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensor readings' });
  }
});

// Get historical data for charts
app.get('/api/readings/:sensorId/history', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { period = '24h', parameter } = req.query;

    let startDate = new Date();
    switch (period) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '6h':
        startDate.setHours(startDate.getHours() - 6);
        break;
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 1);
    }

    const readings = await SensorReading.find({
      sensorId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    // Format data for charts
    const chartData = readings.map(reading => ({
      timestamp: reading.timestamp,
      ...reading.readings
    }));

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Get alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const { limit = 50, resolved, severity, sensorId } = req.query;
    
    let query = {};
    if (resolved !== undefined) query.resolved = resolved === 'true';
    if (severity) query.severity = severity;
    if (sensorId) query.sensorId = sensorId;

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Acknowledge alert
app.post('/api/alerts/:alertId/acknowledge', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { acknowledgedBy } = req.body;

    const alert = await alertService.acknowledgeAlert(alertId, acknowledgedBy);
    io.emit('alertAcknowledged', alert);

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// Resolve alert
app.post('/api/alerts/:alertId/resolve', async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await alertService.resolveAlert(alertId);
    io.emit('alertResolved', alert);

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

// Get dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalSensors,
      activeSensors,
      activeAlerts,
      recentReadings,
      alertsByStatus
    ] = await Promise.all([
      SensorReading.distinct('sensorId').then(ids => ids.length),
      SensorReading.aggregate([
        { $match: { timestamp: { $gte: last24h } } },
        { $group: { _id: '$sensorId' } },
        { $count: 'count' }
      ]).then(result => result[0]?.count || 0),
      Alert.countDocuments({ resolved: false }),
      SensorReading.countDocuments({ timestamp: { $gte: last24h } }),
      Alert.aggregate([
        { $match: { createdAt: { $gte: last24h } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const statusCounts = await SensorReading.aggregate([
      {
        $sort: { sensorId: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$sensorId',
          latestReading: { $first: '$$ROOT' }
        }
      },
      {
        $group: {
          _id: '$latestReading.status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalSensors,
      activeSensors,
      activeAlerts,
      recentReadings,
      statusDistribution: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, { safe: 0, warning: 0, danger: 0 }),
      alertsByStatus: alertsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Export data endpoint
app.get('/api/export/:sensorId', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { startDate, endDate, format = 'json' } = req.query;

    let query = { sensorId };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const readings = await SensorReading.find(query).sort({ timestamp: 1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Timestamp,Sensor ID,Type,PM2.5,PM10,CO2,NO2,pH,Turbidity,Dissolved Oxygen,Temperature,Humidity,Status\n';
      const csvData = readings.map(reading => {
        const r = reading.readings;
        return [
          reading.timestamp.toISOString(),
          reading.sensorId,
          reading.sensorType,
          r.pm25 || '',
          r.pm10 || '',
          r.co2 || '',
          r.no2 || '',
          r.ph || '',
          r.turbidity || '',
          r.dissolvedOxygen || '',
          r.temperature || '',
          r.humidity || '',
          reading.status
        ].join(',');
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${sensorId}_data.csv"`);
      res.send(csvHeader + csvData);
    } else {
      res.json(readings);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Simulator control endpoints
app.post('/api/simulator/start', (req, res) => {
  try {
    sensorSimulator.start();
    res.json({ message: 'Simulator started', status: sensorSimulator.getSensorStatus() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start simulator' });
  }
});

app.post('/api/simulator/stop', (req, res) => {
  try {
    sensorSimulator.stop();
    res.json({ message: 'Simulator stopped', status: sensorSimulator.getSensorStatus() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop simulator' });
  }
});

app.get('/api/simulator/status', (req, res) => {
  res.json(sensorSimulator.getSensorStatus());
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start the sensor simulator automatically
  setTimeout(() => {
    sensorSimulator.start();
  }, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  sensorSimulator.stop();
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
