const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    submitterName: {
      type: String,
      required: [true, 'Submitter name is required'],
      trim: true
    },
    category: {
      type: String,
      default: 'General Inspection',
      enum: ['Workplace Safety', 'Ergonomics Inspection', 'Classroom / Lab Audit', 'Event Crowd Control', 'Posture Assessment', 'General Inspection']
    },
    priority: {
      type: String,
      default: 'Medium',
      enum: ['Low', 'Medium', 'High', 'Critical']
    },
    description: {
      type: String,
      default: ''
    },
    headCount: {
      type: Number,
      default: 0
    },
    postureScore: {
      type: Number,
      default: 100
    },
    metrics: {
      elbowAngle: { type: Number, default: 0 },
      kneeAngle: { type: Number, default: 0 },
      torsoTilt: { type: Number, default: 0 },
      postureStatus: { type: String, default: 'Normal' }
    },
    snapshotUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Under Review', 'Approved', 'Rejected']
    },
    reviewerNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
