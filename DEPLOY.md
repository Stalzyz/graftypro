# Deployment Guide

This project consists of:
1.  **Next.js 14 App** (Web & API)
2.  **PostgreSQL** (Database)
3.  **Redis** (Queue)
4.  **Worker** (Background Processing)

---

## Recommended: VPS Deployment (Docker)

This is the most stable way to run Grafty BSP on a VPS (Ubuntu/Debian).

### 1. Prerequisite Setup on VPS
SSH into your VPS and run the setup script to install Docker, Nginx, and other dependencies:
```bash
# On your local machine, upload the files
scp -r . root@your-vps-ip:~/grafty_bsp

# SSH into VPS
ssh root@your-vps-ip
cd ~/grafty_bsp

# Run setup
chmod +x setup-vps.sh deploy.sh
./setup-vps.sh
```

### 2. Configure Environment
Copy the example environment file and fill in your production values:
```bash
cp .env.example .env
nano .env
```
*   **Database**: Set a strong `POSTGRES_PASSWORD`.
*   **Auth**: Set unique `JWT_SECRET` and `ADMIN_JWT_SECRET`.
*   **Meta**: Enter your `META_APP_ID`, `META_APP_SECRET`, and `NEXT_PUBLIC` values.
*   **Security**: Generate an `ENCRYPTION_KEY` (`openssl rand -hex 32`).

### 3. Deploy
Launch the production environment:
```bash
./deploy.sh
```
This script will:
- Build Docker images.
- Start all services (Web, DB, Redis, Worker).
- Sync the Database schema (`prisma db push`).
- Seed your Admin Account.

### 4. Domain & SSL (Nginx)
1. Copy the Nginx config:
   ```bash
   sudo cp nginx.conf.example /etc/nginx/sites-available/grafty
   sudo ln -s /etc/nginx/sites-available/grafty /etc/nginx/sites-enabled/
   sudo nano /etc/nginx/sites-available/grafty # Update your-domain.com
   sudo nginx -t && sudo systemctl restart nginx
   ```
2. Setup SSL with Certbot:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---

## Alternative: Railway (PaaS)

1.  **New Project** > **Deploy from GitHub**.
2.  **Add PostgreSQL** and **Redis** services.
3.  **Variables**: Copy keys from `.env.example`.
4.  **Worker**: Add a second service from the same repo with Start Command: `npx tsx worker.ts`.

---

## Post-Deployment Checklist
1.  **Register**: Go to `https://your-domain.com/register` and create your account.
2.  **Meta Webhook**: 
    - URL: `https://your-domain.com/api/whatsapp/webhook`
    - Verify Token: Same as in your `.env`.
3.  **Finance**: Connect Razorpay in Settings > Payments.
