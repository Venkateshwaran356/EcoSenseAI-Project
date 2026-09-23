/**
 * PoseDetector.js
 * Comprehensive client-side Pose Estimation & Ergonomics Engine
 * Analyzes 17 key human skeleton landmarks, joint angles, slouching, and fall alerts.
 */

// 17 Standard COCO Keypoint IDs
export const KEYPOINTS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16
};

// Skeleton Bone Connections [Point A, Point B, Color]
export const SKELETON_CONNECTIONS = [
  // Upper Arms
  [KEYPOINTS.LEFT_SHOULDER, KEYPOINTS.LEFT_ELBOW, '#00f0ff'],
  [KEYPOINTS.LEFT_ELBOW, KEYPOINTS.LEFT_WRIST, '#00f0ff'],
  [KEYPOINTS.RIGHT_SHOULDER, KEYPOINTS.RIGHT_ELBOW, '#00f0ff'],
  [KEYPOINTS.RIGHT_ELBOW, KEYPOINTS.RIGHT_WRIST, '#00f0ff'],
  // Torso
  [KEYPOINTS.LEFT_SHOULDER, KEYPOINTS.RIGHT_SHOULDER, '#8b5cf6'],
  [KEYPOINTS.LEFT_SHOULDER, KEYPOINTS.LEFT_HIP, '#8b5cf6'],
  [KEYPOINTS.RIGHT_SHOULDER, KEYPOINTS.RIGHT_HIP, '#8b5cf6'],
  [KEYPOINTS.LEFT_HIP, KEYPOINTS.RIGHT_HIP, '#8b5cf6'],
  // Legs
  [KEYPOINTS.LEFT_HIP, KEYPOINTS.LEFT_KNEE, '#10b981'],
  [KEYPOINTS.LEFT_KNEE, KEYPOINTS.LEFT_ANKLE, '#10b981'],
  [KEYPOINTS.RIGHT_HIP, KEYPOINTS.RIGHT_KNEE, '#10b981'],
  [KEYPOINTS.RIGHT_KNEE, KEYPOINTS.RIGHT_ANKLE, '#10b981'],
  // Head
  [KEYPOINTS.NOSE, KEYPOINTS.LEFT_EYE, '#38bdf8'],
  [KEYPOINTS.NOSE, KEYPOINTS.RIGHT_EYE, '#38bdf8'],
  [KEYPOINTS.LEFT_EYE, KEYPOINTS.LEFT_EAR, '#38bdf8'],
  [KEYPOINTS.RIGHT_EYE, KEYPOINTS.RIGHT_EAR, '#38bdf8']
];

/**
 * Calculates the interior angle in degrees between three points (A -> B -> C)
 * Vertex is at point B
 */
export function calculateAngle(pointA, pointB, pointC) {
  if (!pointA || !pointB || !pointC) return 0;

  const radians =
    Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Math.round(angle);
}

/**
 * Calculates torso tilt relative to vertical axis (90 degrees = upright)
 */
export function calculateTorsoTilt(lShoulder, rShoulder, lHip, rHip) {
  if (!lShoulder || !rShoulder || !lHip || !rHip) return 0;
  const midShoulder = {
    x: (lShoulder.x + rShoulder.x) / 2,
    y: (lShoulder.y + rShoulder.y) / 2
  };
  const midHip = {
    x: (lHip.x + rHip.x) / 2,
    y: (lHip.y + rHip.y) / 2
  };

  const dx = midShoulder.x - midHip.x;
  const dy = midHip.y - midShoulder.y; // Invert Y because canvas Y grows downwards
  const angleFromVertical = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
  return Math.round(angleFromVertical);
}

/**
 * Analyzes keypoints to return comprehensive posture metrics and ergonomics score
 */
