const express = require('express');
const router = express.Router();
const { HeadCountLog, Alert } = require('../models/Analytics');
const Submission = require('../models/Submission');
const { isMongoConnected, readFallbackStore, writeFallbackStore } = require('../config/db');

// POST /api/analytics/headcount - Record real-time headcount snapshot
router.post('/headcount', async (req, res) => {
  try {
    const { currentCount, totalIn, totalOut, postureScoreAvg, peakCount } = req.body;
    const logData = {
      timestamp: new Date().toISOString(),
      currentCount: Number(currentCount) || 0,
      totalIn: Number(totalIn) || 0,
      totalOut: Number(totalOut) || 0,
      postureScoreAvg: Number(postureScoreAvg) || 100,
      peakCount: Number(peakCount) || 0
    };

    if (isMongoConnected()) {
      await HeadCountLog.create(logData);
      return res.json({ success: true, message: 'Logged to MongoDB' });
    }

    const store = readFallbackStore();
    store.analytics = [...(store.analytics || []).slice(-100), logData];
    writeFallbackStore(store);

    return res.json({ success: true, message: 'Logged to Local Store' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/analytics/history - Get time-series history for charts
router.get('/history', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const logs = await HeadCountLog.find().sort({ timestamp: -1 }).limit(30);
      return res.json({ success: true, data: logs.reverse() });
    }

    const store = readFallbackStore();
    const logs = (store.analytics || []).slice(-30);
    return res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/analytics/alert - Log an alert (e.g. occupancy breach or posture hazard)
router.post('/alert', async (req, res) => {
  try {
    const { type, message, level, metadata } = req.body;
    const alertData = {
      id: 'alt_' + Date.now(),
      timestamp: new Date().toISOString(),
      type: type || 'SYSTEM_ALERT',
      message: message || 'Alert triggered',
      level: level || 'warning',
      metadata: metadata || {}
    };

    if (isMongoConnected()) {
      const alert = await Alert.create(alertData);
      return res.status(201).json({ success: true, data: alert });
    }

    const store = readFallbackStore();
    store.alerts = [alertData, ...(store.alerts || []).slice(0, 50)];
    writeFallbackStore(store);

    return res.status(201).json({ success: true, data: alertData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/analytics/alerts - Retrieve latest alerts
router.get('/alerts', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const alerts = await Alert.find().sort({ timestamp: -1 }).limit(20);
      return res.json({ success: true, data: alerts });
    }

    const store = readFallbackStore();
    return res.json({ success: true, data: (store.alerts || []).slice(0, 20) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/analytics/overview - System overview statistics
router.get('/overview', async (req, res) => {
  try {
    let totalSubmissions = 0;
    let pendingSubmissions = 0;
    let approvedSubmissions = 0;
    let totalAlerts = 0;
    let peakCapacityToday = 0;

    if (isMongoConnected()) {
      totalSubmissions = await Submission.countDocuments();
      pendingSubmissions = await Submission.countDocuments({ status: 'Pending' });
      approvedSubmissions = await Submission.countDocuments({ status: 'Approved' });
      totalAlerts = await Alert.countDocuments();

      const latestLog = await HeadCountLog.findOne().sort({ timestamp: -1 });
      if (latestLog) peakCapacityToday = latestLog.peakCount;
    } else {
      const store = readFallbackStore();
      const subs = store.submissions || [];
      totalSubmissions = subs.length;
      pendingSubmissions = subs.filter(s => s.status === 'Pending').length;
      approvedSubmissions = subs.filter(s => s.status === 'Approved').length;
      totalAlerts = (store.alerts || []).length;
      const latestLog = (store.analytics || [])[(store.analytics || []).length - 1];
      if (latestLog) peakCapacityToday = latestLog.peakCount || 0;
    }

    return res.json({
      success: true,
      data: {
        totalSubmissions,
        pendingSubmissions,
        approvedSubmissions,
        totalAlerts,
        peakCapacityToday,
        systemStatus: 'Operational'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
