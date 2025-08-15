const SensorReading = require('../models/SensorReading');
const Alert = require('../models/Alert');
const { sendAlert } = require('./alertService');

class SensorSimulator {
  constructor(io) {
    this.io = io;
    this.sensors = [
      {
        id: 'AIR_001',
        type: 'air',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: 'Industrial Zone A, New York'
        }
      },
      {
        id: 'AIR_002',
        type: 'air',
        location: {
          latitude: 40.7589,
          longitude: -73.9851,
          address: 'Industrial Zone B, New York'
        }
      },
      {
        id: 'WATER_001',
        type: 'water',
        location: {
          latitude: 40.7282,
          longitude: -74.0776,
          address: 'River Monitoring Point 1'
        }
      },
      {
        id: 'WATER_002',
        type: 'water',
        location: {
          latitude: 40.7505,
          longitude: -73.9934,
          address: 'River Monitoring Point 2'
        }
      }
    ];
    
    this.isRunning = false;
    this.intervals = [];
  }

  // Generate realistic sensor data with some randomness and occasional spikes
  generateAirQualityData() {
    const baseValues = {
      pm25: 15 + Math.random() * 20, // 15-35 µg/m³ normal range
      pm10: 25 + Math.random() * 30, // 25-55 µg/m³ normal range
      co2: 400 + Math.random() * 200, // 400-600 ppm normal range
      no2: 20 + Math.random() * 40, // 20-60 µg/m³ normal range
      temperature: 20 + Math.random() * 15, // 20-35°C
      humidity: 40 + Math.random() * 30 // 40-70%
    };

    // Occasionally simulate pollution spikes (10% chance)
    if (Math.random() < 0.1) {
      const spikeParameter = ['pm25', 'pm10', 'co2', 'no2'][Math.floor(Math.random() * 4)];
      switch (spikeParameter) {
        case 'pm25':
          baseValues.pm25 = 50 + Math.random() * 50; // Spike to warning/danger levels
          break;
        case 'pm10':
          baseValues.pm10 = 80 + Math.random() * 100; // Spike to warning/danger levels
          break;
        case 'co2':
          baseValues.co2 = 1200 + Math.random() * 2000; // Spike to warning/danger levels
          break;
        case 'no2':
          baseValues.no2 = 120 + Math.random() * 100; // Spike to warning/danger levels
          break;
      }
    }

    return baseValues;
  }

  generateWaterQualityData() {
    const baseValues = {
      ph: 7.0 + (Math.random() - 0.5) * 1.0, // 6.5-7.5 normal range
      turbidity: 1 + Math.random() * 2, // 1-3 NTU normal range
      dissolvedOxygen: 8 + Math.random() * 2, // 8-10 mg/L normal range
      temperature: 15 + Math.random() * 10, // 15-25°C
      humidity: 80 + Math.random() * 15 // 80-95% near water
    };

    // Occasionally simulate water quality issues (8% chance)
    if (Math.random() < 0.08) {
      const issueType = ['ph', 'turbidity', 'dissolvedOxygen'][Math.floor(Math.random() * 3)];
      switch (issueType) {
        case 'ph':
          baseValues.ph = Math.random() < 0.5 ? 5.5 + Math.random() * 1 : 8.5 + Math.random() * 1;
          break;
        case 'turbidity':
          baseValues.turbidity = 5 + Math.random() * 8; // High turbidity
          break;
        case 'dissolvedOxygen':
          baseValues.dissolvedOxygen = 2 + Math.random() * 3; // Low oxygen
          break;
      }
    }

    return baseValues;
  }

  async simulateReading(sensor) {
    try {
      let readings;
      
      if (sensor.type === 'air') {
        readings = this.generateAirQualityData();
      } else {
        readings = this.generateWaterQualityData();
      }

      const sensorReading = new SensorReading({
        sensorId: sensor.id,
        sensorType: sensor.type,
        location: sensor.location,
        readings: readings
      });

      // Calculate status based on readings
      sensorReading.calculateStatus();

      // Save to database
      await sensorReading.save();

      // Check if alerts need to be triggered
      await this.checkAndTriggerAlerts(sensorReading);

      // Emit real-time data to connected clients
      this.io.emit('sensorData', {
        sensorId: sensor.id,
        sensorType: sensor.type,
        location: sensor.location,
        readings: readings,
        status: sensorReading.status,
        timestamp: sensorReading.timestamp
      });

      console.log(`📊 ${sensor.id} (${sensor.type}): Status ${sensorReading.status.toUpperCase()}`);

    } catch (error) {
      console.error(`Error simulating reading for sensor ${sensor.id}:`, error);
    }
  }

  async checkAndTriggerAlerts(sensorReading) {
    const thresholds = {
      pm25: { warning: 35, danger: 75 },
      pm10: { warning: 50, danger: 150 },
      co2: { warning: 1000, danger: 5000 },
      no2: { warning: 100, danger: 200 },
      ph: { minWarning: 6.5, maxWarning: 8.5, minDanger: 6.0, maxDanger: 9.0 },
      turbidity: { warning: 4, danger: 10 },
      dissolvedOxygen: { warning: 5, danger: 3 }
    };

    const readings = sensorReading.readings;
    const alerts = [];

    // Check each parameter against thresholds
    for (const [param, value] of Object.entries(readings)) {
      if (value === null || value === undefined) continue;

      const threshold = thresholds[param];
      if (!threshold) continue;

      let alertSeverity = null;
      let thresholdValue = null;
      let message = '';

      if (param === 'ph') {
        if (value <= threshold.minDanger || value >= threshold.maxDanger) {
          alertSeverity = 'danger';
          thresholdValue = value <= threshold.minDanger ? threshold.minDanger : threshold.maxDanger;
          message = `Critical pH level detected: ${value.toFixed(2)} (Safe range: ${threshold.minWarning}-${threshold.maxWarning})`;
        } else if (value <= threshold.minWarning || value >= threshold.maxWarning) {
          alertSeverity = 'warning';
          thresholdValue = value <= threshold.minWarning ? threshold.minWarning : threshold.maxWarning;
          message = `pH level warning: ${value.toFixed(2)} (Safe range: ${threshold.minWarning}-${threshold.maxWarning})`;
        }
      } else if (param === 'dissolvedOxygen') {
        if (value <= threshold.danger) {
          alertSeverity = 'danger';
          thresholdValue = threshold.danger;
          message = `Critical dissolved oxygen level: ${value.toFixed(2)} mg/L (Minimum safe: ${threshold.warning} mg/L)`;
        } else if (value <= threshold.warning) {
          alertSeverity = 'warning';
          thresholdValue = threshold.warning;
          message = `Low dissolved oxygen warning: ${value.toFixed(2)} mg/L (Minimum safe: ${threshold.warning} mg/L)`;
        }
      } else {
        if (value >= threshold.danger) {
          alertSeverity = 'danger';
          thresholdValue = threshold.danger;
          message = `Critical ${param.toUpperCase()} level: ${value.toFixed(2)} (Danger threshold: ${threshold.danger})`;
        } else if (value >= threshold.warning) {
          alertSeverity = 'warning';
          thresholdValue = threshold.warning;
          message = `${param.toUpperCase()} warning level: ${value.toFixed(2)} (Warning threshold: ${threshold.warning})`;
        }
      }

      if (alertSeverity) {
        const alert = new Alert({
          sensorId: sensorReading.sensorId,
          alertType: 'threshold_exceeded',
          severity: alertSeverity,
          parameter: param,
          currentValue: value,
          thresholdValue: thresholdValue,
          message: message,
          location: sensorReading.location
        });

        await alert.save();
        alerts.push(alert);

        // Emit alert to connected clients
        this.io.emit('alert', {
          id: alert._id,
          sensorId: alert.sensorId,
          severity: alert.severity,
          parameter: alert.parameter,
          message: alert.message,
          location: alert.location,
          timestamp: alert.createdAt
        });

        console.log(`🚨 ALERT: ${message}`);
      }
    }

    return alerts;
  }

  start() {
    if (this.isRunning) {
      console.log('Sensor simulator is already running');
      return;
    }

    console.log('🚀 Starting IoT sensor simulator...');
    this.isRunning = true;

    // Start simulation for each sensor
    this.sensors.forEach(sensor => {
      // Generate readings every 10-30 seconds with some randomness
      const interval = setInterval(() => {
        this.simulateReading(sensor);
      }, 10000 + Math.random() * 20000);

      this.intervals.push(interval);

      // Generate initial reading
      this.simulateReading(sensor);
    });

    console.log(`📡 Simulating ${this.sensors.length} sensors (${this.sensors.filter(s => s.type === 'air').length} air, ${this.sensors.filter(s => s.type === 'water').length} water)`);
  }

  stop() {
    if (!this.isRunning) {
      console.log('Sensor simulator is not running');
      return;
    }

    console.log('🛑 Stopping IoT sensor simulator...');
    this.isRunning = false;

    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }

  getSensorStatus() {
    return {
      isRunning: this.isRunning,
      sensorCount: this.sensors.length,
      sensors: this.sensors.map(sensor => ({
        id: sensor.id,
        type: sensor.type,
        location: sensor.location.address
      }))
    };
  }
}

module.exports = SensorSimulator;