export function analyzePosture(keypoints) {
  if (!keypoints || keypoints.length < 17) {
    return {
      postureScore: 100,
      postureStatus: 'Standing Upright',
      elbowAngle: 150,
      kneeAngle: 170,
      torsoTilt: 5,
      isFallDetected: false,
      hazardLevel: 'Normal'
    };
  }

  const lShoulder = keypoints[KEYPOINTS.LEFT_SHOULDER];
  const rShoulder = keypoints[KEYPOINTS.RIGHT_SHOULDER];
  const lElbow = keypoints[KEYPOINTS.LEFT_ELBOW];
  const rElbow = keypoints[KEYPOINTS.RIGHT_ELBOW];
  const lWrist = keypoints[KEYPOINTS.LEFT_WRIST];
  const rWrist = keypoints[KEYPOINTS.RIGHT_WRIST];
  const lHip = keypoints[KEYPOINTS.LEFT_HIP];
  const rHip = keypoints[KEYPOINTS.RIGHT_HIP];
  const lKnee = keypoints[KEYPOINTS.LEFT_KNEE];
  const rKnee = keypoints[KEYPOINTS.RIGHT_KNEE];
  const lAnkle = keypoints[KEYPOINTS.LEFT_ANKLE];
  const rAnkle = keypoints[KEYPOINTS.RIGHT_ANKLE];

  // Angles
  const leftElbowAngle = calculateAngle(lShoulder, lElbow, lWrist);
  const rightElbowAngle = calculateAngle(rShoulder, rElbow, rWrist);
  const avgElbowAngle = Math.round((leftElbowAngle + rightElbowAngle) / 2) || 145;

  const leftKneeAngle = calculateAngle(lHip, lKnee, lAnkle);
  const rightKneeAngle = calculateAngle(rHip, rKnee, rAnkle);
  const avgKneeAngle = Math.round((leftKneeAngle + rightKneeAngle) / 2) || 170;

  const torsoTilt = calculateTorsoTilt(lShoulder, rShoulder, lHip, rHip);

  // Posture scoring & classification
  let postureStatus = 'Standing Upright';
  let hazardLevel = 'Normal';
  let penalty = 0;

  // Check for fall / horizontal orientation
  const isFallDetected = torsoTilt > 60;
  if (isFallDetected) {
    postureStatus = '⚠️ FALL / COLLAPSE ALERT';
    hazardLevel = 'Critical';
    penalty += 60;
  } else if (avgKneeAngle < 125) {
    postureStatus = 'Squatting / Bending Knees';
    hazardLevel = 'Moderate';
    penalty += 15;
  } else if (torsoTilt > 25) {
    postureStatus = 'Ergonomic Warning: Severe Slouch';
    hazardLevel = 'Warning';
    penalty += 35;
  } else if (torsoTilt > 14) {
    postureStatus = 'Mild Slouching';
    hazardLevel = 'Low';
    penalty += 12;
  } else if (lWrist && lShoulder && lWrist.y < lShoulder.y && rWrist && rShoulder && rWrist.y < rShoulder.y) {
    postureStatus = 'Hands Raised / Overhead Reach';
  } else {
    postureStatus = 'Optimal Ergonomics (Upright)';
  }

  const postureScore = Math.max(25, Math.min(100, 100 - penalty));

  return {
    postureScore,
    postureStatus,
    elbowAngle: avgElbowAngle,
    kneeAngle: avgKneeAngle,
    torsoTilt,
    isFallDetected,
    hazardLevel
  };
}

/**
 * Synthesizes dynamic pose keypoints (used for demo simulation or when camera lacks keypoints)
 */
export function generateSimulatedPose(timeSec, width, height) {
  const cx = width * 0.5;
  const cy = height * 0.45;
  const scale = height * 0.55;

  // Subtle breathing and sway
  const sway = Math.sin(timeSec * 1.5) * 15;
  const kneeFlex = Math.sin(timeSec * 0.8);
  const armWave = Math.cos(timeSec * 2.0);

  const headY = cy - scale * 0.55;
  const neckY = cy - scale * 0.42;
  const shoulderY = cy - scale * 0.38;
  const hipY = cy + scale * 0.05;
  const kneeY = cy + scale * 0.45 + (kneeFlex > 0.6 ? 20 : 0);
  const ankleY = cy + scale * 0.85;

  return [
    { x: cx + sway * 0.2, y: headY, score: 0.95 },          // 0 Nose
    { x: cx - 12 + sway * 0.2, y: headY - 8, score: 0.94 }, // 1 L Eye
    { x: cx + 12 + sway * 0.2, y: headY - 8, score: 0.94 }, // 2 R Eye
    { x: cx - 25, y: headY, score: 0.91 },                  // 3 L Ear
    { x: cx + 25, y: headY, score: 0.91 },                  // 4 R Ear
    { x: cx - 75 + sway * 0.4, y: shoulderY, score: 0.97 }, // 5 L Shoulder
    { x: cx + 75 + sway * 0.4, y: shoulderY, score: 0.97 }, // 6 R Shoulder
    { x: cx - 120 + armWave * 15, y: shoulderY + 80, score: 0.93 }, // 7 L Elbow
    { x: cx + 120 - armWave * 10, y: shoulderY + 75, score: 0.93 }, // 8 R Elbow
    { x: cx - 145 + armWave * 25, y: shoulderY + 150 + armWave * 20, score: 0.89 }, // 9 L Wrist
    { x: cx + 140, y: shoulderY + 145, score: 0.90 },       // 10 R Wrist
    { x: cx - 45 + sway * 0.1, y: hipY, score: 0.96 },       // 11 L Hip
    { x: cx + 45 + sway * 0.1, y: hipY, score: 0.96 },       // 12 R Hip
    { x: cx - 55, y: kneeY, score: 0.95 },                  // 13 L Knee
    { x: cx + 55, y: kneeY, score: 0.95 },                  // 14 R Knee
    { x: cx - 50, y: ankleY, score: 0.92 },                 // 15 L Ankle
    { x: cx + 50, y: ankleY, score: 0.92 }                  // 16 R Ankle
  ];
}

