import React from 'react';
import {
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Camera,
  FileCheck2,
  Volume2,
  VolumeX,
  Gauge,
  Sliders,
  CheckCircle2,
  Flame
} from 'lucide-react';

export default function HUDOverlay({
  headCountData,
  poseMetrics,
  fps,
  latency,
  mode,
  onCaptureForSubmission,
  onTakeSnapshot,
  soundEnabled,
  setSoundEnabled,
  tripwireY,
  setTripwireY
}) {
  const isAlarm = headCountData?.isCapacityBreached;
  const postureScore = poseMetrics?.postureScore ?? 94;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Quick Capture Action Card (Prominent CTA for Work Submission) */}
      <div className="glass-panel" style={{
        padding: '18px',
        border: '1px solid rgba(0, 240, 255, 0.4)',
        background: 'linear-gradient(135deg, rgba(14, 21, 42, 0.9) 0%, rgba(20, 32, 60, 0.8) 100%)',
        boxShadow: '0 0 25px -5px rgba(0, 240, 255, 0.25)'
      }}>
        <div className="hud-corner hud-tl" />
        <div className="hud-corner hud-tr" />
        <div className="hud-corner hud-bl" />
        <div className="hud-corner hud-br" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck2 size={18} color="#00f0ff" />
            <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#00f0ff' }}>
              Work Submission Audit
            </span>
          </div>
          <span className="badge badge-cyan" style={{ fontSize: '10px' }}>AUTO-METRICS</span>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
          Freeze the live vision feed, extract joint angles & headcount, and submit an official inspection log.
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCaptureForSubmission}
            className="btn btn-primary"
            style={{ flex: 1, padding: '11px 14px' }}
          >
            <Camera size={16} />
            <span>Capture & Submit</span>
          </button>

          <button
            onClick={onTakeSnapshot}
            className="btn btn-ghost"
            style={{ padding: '11px', borderRadius: '10px' }}
            title="Download Snapshot to PC"
          >
            <Camera size={16} color="#94a3b8" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-ghost"
            style={{ padding: '11px', borderRadius: '10px' }}
            title={soundEnabled ? 'Mute Alarm Sounds' : 'Unmute Alarm Sounds'}
          >
            {soundEnabled ? <Volume2 size={16} color="#10b981" /> : <VolumeX size={16} color="#64748b" />}
          </button>
        </div>
      </div>

      {/* 2. Head Count & Occupancy Status Card */}
      {(mode === 'headcount' || mode === 'dual') && (
        <div className="glass-panel" style={{
          padding: '18px',
          borderColor: isAlarm ? 'rgba(244, 63, 94, 0.5)' : 'var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={17} color={isAlarm ? '#f43f5e' : '#00f0ff'} />
              <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Head Count Telemetry
              </span>
            </div>
            {isAlarm ? (
              <span className="badge badge-rose" style={{ animation: 'pulse 1s infinite' }}>
                <AlertTriangle size={11} /> OVERCAPACITY
              </span>
            ) : (
              <span className="badge badge-emerald">NORMAL FLOW</span>
            )}
          </div>

          {/* Big Number & Capacity Gauge */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            background: 'rgba(9, 13, 24, 0.6)',
            padding: '14px',
            borderRadius: '12px',
            marginBottom: '14px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>
                Current Inside
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: '800',
                fontFamily: 'var(--font-mono)',
                color: isAlarm ? '#f43f5e' : '#00f0ff',
                lineHeight: 1.1
              }}>
                {headCountData?.currentCount ?? 0}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Max Limit: {headCountData?.occupancyLimit ?? 8}
              </div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>
                Today's Peak
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: '800',
                fontFamily: 'var(--font-mono)',
                color: '#8b5cf6',
                lineHeight: 1.1
              }}>
                {headCountData?.peakCount ?? 0}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Recorded High
              </div>
            </div>
          </div>

          {/* Directional Tripwire Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '10px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '10.5px', color: '#10b981', fontWeight: '600' }}>TOTAL INFLOW</div>
                <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                  {headCountData?.totalIn ?? 0}
                </div>
              </div>
              <ArrowDownRight size={20} color="#10b981" />
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              padding: '10px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '10.5px', color: '#f59e0b', fontWeight: '600' }}>TOTAL OUTFLOW</div>
                <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>
                  {headCountData?.totalOut ?? 0}
                </div>
              </div>
              <ArrowUpRight size={20} color="#f59e0b" />
            </div>
          </div>

          {/* Tripwire Y Adjuster */}
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Tripwire Gate Height:</span>
              <span className="mono" style={{ color: '#00f0ff' }}>{Math.round(tripwireY * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.8"
              step="0.02"
              value={tripwireY}
              onChange={(e) => setTripwireY(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#00f0ff', cursor: 'pointer' }}
            />
          </div>
        </div>
      )}

      {/* 3. Pose & Ergonomics Telemetry Card */}
      {(mode === 'pose' || mode === 'dual') && (
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={17} color="#8b5cf6" />
              <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pose Ergonomics HUD
              </span>
            </div>
            <span className={`badge ${postureScore >= 80 ? 'badge-emerald' : (postureScore >= 60 ? 'badge-amber' : 'badge-rose')}`}>
              {poseMetrics?.hazardLevel || 'Optimal'}
            </span>
          </div>

          {/* Posture Score Progress */}
          <div style={{
            background: 'rgba(9, 13, 24, 0.6)',
            padding: '12px 14px',
            borderRadius: '12px',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ergonomic Health Score:</span>
              <span className="mono" style={{
                fontSize: '15px',
                fontWeight: '700',
                color: postureScore >= 80 ? '#10b981' : (postureScore >= 60 ? '#f59e0b' : '#f43f5e')
              }}>
                {postureScore}%
              </span>
            </div>

            {/* Score Bar */}
            <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${postureScore}%`,
                height: '100%',
                background: postureScore >= 80 ? 'linear-gradient(90deg, #10b981, #00f0ff)' : (postureScore >= 60 ? '#f59e0b' : '#f43f5e'),
                transition: 'width 0.3s ease'
              }} />
            </div>

            <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} color="#00f0ff" />
              <span>{poseMetrics?.postureStatus || 'Tracking 17 skeletal landmarks'}</span>
            </div>
          </div>

          {/* Real-Time Joint Angles Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <div style={{ background: 'rgba(16, 24, 46, 0.5)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>ELBOW</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>
                {poseMetrics?.elbowAngle ?? 142}°
              </div>
            </div>

            <div style={{ background: 'rgba(16, 24, 46, 0.5)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>KNEE</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                {poseMetrics?.kneeAngle ?? 168}°
              </div>
            </div>

            <div style={{ background: 'rgba(16, 24, 46, 0.5)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>SPINE TILT</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#8b5cf6', fontFamily: 'var(--font-mono)' }}>
                {poseMetrics?.torsoTilt ?? 6}°
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Hardware & Inference Telemetry */}
      <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          <span>FPS: <strong className="mono" style={{ color: '#00f0ff' }}>{fps}</strong></span>
          <span>LATENCY: <strong className="mono" style={{ color: '#10b981' }}>{latency}ms</strong></span>
        </div>
        <div>
          <span>ENGINE: <strong style={{ color: '#8b5cf6' }}>WebGL / Canvas</strong></span>
        </div>
      </div>
    </div>
  );
}
