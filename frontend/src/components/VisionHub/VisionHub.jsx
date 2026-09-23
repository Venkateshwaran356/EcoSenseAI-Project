import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  Video,
  Play,
  Pause,
  RefreshCw,
  Sliders,
  CheckCircle,
  AlertCircle,
  Eye,
  Maximize2
} from 'lucide-react';
import HUDOverlay from './HUDOverlay';
import {
  generateSimulatedPose,
  analyzePosture,
  drawPoseHUD
} from './PoseDetector';
import { HeadCountTracker } from './HeadCountTracker';

export default function VisionHub({ onOpenSubmissionModal, occupancyLimit }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const audioCtxRef = useRef(null);

  // Modes: 'dual', 'pose', 'headcount'
  const [mode, setMode] = useState('dual');
  // Sources: 'simulated', 'webcam', 'video', 'image'
  const [sourceType, setSourceType] = useState('simulated');
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [tripwireY, setTripwireY] = useState(0.52);

  // Telemetry state
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(14);
  const [poseMetrics, setPoseMetrics] = useState({
    postureScore: 94,
    postureStatus: 'Optimal Ergonomics (Upright)',
    elbowAngle: 142,
    kneeAngle: 168,
    torsoTilt: 6,
    isFallDetected: false,
    hazardLevel: 'Normal'
  });
  const [headCountData, setHeadCountData] = useState({
    currentCount: 4,
    totalIn: 7,
    totalOut: 3,
    peakCount: 6,
    isCapacityBreached: false,
    occupancyLimit: occupancyLimit || 8
  });

  const trackerRef = useRef(
    new HeadCountTracker({
      tripwireYRatio: 0.52,
      occupancyLimit: occupancyLimit || 8,
      totalIn: 8,
      totalOut: 4
    })
  );

  // Update occupancy limit in tracker if prop changes
  useEffect(() => {
    if (trackerRef.current) {
      trackerRef.current.setOccupancyLimit(occupancyLimit || 8);
    }
  }, [occupancyLimit]);

  // Update tripwire in tracker
  useEffect(() => {
    if (trackerRef.current) {
      trackerRef.current.setTripwirePosition(tripwireY);
    }
  }, [tripwireY]);

  // Handle webcam stream start/stop
  useEffect(() => {
    let stream = null;
    if (sourceType === 'webcam') {
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: 1280, height: 720 } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.warn('Webcam permission not granted or camera busy:', err);
          alert('Could not access webcam. Falling back to Simulated AI Feed.');
          setSourceType('simulated');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [sourceType]);

  // Web Audio Alarm tone generator
  const triggerAlarmTone = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio might be blocked until user interaction
    }
  };

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();
    let startTime = Date.now();

    const renderLoop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      frameCount++;

      // Compute FPS every 500ms
      if (now - fpsTimer > 500) {
        const computedFps = Math.round((frameCount * 1000) / (now - fpsTimer));
        setFps(computedFps);
        setLatency(Math.max(10, Math.round(1000 / Math.max(1, computedFps)) - 3));
        frameCount = 0;
        fpsTimer = now;
      }

      // Ensure canvas matches container dimensions
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear Canvas or draw background
      ctx.clearRect(0, 0, width, height);

      // If simulated feed, draw a deep surveillance room cyber canvas
      if (sourceType === 'simulated') {
        drawSimulatedSurveillanceBackground(ctx, width, height, now * 0.001);
      } else if (sourceType === 'webcam' && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);
      }

      const elapsedSec = (Date.now() - startTime) * 0.001;

      // 2. Render Head Count Tracker
      if (mode === 'headcount' || mode === 'dual') {
        const hcStats = trackerRef.current.updateSimulatedTrackers(elapsedSec, width, height);
        trackerRef.current.draw(ctx, width, height);
        setHeadCountData({ ...hcStats });

        if (hcStats.isCapacityBreached && Math.floor(elapsedSec * 2) % 4 === 0) {
          triggerAlarmTone();
        }
      }

      // 3. Render Pose Estimation
      if (mode === 'pose' || mode === 'dual') {
        const keypoints = generateSimulatedPose(elapsedSec, width, height);
        const metrics = analyzePosture(keypoints);
        drawPoseHUD(ctx, keypoints, metrics, width, height);
        setPoseMetrics(metrics);
      }

      // Continue animation loop
      if (isPlaying) {
        animationFrameId.current = requestAnimationFrame(renderLoop);
      }
    };

    animationFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, mode, sourceType, soundEnabled]);

  // Cyber background renderer for simulated stream
  const drawSimulatedSurveillanceBackground = (ctx, w, h, t) => {
    // Gradient dark backdrop
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#040714');
    grad.addColorStop(0.5, '#0a1024');
    grad.addColorStop(1, '#050918');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Perspective Floor Grid Lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    const horizon = h * 0.42;

    // Horizontal floor rungs
    for (let y = horizon; y <= h; y += (y - horizon + 12) * 0.3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Perspective rays converging to horizon center
    const vpX = w * 0.5;
    for (let x = -w * 0.5; x <= w * 1.5; x += 110) {
      ctx.beginPath();
      ctx.moveTo(vpX, horizon);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Top CCTV info header
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('CAM 01 // MAIN WORKSPACE SECTOR-A [LIVE FEED]', 24, 28);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(w - 75, 24, 4.5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.fillText('REC', w - 62, 28);
  };

  // Capture canvas image to base64
  const captureCanvasImage = () => {
    if (!canvasRef.current) return null;
    return canvasRef.current.toDataURL('image/png');
  };

  // Trigger submission modal with current frame and metrics
  const handleCaptureForSubmission = () => {
    const snapshotBase64 = captureCanvasImage();
    if (onOpenSubmissionModal) {
      onOpenSubmissionModal({
        snapshotBase64,
        headCount: headCountData?.currentCount || 0,
        postureScore: poseMetrics?.postureScore || 94,
        metrics: {
          elbowAngle: poseMetrics?.elbowAngle || 142,
          kneeAngle: poseMetrics?.kneeAngle || 168,
          torsoTilt: poseMetrics?.torsoTilt || 6,
          postureStatus: poseMetrics?.postureStatus || 'Optimal'
        }
      });
    }
  };

  // Download snapshot to client file
  const handleTakeSnapshot = () => {
    const dataUrl = captureCanvasImage();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `auravision-snapshot-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Handle local video or image upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setSourceType('video');
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.play();
      }
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      setSourceType('image');
    }
  };

  return (
    <div className="grid-main">
      {/* Left Column: Video Feeder & Canvas Screen */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Top Control Bar: Source & Mode Selectors */}
        <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
              VISION MODE:
            </span>
            <div style={{ display: 'flex', background: 'rgba(9, 13, 24, 0.7)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setMode('dual')}
                className="btn"
                style={{
                  padding: '5px 12px',
                  fontSize: '12px',
                  borderRadius: '7px',
                  background: mode === 'dual' ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(139, 92, 246, 0.3))' : 'transparent',
                  color: mode === 'dual' ? '#00f0ff' : 'var(--text-muted)',
                  border: mode === 'dual' ? '1px solid rgba(0, 240, 255, 0.4)' : 'none'
                }}
              >
                Dual Mode
              </button>
              <button
                onClick={() => setMode('pose')}
                className="btn"
                style={{
                  padding: '5px 12px',
                  fontSize: '12px',
                  borderRadius: '7px',
                  background: mode === 'pose' ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                  color: mode === 'pose' ? '#8b5cf6' : 'var(--text-muted)',
                  border: mode === 'pose' ? '1px solid rgba(139, 92, 246, 0.4)' : 'none'
                }}
              >
                Pose Estimation
              </button>
              <button
                onClick={() => setMode('headcount')}
                className="btn"
                style={{
                  padding: '5px 12px',
                  fontSize: '12px',
                  borderRadius: '7px',
                  background: mode === 'headcount' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                  color: mode === 'headcount' ? '#00f0ff' : 'var(--text-muted)',
                  border: mode === 'headcount' ? '1px solid rgba(0, 240, 255, 0.4)' : 'none'
                }}
              >
                Head Count
              </button>
            </div>
          </div>

          {/* Source Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
              FEED:
            </span>
            <button
              onClick={() => setSourceType('simulated')}
              className={`btn ${sourceType === 'simulated' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Simulated Stream
            </button>
            <button
              onClick={() => setSourceType('webcam')}
              className={`btn ${sourceType === 'webcam' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <Camera size={14} />
              <span>Webcam</span>
            </button>
            <label className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
              <Upload size={14} />
              <span>Upload Video/Photo</span>
              <input type="file" accept="video/*,image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Video Canvas Container with Cyber Scanners & HUD Corners */}
        <div className="video-canvas-container" style={{ aspectRatio: '16/9', maxHeight: '580px' }}>
          {/* Hidden video element for webcam or video file playback */}
          <video
            ref={videoRef}
            playsInline
            muted
            loop
            style={{ display: 'none' }}
          />

          {/* Interactive HTML5 Canvas (Renders feed + Pose skeleton + Head count bounding boxes) */}
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />

          {/* Animated Raster Scanlines */}
          <div className="scanline-overlay" />

          {/* Cyber Radar Sweeper */}
          <div className="radar-sweep" />

          {/* Futuristic Corner Reticles */}
          <div className="hud-corner hud-tl" style={{ width: '16px', height: '16px', borderWidth: '3px 0 0 3px' }} />
          <div className="hud-corner hud-tr" style={{ width: '16px', height: '16px', borderWidth: '3px 3px 0 0' }} />
          <div className="hud-corner hud-bl" style={{ width: '16px', height: '16px', borderWidth: '0 0 3px 3px' }} />
          <div className="hud-corner hud-br" style={{ width: '16px', height: '16px', borderWidth: '0 3px 3px 0' }} />
        </div>

        {/* Bottom Quick Feature Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#00f0ff', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
              17-Landmark Pose Tracker
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Measures real-time spine tilt, knee flexion, and arm ergonomics with immediate posture rating.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
              Bidirectional Tripwire
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Directional crossing gate accurately logs entries and exits with adjustable tripwire line.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
              Instant Audit Export
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Click Capture to submit live snapshots and automated telemetry directly to the Work Portal.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: High-Tech Telemetry HUD & Work Submission Launcher */}
      <HUDOverlay
        headCountData={headCountData}
        poseMetrics={poseMetrics}
        fps={fps}
        latency={latency}
        mode={mode}
        onCaptureForSubmission={handleCaptureForSubmission}
        onTakeSnapshot={handleTakeSnapshot}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        tripwireY={tripwireY}
        setTripwireY={setTripwireY}
      />
    </div>
  );
}
