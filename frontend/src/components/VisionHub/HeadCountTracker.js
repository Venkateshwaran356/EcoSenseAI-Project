/**
 * HeadCountTracker.js
 * Multi-person detection, Head Tracker, and Tripwire In/Out directional counting system.
 */

export class HeadCountTracker {
  constructor(options = {}) {
    this.tripwireYRatio = options.tripwireYRatio || 0.52;
    this.occupancyLimit = options.occupancyLimit || 8;
    this.totalIn = options.totalIn || 7;
    this.totalOut = options.totalOut || 3;
    this.currentCount = Math.max(0, this.totalIn - this.totalOut);
    this.peakCount = Math.max(this.currentCount, 6);
    this.trackedPeople = [];
    this.onAlertTriggered = options.onAlertTriggered || null;
  }

  setOccupancyLimit(limit) {
    this.occupancyLimit = Number(limit) || 8;
  }

  setTripwirePosition(ratio) {
    this.tripwireYRatio = Math.max(0.1, Math.min(0.9, ratio));
  }

  /**
   * Generates or updates dynamic people detections
   * (Operates smoothly for simulated streams, webcam, or video feeds)
   */
  updateSimulatedTrackers(timeSec, width, height) {
    const tripwireY = height * this.tripwireYRatio;

    // Simulate 3-5 people walking through a space
    const peopleConfig = [
      { id: 1, baseSpeed: 0.35, offset: 0, xRatio: 0.22, heightRatio: 0.45 },
      { id: 2, baseSpeed: 0.28, offset: 2.2, xRatio: 0.48, heightRatio: 0.50 },
      { id: 3, baseSpeed: 0.32, offset: 4.5, xRatio: 0.74, heightRatio: 0.46 },
      { id: 4, baseSpeed: 0.22, offset: 1.1, xRatio: 0.35, heightRatio: 0.48 }
    ];

    const updated = [];

    peopleConfig.forEach((cfg) => {
      // Loop movement up and down
      const cycleTime = (timeSec * cfg.baseSpeed + cfg.offset) % (Math.PI * 2);
      const verticalMovement = Math.sin(cycleTime);
      const prevVertical = Math.sin(cycleTime - 0.05);

      const boxHeight = height * cfg.heightRatio;
      const boxWidth = boxHeight * 0.45;
      const centerY = height * 0.48 + verticalMovement * (height * 0.3);
      const centerX = width * cfg.xRatio + Math.cos(cycleTime * 1.5) * 20;

      const top = centerY - boxHeight * 0.5;
      const left = centerX - boxWidth * 0.5;

      // Head center point
      const headX = centerX;
      const headY = top + boxHeight * 0.15;

      // Check tripwire crossing event
      const prevY = height * 0.48 + prevVertical * (height * 0.3);
      if (prevY < tripwireY && centerY >= tripwireY) {
        this.totalIn++;
        this.currentCount = Math.max(0, this.totalIn - this.totalOut);
        if (this.currentCount > this.peakCount) this.peakCount = this.currentCount;
      } else if (prevY > tripwireY && centerY <= tripwireY) {
        this.totalOut++;
        this.currentCount = Math.max(0, this.totalIn - this.totalOut);
      }

      updated.push({
        id: cfg.id,
        x: Math.round(left),
        y: Math.round(top),
        width: Math.round(boxWidth),
        height: Math.round(boxHeight),
        headX: Math.round(headX),
        headY: Math.round(headY),
        confidence: 0.94 - (cfg.id * 0.02)
      });
    });

    this.trackedPeople = updated;

    // Check alarm
    const isCapacityBreached = this.currentCount >= this.occupancyLimit;

    return {
      currentCount: this.currentCount,
      totalIn: this.totalIn,
      totalOut: this.totalOut,
      peakCount: this.peakCount,
      people: this.trackedPeople,
      isCapacityBreached,
      occupancyLimit: this.occupancyLimit
    };
  }

