const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001", 
      "https://*.netlify.app",
      "https://indian-env-monitor.netlify.app"
    ],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://*.netlify.app", 
    "https://indian-env-monitor.netlify.app"
  ]
}));
app.use(express.json());

// In-memory storage for demo
let sensorData = [];
let alerts = [];
let sensorReadings = [];

// Mock sensors across Indian industrial locations
const sensors = [
  {
    id: 'AIR_001',
    type: 'air',
    name: 'Mumbai Industrial Air Monitor',
    location: {
      latitude: 19.0760,
      longitude: 72.8777,
      address: 'MIDC Industrial Area, Andheri East, Mumbai, Maharashtra',
      city: 'Mumbai',
      state: 'Maharashtra',
      zone: 'Western Industrial Zone'
    }
  },
  {
    id: 'AIR_002',
    type: 'air',
    name: 'Delhi NCR Air Quality Monitor',
    location: {
      latitude: 28.7041,
      longitude: 77.1025,
      address: 'Gurgaon Industrial Area, Haryana',
      city: 'Gurgaon',
      state: 'Haryana',
      zone: 'NCR Industrial Belt'
    }
  },
  {
    id: 'AIR_003',
    type: 'air',
    name: 'Bangalore Tech Park Monitor',
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Electronic City, Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      zone: 'South Tech Corridor'
    }
  },
  {
    id: 'AIR_004',
    type: 'air',
    name: 'Ahmedabad Chemical Zone Monitor',
    location: {
      latitude: 23.0225,
      longitude: 72.5714,
      address: 'GIDC Vatva Industrial Estate, Ahmedabad, Gujarat',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zone: 'Gujarat Chemical Hub'
    }
  },
  {
    id: 'AIR_005',
    type: 'air',
    name: 'Jamshedpur Steel City Monitor',
    location: {
      latitude: 22.8046,
      longitude: 86.2029,
      address: 'Tata Steel Plant Area, Jamshedpur, Jharkhand',
      city: 'Jamshedpur',
      state: 'Jharkhand',
      zone: 'Eastern Steel Belt'
    }
  },
  {
    id: 'AIR_006',
    type: 'air',
    name: 'Coimbatore Textile Monitor',
    location: {
      latitude: 11.0168,
      longitude: 76.9558,
      address: 'Tirupur Textile Industrial Area, Tamil Nadu',
      city: 'Tirupur',
      state: 'Tamil Nadu',
      zone: 'South Textile Hub'
    }
  },
  {
    id: 'WATER_001',
    type: 'water',
    name: 'Ganga River Monitor - Kanpur',
    location: {
      latitude: 26.4499,
      longitude: 80.3319,
      address: 'Ganga River near Leather Industrial Area, Kanpur, UP',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      zone: 'Ganga Industrial Corridor',
      waterBody: 'River Ganga'
    }
  },
  {
    id: 'WATER_002',
    type: 'water',
    name: 'Yamuna River Monitor - Delhi',
    location: {
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'Yamuna River near Okhla Industrial Area, Delhi',
      city: 'Delhi',
      state: 'Delhi',
      zone: 'NCR Water Belt',
      waterBody: 'River Yamuna'
    }
  },
  {
    id: 'WATER_003',
    type: 'water',
    name: 'Narmada River Monitor - Bharuch',
    location: {
      latitude: 21.7051,
      longitude: 72.9959,
      address: 'Narmada River near Chemical Industrial Zone, Bharuch, Gujarat',
      city: 'Bharuch',
      state: 'Gujarat',
      zone: 'Gujarat Chemical Coast',
      waterBody: 'River Narmada'
    }
  },
  {
    id: 'WATER_004',
    type: 'water',
    name: 'Cauvery River Monitor - Erode',
    location: {
      latitude: 11.3410,
      longitude: 77.7172,
      address: 'Cauvery River near Textile Dyeing Units, Erode, Tamil Nadu',
      city: 'Erode',
      state: 'Tamil Nadu',
      zone: 'South Textile Water Belt',
      waterBody: 'River Cauvery'
    }
  },
  {
    id: 'WATER_005',
    type: 'water',
    name: 'Hooghly River Monitor - Kolkata',
    location: {
      latitude: 22.5726,
      longitude: 88.3639,
      address: 'Hooghly River near Industrial Belt, Kolkata, West Bengal',
      city: 'Kolkata',
      state: 'West Bengal',
      zone: 'Eastern Industrial Water Zone',
      waterBody: 'River Hooghly'
    }
  },
  {
    id: 'WATER_006',
    type: 'water',
    name: 'Krishna River Monitor - Vijayawada',
    location: {
      latitude: 16.5062,
      longitude: 80.6480,
      address: 'Krishna River near Machilipatnam Industrial Area, Andhra Pradesh',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      zone: 'South Eastern Coastal Zone',
      waterBody: 'River Krishna'
    }
  }
];

