const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isMongoConnected = false;
const DATA_DIR = path.join(__dirname, '..', 'data');
const FALLBACK_STORE_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure initial fallback store exists
if (!fs.existsSync(FALLBACK_STORE_FILE)) {
  const initialStore = {
    submissions: [
      {
        _id: 'sub_demo_01',
        title: 'Morning Shift Safety & Head Count Audit',
        submitterName: 'Alex Rivera',
        category: 'Workplace Safety',
        priority: 'High',
        description: 'Verified entry gate crowd density and posture compliance for warehouse staff.',
        headCount: 6,
        postureScore: 92,
        metrics: {
          elbowAngle: 142,
          kneeAngle: 168,
          torsoTilt: 8,
          postureStatus: 'Good - Upright'
        },
        snapshotUrl: '/uploads/sample_snapshot.png',
        status: 'Approved',
        reviewerNotes: 'All safety limits adhered to. Good posture compliance.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        _id: 'sub_demo_02',
        title: 'Assembly Station Posture & Ergonomics Check',
        submitterName: 'Sarah Chen',
        category: 'Ergonomics Inspection',
        priority: 'Medium',
        description: 'Detected excessive slouching and bending at packing station 3.',
        headCount: 2,
        postureScore: 68,
        metrics: {
          elbowAngle: 85,
          kneeAngle: 135,
          torsoTilt: 38,
          postureStatus: 'Warning - Severe Slouch'
        },
        snapshotUrl: '/uploads/sample_snapshot.png',
        status: 'Under Review',
        reviewerNotes: 'Ergonomic footrest and desk height adjustment recommended.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ],
    analytics: [
      {
        timestamp: new Date(Date.now() - 300000).toISOString(),
        currentCount: 4,
        totalIn: 12,
        totalOut: 8,
        postureScoreAvg: 88,
        peakCount: 7
      }
    ],
    alerts: [
      {
        id: 'alt_01',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        type: 'OCCUPANCY_WARNING',
        message: 'Room capacity reached 85% of limit (6/8 people)',
        level: 'warning'
      }
    ],
    settings: {
      occupancyLimit: 10,
      confidenceThreshold: 0.45,
      alertSoundEnabled: true,
      lineCrossingY: 0.5
    }
  };
  fs.writeFileSync(FALLBACK_STORE_FILE, JSON.stringify(initialStore, null, 2));
}

function readFallbackStore() {
  try {
    const raw = fs.readFileSync(FALLBACK_STORE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading fallback store:', err);
    return { submissions: [], analytics: [], alerts: [], settings: {} };
  }
}

function writeFallbackStore(data) {
  try {
    fs.writeFileSync(FALLBACK_STORE_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing fallback store:', err);
  }
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pose_headcount_db';
  try {
    mongoose.set('strictQuery', false);
    // Timeout quickly (3s) so app starts instantly even if MongoDB service isn't started yet
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${uri}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB (${error.message}).`);
    console.log(`[Local Fallback] Active! Storing data safely in local database: ${FALLBACK_STORE_FILE}`);
  }

  mongoose.connection.on('disconnected', () => {
    isMongoConnected = false;
    console.warn('[MongoDB] Connection lost. Falling back to local store.');
  });

  mongoose.connection.on('reconnected', () => {
    isMongoConnected = true;
    console.log('[MongoDB] Reconnected successfully.');
  });
};

const getStatus = () => {
  return {
    isConnected: isMongoConnected,
    mode: isMongoConnected ? 'mongodb' : 'local_fallback',
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pose_headcount_db',
    message: isMongoConnected
      ? 'MongoDB Live and Connected'
      : 'Using Resilient Local Store (MongoDB offline)'
  };
};

module.exports = {
  connectDB,
  getStatus,
  readFallbackStore,
  writeFallbackStore,
  isMongoConnected: () => isMongoConnected
};
