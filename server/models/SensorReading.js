const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    index: true
  },
  sensorType: {
    type: String,
    required: true,
    enum: ['air', 'water']
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true }
  },
  readings: {
    // Air quality readings
    pm25: { type: Number, default: null },
    pm10: { type: Number, default: null },
    co2: { type: Number, default: null },
    no2: { type: Number, default: null },
    
    // Water quality readings
    ph: { type: Number, default: null },
    turbidity: { type: Number, default: null },
    dissolvedOxygen: { type: Number, default: null },
    
    // Environmental conditions
    temperature: { type: Number, default: null },
    humidity: { type: Number, default: null }
  },
  status: {
    type: String,
    enum: ['safe', 'warning', 'danger'],
    default: 'safe'
  },
  alertTriggered: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
sensorReadingSchema.index({ sensorId: 1, timestamp: -1 });
sensorReadingSchema.index({ sensorType: 1, timestamp: -1 });
sensorReadingSchema.index({ status: 1, timestamp: -1 });

// Static method to get latest readings for all sensors
sensorReadingSchema.statics.getLatestReadings = function() {
  return this.aggregate([
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
      $replaceRoot: { newRoot: '$latestReading' }
    }
  ]);
};

// Method to determine status based on readings
sensorReadingSchema.methods.calculateStatus = function() {
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
  const readings = this.readings;

  // Check air quality parameters
  if (readings.pm25 && readings.pm25 >= thresholds.pm25.danger) status = 'danger';
  else if (readings.pm25 && readings.pm25 >= thresholds.pm25.warning) status = 'warning';

  if (readings.pm10 && readings.pm10 >= thresholds.pm10.danger) status = 'danger';
  else if (readings.pm10 && readings.pm10 >= thresholds.pm10.warning && status !== 'danger') status = 'warning';

  if (readings.co2 && readings.co2 >= thresholds.co2.danger) status = 'danger';
  else if (readings.co2 && readings.co2 >= thresholds.co2.warning && status !== 'danger') status = 'warning';

  if (readings.no2 && readings.no2 >= thresholds.no2.danger) status = 'danger';
  else if (readings.no2 && readings.no2 >= thresholds.no2.warning && status !== 'danger') status = 'warning';

  // Check water quality parameters
  if (readings.ph && (readings.ph <= thresholds.ph.minDanger || readings.ph >= thresholds.ph.maxDanger)) status = 'danger';
  else if (readings.ph && (readings.ph <= thresholds.ph.minWarning || readings.ph >= thresholds.ph.maxWarning) && status !== 'danger') status = 'warning';

  if (readings.turbidity && readings.turbidity >= thresholds.turbidity.danger) status = 'danger';
  else if (readings.turbidity && readings.turbidity >= thresholds.turbidity.warning && status !== 'danger') status = 'warning';

  if (readings.dissolvedOxygen && readings.dissolvedOxygen <= thresholds.dissolvedOxygen.danger) status = 'danger';
  else if (readings.dissolvedOxygen && readings.dissolvedOxygen <= thresholds.dissolvedOxygen.warning && status !== 'danger') status = 'warning';

  this.status = status;
  return status;
};

module.exports = mongoose.model('SensorReading', sensorReadingSchema);