// Generate realistic sensor data
function generateAirQualityData() {
  const baseValues = {
    pm25: 15 + Math.random() * 20,
    pm10: 25 + Math.random() * 30,
    co2: 400 + Math.random() * 200,
    no2: 20 + Math.random() * 40,
    temperature: 20 + Math.random() * 15,
    humidity: 40 + Math.random() * 30
  };

  // Occasionally simulate pollution spikes (10% chance)
  if (Math.random() < 0.1) {
    const spikeParameter = ['pm25', 'pm10', 'co2', 'no2'][Math.floor(Math.random() * 4)];
    switch (spikeParameter) {
      case 'pm25':
        baseValues.pm25 = 50 + Math.random() * 50;
        break;
      case 'pm10':
        baseValues.pm10 = 80 + Math.random() * 100;
        break;
      case 'co2':
        baseValues.co2 = 1200 + Math.random() * 2000;
        break;
      case 'no2':
        baseValues.no2 = 120 + Math.random() * 100;
        break;
    }
  }

  return baseValues;
}

function generateWaterQualityData() {
  const baseValues = {
    ph: 7.0 + (Math.random() - 0.5) * 1.0,
    turbidity: 1 + Math.random() * 2,
    dissolvedOxygen: 8 + Math.random() * 2,
    temperature: 15 + Math.random() * 10,
    humidity: 80 + Math.random() * 15
  };

  // Occasionally simulate water quality issues (8% chance)
  if (Math.random() < 0.08) {
    const issueType = ['ph', 'turbidity', 'dissolvedOxygen'][Math.floor(Math.random() * 3)];
    switch (issueType) {
      case 'ph':
        baseValues.ph = Math.random() < 0.5 ? 5.5 + Math.random() * 1 : 8.5 + Math.random() * 1;
        break;
      case 'turbidity':
        baseValues.turbidity = 5 + Math.random() * 8;
        break;
      case 'dissolvedOxygen':
        baseValues.dissolvedOxygen = 2 + Math.random() * 3;
        break;
    }
  }

  return baseValues;
}

function calculateStatus(readings, sensorType) {
  const thresholds = {
    pm25: { warning: 35, danger: 75 },
    pm10: { warning: 50, danger: 150 },
    co2: { warning: 1000, danger: 5000 },
    no2: { warning: 100, danger: 200 },
    ph: { minWarning: 6.5, maxWarning: 8.5, minDanger: 6.0, maxDanger: 9.0 },
    turbidity: { warning: 4, danger: 10 },
    dissolvedOxygen: { warning: 5, danger: 3 }
  };

  let status = 'safe';

  for (const [param, value] of Object.entries(readings)) {
    if (value === null || value === undefined) continue;
    const threshold = thresholds[param];
    if (!threshold) continue;

    if (param === 'ph') {
      if (value <= threshold.minDanger || value >= threshold.maxDanger) status = 'danger';
      else if (value <= threshold.minWarning || value >= threshold.maxWarning && status !== 'danger') status = 'warning';
    } else if (param === 'dissolvedOxygen') {
      if (value <= threshold.danger) status = 'danger';
      else if (value <= threshold.warning && status !== 'danger') status = 'warning';
    } else {
      if (value >= threshold.danger) status = 'danger';
      else if (value >= threshold.warning && status !== 'danger') status = 'warning';
    }
  }

  return status;
}

