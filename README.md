<<<<<<< HEAD
# AuraVision AI • Pose Estimation, Head Count & Work Submission Platform

A modern full-stack web application designed for real-time **AI Pose Estimation**, **Head Count & Crowd Analytics**, and **Work / Safety Audit Submissions** with MongoDB persistence and futuristic cyber-HUD animations.

---

## 🚀 Quick Start Guide

### 1. Run the Backend (`npm run dev`)
Open a terminal in the `backend/` directory:
=======
# Task Manager

A simple, production-ready full-stack website designed to test web hosting setups (GitHub → Ubuntu → CloudPanel → Node.js → MongoDB). 

## Tech Stack
- **Frontend**: React (Vite), Modern responsive UI (Vanilla CSS)
- **Backend**: Node.js 24 LTS, Express.js
- **Database**: MongoDB (Mongoose)

## Project Structure
- `frontend/` - React frontend
- `backend/` - Node.js Express backend API

## Prerequisites
- Node.js 24 LTS
- MongoDB running locally or on a server

## Local Development Instructions

### 1. Clone repository
```bash
git clone <your-repo-url>
cd task-manager
```

### 2. Install frontend dependencies
```bash
cd frontend
npm install
```

### 3. Install backend dependencies
```bash
cd ../backend
npm install
```
*(Or use `npm run install:all` from the root directory)*

### 4. Create .env files
Backend (`backend/.env`):
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/task_manager
```

Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
```

### 5. Configure MongoDB
Ensure your local MongoDB instance is running. The backend will automatically create the `task_manager` database and the `tasks` collection when it connects and inserts data.

### 6. Start backend
>>>>>>> 615b9ce114946ccb4261eff11e55b6e89fd6faf8
```bash
cd backend
npm run dev
```
<<<<<<< HEAD
> The API server will start on **`http://localhost:5000`**.
> It connects automatically to **MongoDB** (`mongodb://localhost:27017/pose_headcount_db`). If MongoDB is not running locally, the server seamlessly uses the resilient local database (`backend/data/store.json`) without crashing!

### 2. Run the Frontend (`npm run dev`)
Open a second terminal in the `frontend/` directory:
=======

### 7. Start frontend
>>>>>>> 615b9ce114946ccb4261eff11e55b6e89fd6faf8
```bash
cd frontend
npm run dev
```
<<<<<<< HEAD
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
=======

### 8. Build frontend (for production testing)
```bash
cd frontend
npm run build
```

---

## Production Deployment (CloudPanel)

This project is fully compatible with deployment on an Ubuntu server running CloudPanel.

### CloudPanel Deployment Instructions

1. **Create Node.js App Site in CloudPanel**
   - Click "Add Site" -> "Create a Node.js App"
   - Application Name: `task-manager`
   - Node.js Version: `24 LTS`
   - App Port: `3000`

2. **Clone and Install**
   - SSH into your server as the site user.
   - Clone your repository into the `htdocs` directory (e.g., `/home/username/htdocs/yourdomain.com`).
   - Run `npm run install:all` from the root of the project to install all dependencies.

3. **Environment Setup**
   - In the `backend` folder, create `.env` with production MongoDB credentials.
   - In the `frontend` folder, create `.env` and set `VITE_API_URL` to your live domain (e.g., `VITE_API_URL=https://yourdomain.com`).

4. **Build Frontend**
   - Inside `frontend`, run `npm run build`. 
   - This generates a `dist` folder.

5. **CloudPanel/Nginx Configuration**
   - You need Nginx to serve the `frontend/dist` directory for the main route `/` and reverse proxy `/api` requests to the Node.js backend on port `3000`.
   - Go to CloudPanel -> Vhost for your site.
   - Edit the Nginx config. Add/modify the location blocks:

   ```nginx
   # Serve Frontend Build
   location / {
       root /home/username/htdocs/yourdomain.com/frontend/dist;
       try_files $uri $uri/ /index.html;
   }

   # Reverse Proxy Backend API
   location /api/ {
       proxy_pass http://127.0.0.1:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```
   *(Ensure you replace `/home/username/htdocs/yourdomain.com` with the actual path)*

6. **Start Backend Service**
   - In CloudPanel's Node.js App settings for the site, set the Application Startup File to `backend/server.js` or `backend/package.json` with the `start` script.
   - Ensure the app is started using the CloudPanel PM2 manager.

### Troubleshooting
- **Frontend shows blank page:** Check the Nginx `root` path pointing to `frontend/dist`. Ensure `npm run build` was executed successfully.
- **API requests failing (404/502):** Verify that the backend is running on port 3000 via PM2. Check the Nginx `location /api/` block to ensure it's reverse proxying correctly to `127.0.0.1:3000`.
- **Database Connection Error:** Verify MongoDB is running locally on the server or ensure `MONGODB_URI` has the correct authentication credentials for an external database. Port `27017` should not be publicly accessible.
>>>>>>> 615b9ce114946ccb4261eff11e55b6e89fd6faf8
