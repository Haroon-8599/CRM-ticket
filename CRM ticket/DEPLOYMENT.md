# Deployment Guide — Datastraw Support Ticketing CRM

This guide provides step-by-step instructions for deploying the CRM application to production across popular hosting platforms.

---

## 📋 Prerequisites & Architecture

- **Node.js Requirement**: **Node.js 22+** is required on the host environment (the database relies on the native `node:sqlite` module).
- **Single-Service Architecture**: The Node.js Express backend serves both the `/api/*` REST endpoints and the static compiled React frontend from `client/dist`.

---

## 🚀 Option 1: Render.com (Recommended)

### Method A: Blueprint Deployment (Easiest)

1. Push your repository to GitHub / GitLab.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Connect your repository. Render will automatically detect `render.yaml` and configure the service.
5. Click **Apply**.

### Method B: Manual Web Service Setup

1. On Render, click **New +** → **Web Service**.
2. Select your repository.
3. Configure the settings:
   - **Environment**: `Node`
   - **Node Version**: `22` (or set env var `PYTHON_VERSION` / standard Node 22)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
5. Click **Create Web Service**.

---

## 🐳 Option 2: Docker Container (AWS / GCP / DigitalOcean / Fly.io)

### 1. Build Docker Image

```bash
docker build -t datastraw-crm:latest .
```

### 2. Run Docker Container Locally or on Server

```bash
docker run -d \
  --name crm-app \
  -p 3001:3001 \
  -v crm-data:/app/server/data \
  datastraw-crm:latest
```

> **Note**: Mounting a volume to `/app/server/data` ensures your SQLite database persists across container restarts.

---

## 🚂 Option 3: Railway / Fly.io

### Railway
1. Create a new project on [Railway](https://railway.app/).
2. Select **Deploy from GitHub repo**.
3. Railway will use root `package.json` to build (`npm run build`) and start (`npm start`).
4. Set environment variable: `NODE_ENV=production`.

### Fly.io
1. Install `flyctl` CLI and run:
   ```bash
   fly launch
   ```
2. Choose a region and deploy using the included `Dockerfile`.

---

## ⚙️ Environment Variables Reference

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | Set to `production` in production environments |
| `PORT` | `3001` | HTTP server port |
| `DB_PATH` | `./data/crm.sqlite` | Path to SQLite database file |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin (if frontend hosted on separate domain) |

---

## 🔍 Health Check & Verification

Once deployed, verify your service:

- **Health Endpoint**: `https://<your-domain>/api/health`
  - Returns `{"status":"ok","timestamp":"..."}`
- **API Endpoint**: `https://<your-domain>/api/tickets`
  - Returns sample ticket data
- **Frontend App**: `https://<your-domain>/`
  - Renders React CRM dashboard
