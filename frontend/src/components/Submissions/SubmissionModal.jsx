import React, { useState } from 'react';
import { X, Camera, Check, AlertCircle, FileCheck, Layers, Send } from 'lucide-react';

export default function SubmissionModal({ initialData, onClose, onCreated }) {
  const [title, setTitle] = useState('Workspace Ergonomics & Head Count Inspection');
  const [submitterName, setSubmitterName] = useState('');
  const [category, setCategory] = useState('Workplace Safety');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState(
    'Conducted AI vision audit. All skeletal landmarks and crowd occupancy limits verified against safety standards.'
  );
  const [headCount, setHeadCount] = useState(initialData?.headCount ?? 4);
  const [postureScore, setPostureScore] = useState(initialData?.postureScore ?? 92);
  const [metrics, setMetrics] = useState(initialData?.metrics ?? {
    elbowAngle: 142,
    kneeAngle: 168,
    torsoTilt: 8,
    postureStatus: 'Good - Upright'
  });
  const [snapshotBase64, setSnapshotBase64] = useState(initialData?.snapshotBase64 || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !submitterName.trim()) {
      setErrorMsg('Please enter a Task Title and Submitter Name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let finalSnapshotUrl = '/uploads/sample_snapshot.png';

      // If a live snapshot base64 was captured, save it via upload endpoint
      if (snapshotBase64) {
        try {
          const uploadRes = await fetch('/api/upload/base64', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: snapshotBase64, filename: 'audit-snapshot' })
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.url) {
            finalSnapshotUrl = uploadData.url;
          }
        } catch (uploadErr) {
          console.warn('Could not upload snapshot file, using fallback preview', uploadErr);
        }
      }

      // Create submission record
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          submitterName,
          category,
          priority,
          description,
          headCount: Number(headCount),
          postureScore: Number(postureScore),
          metrics,
          snapshotUrl: finalSnapshotUrl,
          status: 'Pending'
        })
      });

      const data = await res.json();
      if (data.success) {
        if (onCreated) onCreated(data.data);
        onClose();
      } else {
        setErrorMsg(data.message || 'Failed to submit task.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMsg('Connection error: could not save submission to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(9, 13, 24, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(0, 240, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 240, 255, 0.3)'
            }}>
              <FileCheck size={18} color="#00f0ff" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', color: '#fff' }}>New Work & Audit Submission</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Attach live AI vision telemetries and submit for supervisor approval
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#f43f5e',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Snapshot Preview with HUD telemetry pill */}
          {snapshotBase64 && (
            <div style={{
              marginBottom: '18px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              position: 'relative',
              maxHeight: '180px',
              background: '#000'
            }}>
              <img
                src={snapshotBase64}
                alt="Captured Telemetry Snapshot"
                style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '12px',
                background: 'rgba(7, 10, 20, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                fontSize: '11px',
                color: '#00f0ff',
                fontFamily: 'var(--font-mono)'
              }}>
                📸 LIVE FRAME ATTACHED • HC: {headCount} • POSTURE: {postureScore}%
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Title */}
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Task / Audit Title *</label>
              <input
                type="text"
                className="input-field"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sector 4 Pose & Capacity Audit"
              />
            </div>

            {/* Submitter Name */}
            <div className="input-group">
              <label className="input-label">Submitter / Inspector Name *</label>
              <input
                type="text"
                className="input-field"
                required
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                placeholder="e.g., Alex Rivera / EMP-842"
              />
            </div>

            {/* Category */}
            <div className="input-group">
              <label className="input-label">Task Category</label>
              <select
                className="select-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Workplace Safety">Workplace Safety</option>
                <option value="Ergonomics Inspection">Ergonomics Inspection</option>
                <option value="Classroom / Lab Audit">Classroom / Lab Audit</option>
                <option value="Event Crowd Control">Event Crowd Control</option>
                <option value="Posture Assessment">Posture Assessment</option>
                <option value="General Inspection">General Inspection</option>
              </select>
            </div>

            {/* Priority */}
            <div className="input-group">
              <label className="input-label">Priority Level</label>
              <select
                className="select-field"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Auto-filled Telemetry Data */}
            <div className="input-group">
              <label className="input-label">Verified Head Count</label>
              <input
                type="number"
                className="input-field mono"
                value={headCount}
                onChange={(e) => setHeadCount(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="input-group" style={{ marginTop: '4px' }}>
            <label className="input-label">Inspection Notes & Observations</label>
            <textarea
              className="textarea-field"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add detailed findings, compliance notes, or safety observations..."
            />
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ minWidth: '150px' }}
            >
              <Send size={15} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Work Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
