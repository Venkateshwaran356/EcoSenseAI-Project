const mongoose = require('mongoose');

const HeadCountLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  currentCount: { type: Number, default: 0 },
  totalIn: { type: Number, default: 0 },
  totalOut: { type: Number, default: 0 },
  postureScoreAvg: { type: Number, default: 100 },
  peakCount: { type: Number, default: 0 }
});

const AlertSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  type: { type: String, required: true },
  message: { type: String, required: true },
  level: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  metadata: { type: Object, default: {} }
});

const HeadCountLog = mongoose.models.HeadCountLog || mongoose.model('HeadCountLog', HeadCountLogSchema);
const Alert = mongoose.models.Alert || mongoose.model('Alert', AlertSchema);

module.exports = {
  HeadCountLog,
  Alert
};