/**
 * Draws the high-tech glowing skeleton overlay onto the given HTML5 canvas context
 */
export function drawPoseHUD(ctx, keypoints, metrics, canvasWidth, canvasHeight) {
  if (!ctx || !keypoints || keypoints.length < 17) return;

  // 1. Draw Skeleton Bones
  ctx.save();
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  SKELETON_CONNECTIONS.forEach(([iA, iB, color]) => {
    const ptA = keypoints[iA];
    const ptB = keypoints[iB];
    if (ptA && ptB && ptA.score > 0.3 && ptB.score > 0.3) {
      // Glow effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(ptA.x, ptA.y);
      ctx.lineTo(ptB.x, ptB.y);
      ctx.stroke();
    }
  });

  // 2. Draw Joint Markers
  keypoints.forEach((pt, idx) => {
    if (!pt || pt.score < 0.3) return;
    const isMajorJoint = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14].includes(idx);
    const radius = isMajorJoint ? 6.5 : 4.5;

    // Outer Glow Ring
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Inner White Core
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius * 0.45, 0, 2 * Math.PI);
    ctx.fill();
  });

  // 3. Draw Angle Arc Annotations on Left Elbow and Left Knee
  const lElbow = keypoints[KEYPOINTS.LEFT_ELBOW];
  if (lElbow && metrics.elbowAngle) {
    drawAngleBadge(ctx, lElbow.x - 45, lElbow.y - 12, `${metrics.elbowAngle}°`, '#00f0ff');
  }

  const lKnee = keypoints[KEYPOINTS.LEFT_KNEE];
  if (lKnee && metrics.kneeAngle) {
    drawAngleBadge(ctx, lKnee.x - 45, lKnee.y - 12, `${metrics.kneeAngle}°`, '#10b981');
  }

  // 4. Draw Posture Status HUD banner on canvas top
  drawPostureHUDCard(ctx, metrics, canvasWidth);

  ctx.restore();
}

function drawAngleBadge(ctx, x, y, text, color) {
  ctx.save();
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  const width = ctx.measureText(text).width + 14;
  ctx.fillStyle = 'rgba(7, 10, 20, 0.85)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y - 14, width, 22, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fillText(text, x + 7, y + 2);
  ctx.restore();
}

function drawPostureHUDCard(ctx, metrics, canvasWidth) {
  ctx.save();
  const cardW = 320;
  const cardH = 58;
  const x = 20;
  const y = 20;

  // Background Box
  ctx.fillStyle = 'rgba(10, 16, 32, 0.85)';
  ctx.strokeStyle = metrics.hazardLevel === 'Critical' ? '#f43f5e' : 'rgba(0, 240, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 8);
  ctx.fill();
  ctx.stroke();

  // Status Title
  ctx.font = '600 11px "Outfit", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('AI POSTURE ANALYSIS & SKELETON', x + 12, y + 18);

  // Status description
  ctx.font = 'bold 13px "Outfit", sans-serif';
  ctx.fillStyle = metrics.hazardLevel === 'Critical' ? '#f43f5e' : (metrics.hazardLevel === 'Warning' ? '#f59e0b' : '#00ff9d');
  ctx.fillText(metrics.postureStatus, x + 12, y + 42);

  // Score Badge
  const scoreX = x + cardW - 75;
  ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
  ctx.beginPath();
  ctx.roundRect(scoreX, y + 8, 64, 42, 6);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 17px "JetBrains Mono", monospace';
  ctx.fillStyle = metrics.postureScore >= 80 ? '#00ff9d' : (metrics.postureScore >= 60 ? '#f59e0b' : '#f43f5e');
  ctx.fillText(`${metrics.postureScore}%`, scoreX + 11, y + 33);

  ctx.restore();
}
