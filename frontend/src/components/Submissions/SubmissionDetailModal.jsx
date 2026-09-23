import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileCheck2,
  Activity,
  Users,
  MessageSquare,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SubmissionDetailModal({ submission, onClose, onStatusUpdated }) {
  const [status, setStatus] = useState(submission.status || 'Pending');
  const [reviewerNotes, setReviewerNotes] = useState(submission.reviewerNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/submissions/${submission._id || submission.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reviewerNotes })
      });
      const data = await res.json();
      if (data.success) {
        setStatus(newStatus);
        if (newStatus === 'Approved') {
          // Trigger celebratory confetti effect
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        if (onStatusUpdated) onStatusUpdated(data.data);
      }
    } catch (e) {
      console.error('Error updating status:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Approved':
        return <span className="badge badge-emerald"><CheckCircle2 size={12} /> Approved</span>;
      case 'Under Review':
        return <span className="badge badge-amber"><Clock size={12} /> Under Review</span>;
      case 'Rejected':
        return <span className="badge badge-rose"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="badge badge-cyan"><Clock size={12} /> Pending</span>;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(9, 13, 24, 0.7)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '18px', color: '#fff' }}>{submission.title}</h3>
              {getStatusBadge(status)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Submitted by <strong style={{ color: '#00f0ff' }}>{submission.submitterName}</strong> • {new Date(submission.createdAt).toLocaleString()}
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Snapshot Display */}
          {submission.snapshotUrl && (
            <div style={{
              borderRadius: '14px',
              overflow: 'hidden',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              position: 'relative',
              background: '#040714',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)'
            }}>
              <img
                src={submission.snapshotUrl}
                alt="Audit Snapshot"
                style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', display: 'block' }}
                onError={(e) => {
                  // Fallback if image path not found
                  e.target.src = '/uploads/sample_snapshot.png';
                }}
              />
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(7, 10, 20, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                fontSize: '11px',
                color: '#00f0ff',
                fontFamily: 'var(--font-mono)'
              }}>
                VERIFIED AI FRAME
              </div>
            </div>
          )}

          {/* Telemetry Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div className="glass-card" style={{ padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>HEAD COUNT</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>
                {submission.headCount ?? 0}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>POSTURE SCORE</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                {submission.postureScore ?? 100}%
              </div>
            </div>

            <div className="glass-card" style={{ padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>ELBOW ANGLE</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#8b5cf6', fontFamily: 'var(--font-mono)' }}>
                {submission.metrics?.elbowAngle ?? 142}°
              </div>
            </div>

            <div className="glass-card" style={{ padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>SPINE TILT</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                {submission.metrics?.torsoTilt ?? 8}°
              </div>
            </div>
          </div>

          {/* Description & Notes */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
              Submitter Observations:
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {submission.description || 'No additional notes provided.'}
            </p>
          </div>

          {/* Reviewer Feedback / Supervisor Approval Section */}
          <div style={{
            background: 'rgba(14, 21, 42, 0.85)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '14px',
            padding: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <MessageSquare size={16} color="#00f0ff" />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#00f0ff', textTransform: 'uppercase' }}>
                Supervisor Review & Verification Workflow
              </span>
            </div>

            <div className="input-group" style={{ marginBottom: '14px' }}>
              <textarea
                className="textarea-field"
                rows={2}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Enter audit approval remarks or compliance feedback..."
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleUpdateStatus('Approved')}
                disabled={isUpdating}
                className="btn btn-success"
                style={{ flex: 1, padding: '9px 14px' }}
              >
                <CheckCircle2 size={16} />
                <span>Approve Work Submission</span>
              </button>

              <button
                onClick={() => handleUpdateStatus('Under Review')}
                disabled={isUpdating}
                className="btn btn-ghost"
                style={{ flex: 1, padding: '9px 14px', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b' }}
              >
                <Clock size={16} />
                <span>Mark Under Review</span>
              </button>

              <button
                onClick={() => handleUpdateStatus('Rejected')}
                disabled={isUpdating}
                className="btn btn-danger"
                style={{ padding: '9px 14px' }}
              >
                <XCircle size={16} />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
