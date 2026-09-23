const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { isMongoConnected, readFallbackStore, writeFallbackStore } = require('../config/db');

// Helper to generate IDs for local store
const generateId = () => 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

// GET /api/submissions - Get all submissions with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;

    if (isMongoConnected()) {
      const query = {};
      if (category && category !== 'All') query.category = category;
      if (status && status !== 'All') query.status = status;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { submitterName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      const submissions = await Submission.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: submissions.length, data: submissions });
    }

    // Local fallback store
    const store = readFallbackStore();
    let submissions = store.submissions || [];

    if (category && category !== 'All') {
      submissions = submissions.filter(s => s.category === category);
    }
    if (status && status !== 'All') {
      submissions = submissions.filter(s => s.status === status);
    }
    if (search) {
      const sLower = search.toLowerCase();
      submissions = submissions.filter(
        s =>
          (s.title && s.title.toLowerCase().includes(sLower)) ||
          (s.submitterName && s.submitterName.toLowerCase().includes(sLower)) ||
          (s.description && s.description.toLowerCase().includes(sLower))
      );
    }

    // Sort descending by createdAt
    submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, message: 'Server error fetching submissions', error: error.message });
  }
});

// GET /api/submissions/:id - Get single submission
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const sub = await Submission.findById(id);
      if (!sub) return res.status(404).json({ success: false, message: 'Submission not found' });
      return res.json({ success: true, data: sub });
    }

    const store = readFallbackStore();
    const sub = (store.submissions || []).find(s => s._id === id || s.id === id);
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found' });
    return res.json({ success: true, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/submissions - Create a new submission
router.post('/', async (req, res) => {
  try {
    const {
      title,
      submitterName,
      category,
      priority,
      description,
      headCount,
      postureScore,
      metrics,
      snapshotUrl,
      status,
      reviewerNotes
    } = req.body;

    if (!title || !submitterName) {
      return res.status(400).json({ success: false, message: 'Title and Submitter Name are required.' });
    }

    const newSubData = {
      title,
      submitterName,
      category: category || 'General Inspection',
      priority: priority || 'Medium',
      description: description || '',
      headCount: typeof headCount === 'number' ? headCount : 0,
      postureScore: typeof postureScore === 'number' ? postureScore : 100,
      metrics: metrics || {
        elbowAngle: 0,
        kneeAngle: 0,
        torsoTilt: 0,
        postureStatus: 'Normal'
      },
      snapshotUrl: snapshotUrl || '',
      status: status || 'Pending',
      reviewerNotes: reviewerNotes || '',
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected()) {
      const created = await Submission.create(newSubData);
      return res.status(201).json({ success: true, message: 'Submission created successfully', data: created });
    }

    // Local fallback store
    const store = readFallbackStore();
    newSubData._id = generateId();
    store.submissions = [newSubData, ...(store.submissions || [])];
    writeFallbackStore(store);

    return res.status(201).json({ success: true, message: 'Submission created successfully (Local Storage)', data: newSubData });
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ success: false, message: 'Error saving submission', error: error.message });
  }
});

// PATCH /api/submissions/:id/status - Update approval status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewerNotes } = req.body;

    if (!['Pending', 'Under Review', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    if (isMongoConnected()) {
      const updateData = { status };
      if (reviewerNotes !== undefined) updateData.reviewerNotes = reviewerNotes;

      const updated = await Submission.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Submission not found' });
      return res.json({ success: true, message: `Submission status updated to ${status}`, data: updated });
    }

    // Local fallback store
    const store = readFallbackStore();
    const idx = (store.submissions || []).findIndex(s => s._id === id || s.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Submission not found' });

    store.submissions[idx].status = status;
    if (reviewerNotes !== undefined) store.submissions[idx].reviewerNotes = reviewerNotes;
    store.submissions[idx].updatedAt = new Date().toISOString();
    writeFallbackStore(store);

    return res.json({ success: true, message: `Submission status updated to ${status}`, data: store.submissions[idx] });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/submissions/:id - Delete submission
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const deleted = await Submission.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Submission not found' });
      return res.json({ success: true, message: 'Submission deleted' });
    }

    const store = readFallbackStore();
    const initialLen = store.submissions ? store.submissions.length : 0;
    store.submissions = (store.submissions || []).filter(s => s._id !== id && s.id !== id);

    if (store.submissions.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    writeFallbackStore(store);
    return res.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
