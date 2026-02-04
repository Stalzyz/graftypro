# Deployment Guide (Railway.app)

This project is a Full-Stack Boilerplate containing:
1.  **Next.js 14 App** (Frontend & API)
2.  **PostgreSQL** (Database)
3.  **Redis** (Queue)
4.  **Worker Script** (Background Job Processor)

## Option 1: Railway (Easiest)

### 1. Initialize Git
Ensure your project is a git repo.
```bash
git init
git add .
git commit -m "Initial commit"
# Push to GitHub
```

### 2. Create Project on Railway
1.  Go to [Railway.app](https://railway.app/).
2.  Click "New Project" -> "Deploy from GitHub repo".
3.  Select your `Wabot_BSP` repo.

### 3. Add Services (Database & Redis)
In the Railway Canvas:
1.  Right click -> Add Service -> **PostgreSQL**.
2.  Right click -> Add Service -> **Redis**.

### 4. Configure Environment Variables
Go to your Next.js Service -> **Variables**:
*   `DATABASE_URL`: `${{PostgreSQL.DATABASE_URL}}` (Auto-fill)
*   `REDIS_HOST`: `${{Redis.HOST}}`
*   `REDIS_PORT`: `${{Redis.PORT}}`
*   `REDIS_PASSWORD`: `${{Redis.PASSWORD}}`
*   `JWT_SECRET`: Generate a random string.
*   `META_APP_ID`: Your Meta App ID.
*   `META_APP_SECRET`: Your Meta App Secret.

### 5. Configure Build & Start Command
The default start command is `next start`. This runs the web app.
**However**, we also need the **Worker** running.

**Strategy for Workers on Railway:**
Add a *second* service pointing to the *same* GitHub repo.
1.  Name it "Worker".
2.  Set Start Command: `npx tsx workers/campaign.ts`
3.  Copy the same Env Vars (Redis/DB).

## Option 2: VPS (Hostinger/DigitalOcean) with Docker

1.  SSH into your server.
2.  Clone the repo.
3.  Run:
    ```bash
    docker-compose up -d --build
    ```
4.  The app will be live on port 3000.
5.  Use Nginx to reverse proxy port 80 -> 3000.

## Post-Deployment
1.  Go to `https://your-app.up.railway.app/dashboard`.
2.  Create an account (Register).
3.  Go to Settings -> WhatsApp -> Connect.
