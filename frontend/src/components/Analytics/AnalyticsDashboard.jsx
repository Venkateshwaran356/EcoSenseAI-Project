import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  Activity,
  ShieldAlert,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

export default function AnalyticsDashboard({ dbStatus }) {
  const [history, setHistory] = useState([
    { time: '09:00', count: 3, inFlow: 4, outFlow: 1, posture: 92 },
    { time: '09:15', count: 5, inFlow: 3, outFlow: 1, posture: 89 },
    { time: '09:30', count: 8, inFlow: 5, outFlow: 2, posture: 84 },
    { time: '09:45', count: 6, inFlow: 2, outFlow: 4, posture: 90 },
    { time: '10:00', count: 7, inFlow: 4, outFlow: 3, posture: 95 },
    { time: '10:15', count: 4, inFlow: 1, outFlow: 4, posture: 91 },
    { time: '10:30', count: 6, inFlow: 3, outFlow: 1, posture: 93 },
    { time: '10:45', count: 9, inFlow: 5, outFlow: 2, posture: 88 }
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 'alt_01',
      time: '10:42 AM',
      type: 'CAPACITY_WARNING',
      message: 'Occupancy reached 9 people (exceeded threshold 8)',
      level: 'warning'
    },
    {
      id: 'alt_02',
      time: '10:15 AM',
      type: 'ERGONOMIC_ALERT',
      message: 'Persistent spine flexion (>30°) detected at Station 2',
      level: 'info'
    },
    {
      id: 'alt_03',
      time: '09:34 AM',
      type: 'TRIPWIRE_CROSSING',
      message: 'High sudden inflow rate (5 persons / 30 seconds)',
      level: 'info'
    }
  ]);

  const [overview, setOverview] = useState(null);

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOverview(data.data);
      })
      .catch((err) => console.warn('Could not load analytics overview:', err));

    fetch('/api/analytics/alerts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.length) {
          setAlerts(data.data);
        }
      })
      .catch((err) => console.warn('Could not load alerts:', err));
  }, []);

  // Compute SVG chart coordinates for headcount trend
  const maxVal = Math.max(...history.map((h) => h.count), 12);
  const chartW = 700;
  const chartH = 200;
  const points = history.map((item, idx) => {
    const x = 40 + (idx / (history.length - 1)) * (chartW - 80);
    const y = chartH - 30 - (item.count / maxVal) * (chartH - 60);
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M ${points[0]} L ${points.join(' L ')} L ${chartW - 40},${chartH - 30} L 40,${chartH - 30} Z`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Telemetry KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
              Peak Head Count
            </span>
            <Users size={16} color="#00f0ff" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#00f0ff' }}>
            {overview?.peakCapacityToday || 9}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Recorded today in Sector A
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
              Average Posture Score
            </span>
            <Activity size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
            91.4%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Ergonomics safety rating
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
              Audit Submissions
            </span>
            <TrendingUp size={16} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#8b5cf6' }}>
            {overview?.totalSubmissions || 2}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Verified inspection records
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
              Active Safety Alerts
            </span>
            <ShieldAlert size={16} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#f43f5e' }}>
            {alerts.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Capacity & posture breaches
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Real-time Head Count Trendline */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '16px', color: '#fff' }}>Occupancy & Head Count Timeline</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Real-time head detections tracked across time intervals
              </div>
            </div>
            <span className="badge badge-cyan">LIVE TELEMETRY</span>
          </div>

          {/* SVG Glow Chart */}
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', height: '220px', display: 'block' }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="30" x2={chartW - 40} y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="40" y1="90" x2={chartW - 40} y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="40" y1="150" x2={chartW - 40} y2="150" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

              {/* Area */}
              <path d={areaD} fill="url(#areaGradient)" />

              {/* Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#00f0ff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.7))' }}
              />

              {/* Data points */}
              {history.map((item, idx) => {
                const x = 40 + (idx / (history.length - 1)) * (chartW - 80);
                const y = chartH - 30 - (item.count / maxVal) * (chartH - 60);
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="5" fill="#00f0ff" />
                    <circle cx={x} cy={y} r="2.5" fill="#ffffff" />
                    <text x={x} y={chartH - 10} fill="#64748b" fontSize="10.5" textAnchor="middle" fontFamily="var(--font-mono)">
                      {item.time}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Ergonomics Posture Breakdown */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '4px' }}>Ergonomics Distribution</h3>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Biomechanical posture classifications
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                <span style={{ color: '#10b981' }}>Upright & Optimal</span>
                <span className="mono">74%</span>
              </div>
              <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '74%', height: '100%', background: '#10b981' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                <span style={{ color: '#f59e0b' }}>Mild Slouching</span>
                <span className="mono">18%</span>
              </div>
              <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '18%', height: '100%', background: '#f59e0b' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                <span style={{ color: '#8b5cf6' }}>Squatting / Bending</span>
                <span className="mono">6%</span>
              </div>
              <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '6%', height: '100%', background: '#8b5cf6' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                <span style={{ color: '#f43f5e' }}>Severe Strain / Hazards</span>
                <span className="mono">2%</span>
              </div>
              <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '2%', height: '100%', background: '#f43f5e' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Incident Log */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '16px', color: '#fff' }}>Automated Safety & Alert Log</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Events flagged by AI vision filters
            </div>
          </div>
          <span className="badge badge-rose">REAL-TIME AUDIT</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alerts.map((alt) => (
            <div
              key={alt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '10px',
                background: alt.level === 'warning' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${alt.level === 'warning' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={18} color={alt.level === 'warning' ? '#f43f5e' : '#f59e0b'} />
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#fff' }}>{alt.message}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{alt.type}</div>
                </div>
              </div>
              <span className="mono" style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{alt.time || 'Recent'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