function simulateReading(sensor) {
  let readings;
  
  if (sensor.type === 'air') {
    readings = generateAirQualityData();
  } else {
    readings = generateWaterQualityData();
  }

  const status = calculateStatus(readings, sensor.type);
  const timestamp = new Date();

  const sensorReading = {
    sensorId: sensor.id,
    sensorType: sensor.type,
    location: sensor.location,
    readings: readings,
    status: status,
    timestamp: timestamp
  };

  // Store reading
  sensorReadings.push(sensorReading);
  
  // Keep only last 1000 readings
  if (sensorReadings.length > 1000) {
    sensorReadings = sensorReadings.slice(-1000);
  }

  // Update sensor data
  const existingIndex = sensorData.findIndex(s => s.sensorId === sensor.id);
  if (existingIndex >= 0) {
    sensorData[existingIndex] = sensorReading;
  } else {
    sensorData.push(sensorReading);
  }

  // Check for alerts
  if (status === 'warning' || status === 'danger') {
    const alert = {
      id: Date.now() + Math.random(),
      sensorId: sensor.id,
      severity: status,
      parameter: 'environmental',
      message: `${status.toUpperCase()} level detected at ${sensor.location.address}`,
      location: sensor.location,
      timestamp: timestamp,
      acknowledged: false,
      resolved: false
    };
    
    alerts.unshift(alert);
    
    // Keep only last 100 alerts
    if (alerts.length > 100) {
      alerts = alerts.slice(0, 100);
    }

    // Emit alert
    io.emit('alert', alert);
    console.log(`🚨 ALERT: ${alert.message}`);
  }

  // Emit real-time data
  io.emit('sensorData', sensorReading);
  console.log(`📊 ${sensor.id} (${sensor.type}): Status ${status.toUpperCase()}`);
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Send initial data to new client
  socket.emit('initialData', sensorData);
  socket.emit('activeAlerts', alerts.filter(a => !a.resolved));

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });

  socket.on('acknowledgeAlert', (data) => {
    const alert = alerts.find(a => a.id == data.alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = data.acknowledgedBy;
      alert.acknowledgedAt = new Date();
      io.emit('alertAcknowledged', alert);
    }
  });

  socket.on('resolveAlert', (data) => {
    const alert = alerts.find(a => a.id == data.alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      io.emit('alertResolved', alert);
    }
  });
});

// API Routes
// Root route - Homepage
app.get('/', (req, res) => {
  res.json({
    message: '🇮🇳 Indian Environmental Monitoring System API',
    status: 'Running',
    version: '1.0.0',
    sensors: sensors.length,
    endpoints: {
      health: '/api/health',
      sensors: '/api/sensors',
      latestReadings: '/api/latest-readings',
      alerts: '/api/alerts',
      dashboardStats: '/api/dashboard-stats'
    },
    description: 'Real-time environmental monitoring across Indian industrial zones'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    sensors: sensors.length
  });
});

app.get('/api/readings/latest', (req, res) => {
  res.json(sensorData);
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

app.get('/api/dashboard/stats', (req, res) => {
  const activeAlerts = alerts.filter(a => !a.resolved && !a.acknowledged);
  const statusCounts = sensorData.reduce((acc, sensor) => {
    acc[sensor.status] = (acc[sensor.status] || 0) + 1;
    return acc;
  }, { safe: 0, warning: 0, danger: 0 });

  res.json({
    totalSensors: sensors.length,
    activeSensors: sensorData.length,
    activeAlerts: activeAlerts.length,
    recentReadings: sensorReadings.length,
    statusDistribution: statusCounts
  });
});

// Start sensor simulation
function startSimulation() {
  console.log('🚀 Starting IoT sensor simulator...');
  
  sensors.forEach(sensor => {
    // Generate initial reading
    simulateReading(sensor);
    
    // Generate readings every 10-30 seconds
    setInterval(() => {
      simulateReading(sensor);
    }, 10000 + Math.random() * 20000);
  });

  console.log(`📡 Simulating ${sensors.length} sensors`);
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: development`);
  
  // Start the sensor simulator
  setTimeout(startSimulation, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});
