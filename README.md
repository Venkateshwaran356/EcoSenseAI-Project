# AuraVision AI • Pose Estimation, Head Count & Work Submission Platform

A modern full-stack web application designed for real-time **AI Pose Estimation**, **Head Count & Crowd Analytics**, and **Work / Safety Audit Submissions** with MongoDB persistence and futuristic cyber-HUD animations.

---

## 🚀 Quick Start Guide

### 1. Run the Backend (`npm run dev`)
Open a terminal in the `backend/` directory:
```bash
cd backend
npm run dev
```
> The API server will start on **`http://localhost:5000`**.
> It connects automatically to **MongoDB** (`mongodb://localhost:27017/pose_headcount_db`). If MongoDB is not running locally, the server seamlessly uses the resilient local database (`backend/data/store.json`) without crashing!

### 2. Run the Frontend (`npm run dev`)
Open a second terminal in the `frontend/` directory:
```bash
cd frontend
npm run dev
```
> Open your browser to **`http://localhost:5173`**.

### 3. (Optional) Run Both from Project Root
From the project root:
```bash
npm run dev
```
*(Runs both backend and frontend concurrently in a single terminal window).*

---

## 🌟 Key Features

### 👤 1. AI Pose Estimation
- **17-Landmark Skeletal Tracking**: Real-time joints (shoulders, elbows, wrists, hips, knees, ankles, face).
- **Biomechanical Angles**: Computes real-time elbow flexion, knee flexion, and spine tilt angles.
- **Ergonomics Posture Score**: 0–100% ergonomics rating with classifications:
  - *Optimal Ergonomics (Upright)*
  - *Mild Slouching*
  - *Squatting / Bending*
  - *⚠️ FALL / COLLAPSE ALERT*

### 👥 2. Real-Time Head Count & Crowd Analytics
- **Person & Head Detection**: Bounding boxes, head reticles, confidence badges, and tracker IDs.
- **Directional Tripwire**: Adjustable gate height that records directional *IN* and *OUT* flow.
- **Occupancy Alarm**: Visual and audio alerts when head count exceeds the configured room limit.

### 📝 3. Work Submission System
- **Audit Reports**: Submit inspections, lab safety logs, and posture compliance audits.
- **Instant Snapshot Capture**: Freezes the current frame with rendered pose landmarks/headcount and attaches it to the submission.
- **Reviewer Workflow**: Supervisors can review submissions, add remarks, and mark them as **Approved**, **Under Review**, or **Rejected** (with celebratory animations on approval).
- **Export**: One-click export of submission records to CSV format.

### 📊 4. Telemetry & Analytics Dashboard
- Live occupancy trendline chart.
- Ergonomics distribution breakdown.
- Automated safety incident log.

---

## 📁 Project Architecture

```
d:/project/
├── backend/
│   ├── config/
│   │   └── db.js            # MongoDB connection + resilient local JSON fallback
│   ├── models/
│   │   ├── Submission.js    # Mongoose schema for Work Submissions
│   │   └── Analytics.js     # Mongoose schema for Headcount logs & alerts
│   ├── routes/
│   │   ├── submissions.js  # CRUD REST endpoints for work submissions
│   │   ├── analytics.js    # Telemetry data, alerts, and summary stats
│   │   └── upload.js       # File uploads & base64 canvas snapshot saving
│   ├── uploads/            # Attached snapshots and proof images
│   ├── package.json        # Express, Mongoose, Multer, Nodemon
│   └── server.js           # Express API server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar/         # Top navigation & MongoDB health badge
│   │   │   ├── VisionHub/      # Real-time pose canvas, headcount & tripwire
│   │   │   ├── Submissions/    # Work submission portal, modals & CSV export
│   │   │   ├── Analytics/      # Trend charts & incident alerts
│   │   │   └── Settings/       # Config modal for thresholds & alarms
│   │   ├── App.jsx             # Main application component
│   │   ├── index.css           # Futuristic cyberpunk glassmorphism design system
│   │   └── main.jsx            # React root mount
│   ├── index.html              # HTML shell with Google Fonts Outfit & JetBrains Mono
│   ├── package.json            # React 18, Vite, Lucide-React, Canvas-Confetti
│   └── vite.config.js          # Vite config with API reverse proxy to :5000
│
└── package.json                # Root concurrently script
```
