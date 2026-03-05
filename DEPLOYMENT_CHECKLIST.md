# POST-DEPLOYMENT CHECKLIST

## 🚨 CRITICAL: Update Environment Variables on VPS

After deploying to your VPS, you MUST update the following in your `.env` file on the server:

### 1. Meta WhatsApp Configuration
```bash
META_APP_ID="your_app_id"
META_APP_SECRET="your_app_secret"
NEXT_PUBLIC_META_APP_ID="your_app_id"
NEXT_PUBLIC_META_CONFIG_ID="your_config_id"
```

**Where to get these:**
- Go to https://developers.facebook.com/
- Select your App > Settings > Basic
- Copy App ID and App Secret
- For Config ID: WhatsApp > Getting Started > Embedded Signup

### 2. Razorpay Configuration
```bash
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."
```

### 3. Production Database URL
```bash
DATABASE_URL="postgresql://username:password@your-db-host:5432/grafty_bsp?schema=public"
```

### 4. JWT Secrets (Change These!)
```bash
JWT_SECRET="generate-a-new-random-64-char-string"
ADMIN_JWT_SECRET="generate-another-random-64-char-string"
```

---

## 📋 Deployment Steps

1. Upload files to VPS
2. Run `npm install`
3. Update `.env` with production values (see above)
4. Run `npx prisma db push && npx prisma generate`
5. Run `npx tsx scripts/seed-admin.ts` to create admin user
6. Start app with `npm run build && npm run start`
7. Start worker with `npm run worker`
8. Configure Nginx/Reverse Proxy
9. Set up SSL with Let's Encrypt

---

## 🔗 Meta Webhook Setup (After VPS is Live)

1. Go to Meta App Dashboard > WhatsApp > Configuration
2. Add Webhook URL: `https://your-domain.com/api/whatsapp/webhook`
3. Verify Token: Use value from `META_WEBHOOK_VERIFY_TOKEN` in your .env
4. Subscribe to: `messages`, `message_status`

---

## 🔗 Razorpay Webhook Setup

1. Go to Razorpay Dashboard > Settings > Webhooks
2. Add Webhook URL: `https://your-domain.com/api/finance/razorpay/webhook`
3. Copy the Webhook Secret to `RAZORPAY_WEBHOOK_SECRET`
4. Subscribe to: `payment.captured`, `payment.failed`

---

**Created:** 2026-02-05
**Status:** PENDING