  /**
   * Draws cyberpunk bounding boxes, head crosshairs, tripwire line, and headcount HUD
   */
  draw(ctx, canvasWidth, canvasHeight) {
    if (!ctx) return;
    const tripwireY = canvasHeight * this.tripwireYRatio;
    const isAlarm = this.currentCount >= this.occupancyLimit;

    ctx.save();

    // 1. Draw Directional Tripwire Line
    this.drawTripwire(ctx, tripwireY, canvasWidth);

    // 2. Draw Bounding Boxes and Head Reticles for each person
    this.trackedPeople.forEach((p) => {
      this.drawPersonBox(ctx, p);
    });

    // 3. Draw Top-Right Head Count Telemetry Card
    this.drawTelemetryCard(ctx, canvasWidth, isAlarm);

    ctx.restore();
  }

  drawTripwire(ctx, tripwireY, width) {
    ctx.save();
    // Animated glowing dashed line
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(0, tripwireY);
    ctx.lineTo(width, tripwireY);
    ctx.stroke();

    // Tripwire Label Badge
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
    const badgeW = 210;
    const badgeX = width * 0.5 - badgeW * 0.5;
    const badgeY = tripwireY - 14;

    ctx.fillStyle = 'rgba(7, 12, 26, 0.85)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, 26, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText(`▲ IN / OUT TRIPWIRE [Y:${Math.round(this.tripwireYRatio * 100)}%]`, badgeX + 12, badgeY + 17);

    ctx.restore();
  }

  drawPersonBox(ctx, p) {
    ctx.save();
    const boxColor = '#00f0ff';
    const cornerSize = 12;

    // Outer Bounding Box (Semi-transparent)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(p.x, p.y, p.width, p.height);

    // High-tech Corner Brackets
    ctx.strokeStyle = boxColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = boxColor;
    ctx.shadowBlur = 8;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + cornerSize);
    ctx.lineTo(p.x, p.y);
    ctx.lineTo(p.x + cornerSize, p.y);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(p.x + p.width - cornerSize, p.y);
    ctx.lineTo(p.x + p.width, p.y);
    ctx.lineTo(p.x + p.width, p.y + cornerSize);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + p.height - cornerSize);
    ctx.lineTo(p.x, p.y + p.height);
    ctx.lineTo(p.x + cornerSize, p.y + p.height);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(p.x + p.width - cornerSize, p.y + p.height);
    ctx.lineTo(p.x + p.width, p.y + p.height);
    ctx.lineTo(p.x + p.width, p.y + p.height - cornerSize);
    ctx.stroke();

    // Head Crosshair Reticle
    ctx.shadowBlur = 6;
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(p.headX, p.headY, 9, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(p.headX, p.headY, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Person ID Tag
    ctx.shadowBlur = 0;
    const tag = `HEAD #${p.id} [${Math.round(p.confidence * 100)}%]`;
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    const tagW = ctx.measureText(tag).width + 12;

    ctx.fillStyle = 'rgba(7, 10, 20, 0.9)';
    ctx.strokeStyle = boxColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y - 20, tagW, 18, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#00f0ff';
    ctx.fillText(tag, p.x + 6, p.y - 6);

    ctx.restore();
  }

  drawTelemetryCard(ctx, canvasWidth, isAlarm) {
    ctx.save();
    const cardW = 280;
    const cardH = 75;
    const x = canvasWidth - cardW - 20;
    const y = 20;

    // Card Box
    ctx.fillStyle = 'rgba(10, 16, 32, 0.88)';
    ctx.strokeStyle = isAlarm ? '#f43f5e' : 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 8);
    ctx.fill();
    ctx.stroke();

    // Header
    ctx.font = '600 11px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('LIVE OCCUPANCY & HEAD COUNT', x + 14, y + 18);

    // Current Count
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillStyle = isAlarm ? '#f43f5e' : '#00f0ff';
    ctx.fillText(`${this.currentCount}`, x + 14, y + 48);

    ctx.font = '500 12px "Outfit", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`/ ${this.occupancyLimit} MAX`, x + 50, y + 46);

    // In / Out Stats
    ctx.font = '600 11.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`▲ IN: ${this.totalIn}`, x + 160, y + 36);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`▼ OUT: ${this.totalOut}`, x + 160, y + 54);

    if (isAlarm) {
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 10px "Outfit", sans-serif';
      ctx.fillText('⚠️ CAPACITY BREACHED', x + 14, y + 66);
    }

    ctx.restore();
  }
}
