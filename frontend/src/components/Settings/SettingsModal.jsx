import React, { useState } from 'react';
import { X, Sliders, Database, Bell, Shield, Check, Save } from 'lucide-react';

export default function SettingsModal({
  onClose,
  occupancyLimit,
  setOccupancyLimit,
  dbStatus
}) {
  const [localLimit, setLocalLimit] = useState(occupancyLimit || 8);
  const [confidence, setConfidence] = useState(0.45);
  const [soundOn, setSoundOn] = useState(true);
  const [mongoUri, setMongoUri] = useState('mongodb://localhost:27017/pose_headcount_db');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setOccupancyLimit(Number(localLimit));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(9, 13, 24, 0.7)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={20} color="#00f0ff" />
            <div>
              <h3 style={{ fontSize: '17px', color: '#fff' }}>Vision & System Configuration</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Tweak AI thresholds, database parameters, and occupancy alarms
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Occupancy Limits */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Shield size={16} color="#00f0ff" />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                Occupancy & Crowd Density Alert Limit
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <input
                type="range"
                min="2"
                max="30"
                value={localLimit}
                onChange={(e) => setLocalLimit(e.target.value)}
                style={{ flex: 1, accentColor: '#00f0ff', cursor: 'pointer' }}
              />
              <span className="mono" style={{
                fontSize: '18px',
                fontWeight: '800',
                color: '#00f0ff',
                minWidth: '50px',
                textAlign: 'right'
              }}>
                {localLimit} <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>MAX</span>
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              When the active head count reaches or exceeds this number, visual and audio alarms will trigger.
            </div>
          </div>

          {/* AI Confidence Threshold */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                Pose Landmark Detection Confidence
              </span>
              <span className="mono" style={{ color: '#10b981', fontWeight: '700' }}>
                {Math.round(confidence * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.85"
              step="0.05"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
          </div>

          {/* MongoDB Connection Status */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Database size={16} color={dbStatus?.isConnected ? '#10b981' : '#f59e0b'} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                MongoDB Persistence Engine
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(9, 13, 24, 0.6)',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '10px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Connection State:</div>
                <div style={{
                  fontSize: '13.5px',
                  fontWeight: '700',
                  color: dbStatus?.isConnected ? '#10b981' : '#f59e0b'
                }}>
                  {dbStatus?.message || 'Local DB Fallback Active'}
                </div>
              </div>
              <span className={`badge ${dbStatus?.isConnected ? 'badge-emerald' : 'badge-amber'}`}>
                {dbStatus?.mode || 'local_fallback'}
              </span>
            </div>

            <div style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
              URI: <code className="mono" style={{ color: '#94a3b8' }}>{dbStatus?.uri || mongoUri}</code>
            </div>
          </div>

          {/* Footer Save */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <button onClick={onClose} className="btn btn-ghost">
              Close
            </button>
            <button onClick={handleSave} className="btn btn-primary" style={{ minWidth: '130px' }}>
              {savedSuccess ? <Check size={16} /> : <Save size={16} />}
              <span>{savedSuccess ? 'Saved!' : 'Save Config'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
