const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    index: true
  },
  alertType: {
    type: String,
    required: true,
    enum: ['threshold_exceeded', 'sensor_offline', 'prediction_warning']
  },
  severity: {
    type: String,
    required: true,
    enum: ['warning', 'danger', 'critical']
  },
  parameter: {
    type: String,
    required: true
  },
  currentValue: {
    type: Number,
    required: true
  },
  thresholdValue: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true }
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: {
    type: String,
    default: null
  },
  acknowledgedAt: {
    type: Date,
    default: null
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  notificationsSent: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'webhook']
    },
    recipient: String,
    sentAt: Date,
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending']
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
alertSchema.index({ sensorId: 1, createdAt: -1 });
alertSchema.index({ severity: 1, resolved: 1 });
alertSchema.index({ acknowledged: 1, resolved: 1 });

module.exports = mongoose.model('Alert', alertSchema);
