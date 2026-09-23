import React, { useState, useEffect } from 'react';
import { Eye, Activity, FileCheck2, BarChart3, Settings, Database, Clock, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, dbStatus, onOpenSettings }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'vision', label: 'Vision Hub', icon: Eye, badge: 'LIVE' },
    { id: 'submissions', label: 'Work Submissions', icon: FileCheck2 },
    { id: 'analytics', label: 'Telemetry & Analytics', icon: BarChart3 },
  ];

  return (
    <header className="navbar-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 28px',
      background: 'rgba(9, 13, 24, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(139, 92, 246, 0.3) 100%)',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.25)'
        }}>
          <Eye size={22} color="#00f0ff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
              AuraVision <span style={{ color: '#00f0ff' }}>AI</span>
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '10px', padding: '2px 8px' }}>v2.4 PRO</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Pose Estimation • Head Count • Work Portal
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 24, 46, 0.6)', padding: '5px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(139, 92, 246, 0.2) 100%)' : 'transparent',
                color: isActive ? '#00f0ff' : 'var(--text-muted)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 16px -2px rgba(0, 240, 255, 0.2)' : 'none',
                outline: 'none'
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '9px',
                  background: 'rgba(0, 240, 255, 0.2)',
                  color: '#00f0ff',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  fontWeight: '800'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Telemetry & DB Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* MongoDB Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '20px',
          background: dbStatus?.isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${dbStatus?.isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          fontSize: '12px',
          fontWeight: '600'
        }} title={dbStatus?.message || 'Database status'}>
          <span className={`pulse-dot ${dbStatus?.isConnected ? 'pulse-dot-green' : 'pulse-dot-amber'}`} />
          <Database size={13} color={dbStatus?.isConnected ? '#10b981' : '#f59e0b'} />
          <span style={{ color: dbStatus?.isConnected ? '#10b981' : '#f59e0b' }}>
            {dbStatus?.isConnected ? 'MongoDB Active' : 'Local DB Active'}
          </span>
        </div>

        {/* Live Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12.5px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)'
        }}>
          <Clock size={14} color="#64748b" />
          <span>{currentTime}</span>
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="btn btn-ghost"
          style={{ padding: '8px 12px', borderRadius: '10px' }}
          title="System Settings"
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}
