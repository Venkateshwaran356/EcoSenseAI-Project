import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Trash2,
  Eye,
  Award,
  Users,
  Activity,
  Layers
} from 'lucide-react';
import SubmissionModal from './SubmissionModal';
import SubmissionDetailModal from './SubmissionDetailModal';

export default function SubmissionPortal({ onOpenCreateModal, newSubmissionTrigger }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Fetch submissions from API
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      let url = '/api/submissions?';
      if (selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (selectedStatus !== 'All') url += `status=${encodeURIComponent(selectedStatus)}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.data || []);
      }
    } catch (err) {
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [selectedCategory, selectedStatus, searchTerm, newSubmissionTrigger]);

  // Handle single deletion
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this work submission?')) return;
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSubmissions((prev) => prev.filter((s) => s._id !== id && s.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!submissions.length) return;
    const headers = ['ID', 'Title', 'Submitter', 'Category', 'Priority', 'Status', 'HeadCount', 'PostureScore', 'CreatedAt'];
    const rows = submissions.map((s) => [
      s._id || s.id,
      `"${s.title.replace(/"/g, '""')}"`,
      `"${s.submitterName.replace(/"/g, '""')}"`,
      s.category,
      s.priority,
      s.status,
      s.headCount || 0,
      s.postureScore || 100,
      s.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `work-submissions-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Summary counts
  const totalCount = submissions.length;
  const approvedCount = submissions.filter((s) => s.status === 'Approved').length;
  const pendingCount = submissions.filter((s) => s.status === 'Pending').length;
  const reviewCount = submissions.filter((s) => s.status === 'Under Review').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0, 240, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck2 size={22} color="#00f0ff" />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
              Total Submissions
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#fff' }}>
              {totalCount}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
              Approved Audits
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
              {approvedCount}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
              Under Review
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>
              {reviewCount}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="#8b5cf6" />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
              Pending Action
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#8b5cf6' }}>
              {pendingCount}
            </div>
          </div>
        </div>
      </div>

      {/* Action Header & Search Controls */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input
              type="text"
              placeholder="Search by title, submitter or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
            />
          </div>

          {/* Category Filter */}
          <select
            className="select-field"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '190px', height: '38px', fontSize: '12.5px' }}
          >
            <option value="All">All Categories</option>
            <option value="Workplace Safety">Workplace Safety</option>
            <option value="Ergonomics Inspection">Ergonomics Inspection</option>
            <option value="Classroom / Lab Audit">Classroom / Lab Audit</option>
            <option value="Event Crowd Control">Event Crowd Control</option>
            <option value="Posture Assessment">Posture Assessment</option>
          </select>

          {/* Status Filter */}
          <select
            className="select-field"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: '150px', height: '38px', fontSize: '12.5px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '12.5px' }}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Plus size={16} />
            <span>New Work Submission</span>
          </button>
        </div>
      </div>

      {/* Submissions List / Grid */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="pulse-dot pulse-dot-green" style={{ width: '14px', height: '14px', margin: '0 auto 12px' }} />
          <div>Loading work submissions from database...</div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <FileCheck2 size={44} color="#64748b" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '17px', color: '#fff', marginBottom: '6px' }}>No submissions found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Switch to the Live Vision Hub and click "Capture & Submit", or create one manually.
          </p>
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Create First Submission</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
          {submissions.map((sub) => {
            const isApproved = sub.status === 'Approved';
            const isReview = sub.status === 'Under Review';
            const isRejected = sub.status === 'Rejected';

            return (
              <div
                key={sub._id || sub.id}
                className="glass-card"
                onClick={() => setSelectedSub(sub)}
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="badge badge-purple" style={{ fontSize: '10.5px' }}>
                      {sub.category || 'General Inspection'}
                    </span>

                    {isApproved ? (
                      <span className="badge badge-emerald"><CheckCircle2 size={11} /> Approved</span>
                    ) : isReview ? (
                      <span className="badge badge-amber"><Clock size={11} /> Under Review</span>
                    ) : isRejected ? (
                      <span className="badge badge-rose"><XCircle size={11} /> Rejected</span>
                    ) : (
                      <span className="badge badge-cyan"><Clock size={11} /> Pending</span>
                    )}
                  </div>

                  {/* Title & Submitter */}
                  <h4 style={{ fontSize: '15px', color: '#fff', marginBottom: '4px', lineHeight: 1.3 }}>
                    {sub.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    By <strong style={{ color: '#00f0ff' }}>{sub.submitterName}</strong> • {new Date(sub.createdAt).toLocaleDateString()}
                  </div>

                  {/* Image Snapshot Preview */}
                  {sub.snapshotUrl && (
                    <div style={{
                      borderRadius: '8px',
                      overflow: 'hidden',
                      height: '140px',
                      background: '#040714',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '12px'
                    }}>
                      <img
                        src={sub.snapshotUrl}
                        alt="Snapshot"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/uploads/sample_snapshot.png'; }}
                      />
                    </div>
                  )}

                  {/* Telemetry Metric Pills */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    background: 'rgba(9, 13, 24, 0.5)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} color="#00f0ff" />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Head Count:</span>
                      <strong className="mono" style={{ color: '#00f0ff', fontSize: '13px' }}>{sub.headCount ?? 0}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Activity size={14} color="#10b981" />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Posture:</span>
                      <strong className="mono" style={{ color: '#10b981', fontSize: '13px' }}>{sub.postureScore ?? 100}%</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                    Priority: <strong style={{ color: sub.priority === 'High' ? '#f43f5e' : '#f59e0b' }}>{sub.priority}</strong>
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedSub(sub); }}
                      className="btn btn-ghost"
                      style={{ padding: '5px 10px', fontSize: '11.5px' }}
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={(e) => handleDelete(sub._id || sub.id, e)}
                      className="btn btn-danger"
                      style={{ padding: '5px 8px' }}
                      title="Delete Submission"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Submission Modal */}
      {isCreateOpen && (
        <SubmissionModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={(newSub) => {
            setSubmissions((prev) => [newSub, ...prev]);
          }}
        />
      )}

      {/* Detail Inspection Modal */}
      {selectedSub && (
        <SubmissionDetailModal
          submission={selectedSub}
          onClose={() => setSelectedSub(null)}
          onStatusUpdated={(updated) => {
            setSubmissions((prev) => prev.map((s) => (s._id === updated._id || s.id === updated.id ? updated : s)));
            setSelectedSub(updated);
          }}
        />
      )}
    </div>
  );
}
