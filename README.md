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
```bash
cd backend
npm run dev
```

### 7. Start frontend
```bash
cd frontend
npm run dev
```

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
