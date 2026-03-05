# 🚀 CREDIT WALLET - DEVELOPER QUICK START GUIDE

## 📌 Overview
This guide will help you implement the production-grade Credit Wallet system in **4 weeks**.

---

## 🎯 WEEK 1: GST & INVOICE FOUNDATION

### Day 1-2: Database Schema
**Task:** Add new models to Prisma schema

**Files to modify:**
- `prisma/schema.prisma`

**Models to add:**
1. Enhance `VendorWallet` with GST fields
2. Enhance `CreditTransaction` with GST breakdown
3. Add `Invoice` model
4. Add `GSTReport` model
5. Add `AuditLog` model

**Commands:**
```bash
# After updating schema
npx prisma migrate dev --name add_gst_and_invoice_system
npx prisma generate
```

**Verification:**
```bash
# Check models exist
npx prisma studio
```

---

### Day 3-4: GST Service
**Task:** Build GST calculation logic

**Files to create:**
- `lib/finance/gst-service.ts`

**Key Functions:**
```typescript
GSTService.calculateGST(netAmount, customerState)
GSTService.validateGSTIN(gstin)
GSTService.generateMonthlyReport(month, year)
```

**Test:**
```typescript
// Test CGST+SGST (same state)
const result = GSTService.calculateGST(10000, "Karnataka");
expect(result.cgst).toBe(900);
expect(result.sgst).toBe(900);
expect(result.total_amount).toBe(11800);

// Test IGST (different state)
const result2 = GSTService.calculateGST(10000, "Maharashtra");
expect(result2.igst).toBe(1800);
```

---

### Day 5: Invoice Service
**Task:** Build invoice generation

**Files to create:**
- `lib/finance/invoice-service.ts`

**Key Functions:**
```typescript
InvoiceService.generateInvoice(tx, workspaceId, paymentId, netAmount, gstAmount)
InvoiceService.generateInvoiceNumber(year)
InvoiceService.generatePDF(invoiceId)
InvoiceService.sendInvoiceEmail(invoiceId)
```

**Dependencies:**
```bash
npm install pdfkit
npm install nodemailer
```

---

## 🎯 WEEK 2: RECHARGE UI & PAYMENT FLOW

### Day 1-2: Recharge Page
**Task:** Build wallet recharge UI

**Files to create:**
- `app/dashboard/credits/recharge/page.tsx`

**Features:**
- Amount input (₹1000, ₹5000, ₹10000, Custom)
- GST breakdown display
- Billing details form
- Razorpay integration
- Success/failure handling

**UI Components:**
```tsx
<RechargeForm>
  <AmountSelector />
  <GSTBreakdown />
  <BillingDetailsForm />
  <PaymentButton />
</RechargeForm>
```

---

### Day 3: Recharge APIs
**Task:** Build backend APIs

**Files to create:**
- `app/api/credits/recharge/calculate/route.ts`
- `app/api/credits/recharge/initiate/route.ts`

**Endpoints:**
```
POST /api/credits/recharge/calculate
POST /api/credits/recharge/initiate
```

---

### Day 4-5: Enhanced Webhook
**Task:** Add GST & invoice to webhook

**Files to modify:**
- `app/api/webhooks/razorpay/route.ts`

**Changes:**
1. Add idempotency check
2. Extract GST details from payment notes
3. Call InvoiceService.generateInvoice()
4. Send invoice email

**Test:**
```bash
# Simulate webhook
curl -X POST http://localhost:3000/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: xxx" \
  -d @test-webhook.json
```

---

## 🎯 WEEK 3: ATOMIC DEDUCTION & SECURITY

### Day 1-2: Enhanced Credit Service
**Task:** Add row locking & idempotency

**Files to modify:**
- `lib/credits/service.ts`

**New Function:**
```typescript
CreditService.deductCreditsAtomic(
  workspaceId,
  amount,
  messageId,
  metaMessageId,
  category,
  countryCode,
  description
)
```

**Key Features:**
- Row-level locking with `FOR UPDATE`
- Duplicate deduction check
- Meta cost tracking
- Margin calculation

---

### Day 3: Message Sending Integration
**Task:** Integrate atomic deduction with message sending

**Files to modify:**
- `app/api/chats/send/route.ts`
- `app/api/campaigns/send/route.ts`

**Before sending:**
```typescript
// 1. Calculate cost
const cost = await CreditService.getMessageCost(category, countryCode);

// 2. Deduct credits atomically
const result = await CreditService.deductCreditsAtomic(
  workspaceId,
  cost,
  messageId,
  null, // metaMessageId will be updated later
  category,
  countryCode,
  description
);

if (!result.success) {
  throw new Error('Insufficient balance');
}

// 3. Send to Meta
const metaResponse = await sendToMeta(...);

// 4. Update transaction with Meta message ID
await prisma.creditTransaction.update({
  where: { id: result.transaction_id },
  data: { meta_message_id: metaResponse.messages[0].id }
});
```

---

### Day 4-5: Load Testing
**Task:** Test concurrent deductions

**Files to create:**
- `scripts/load-test/concurrent-deductions.ts`

**Test Scenarios:**
1. 1000 concurrent deductions
2. Duplicate webhook handling
3. Race condition prevention
4. Balance consistency check

**Commands:**
```bash
npx tsx scripts/load-test/concurrent-deductions.ts
```

**Success Criteria:**
- Zero negative balances
- Zero duplicate deductions
- 100% ledger-balance match

---

## 🎯 WEEK 4: ADMIN CONTROLS & REPORTS

### Day 1-2: Super Admin Wallet Management
**Task:** Build admin controls

**Files to create:**
- `app/api/super-admin/wallets/[id]/adjust/route.ts`
- `app/api/super-admin/wallets/[id]/freeze/route.ts`
- `app/api/super-admin/wallets/[id]/unfreeze/route.ts`
- `app/super-admin/dashboard/wallets/page.tsx`

**Features:**
- Manual credit adjustment
- Wallet freeze/unfreeze
- View full ledger
- Audit log creation

---

### Day 3: GST Reports
**Task:** Build monthly GST report

**Files to create:**
- `app/api/super-admin/gst-report/route.ts`
- `lib/finance/gst-report-service.ts`

**Features:**
- Aggregate monthly invoices
- Calculate total GST (CGST, SGST, IGST)
- Generate PDF report
- Export to Excel

---

### Day 4: Alerts System
**Task:** Build low balance alerts

**Files to create:**
- `lib/alerts/credit-alerts.ts`
- `workers/credit-alert-worker.ts`

**Triggers:**
- Balance < 1000 credits
- Balance < 500 credits (urgent)
- Failed payment
- Deduction failure

**Channels:**
- Email
- WhatsApp notification
- Dashboard banner

---

### Day 5: Final Testing & Deployment
**Task:** Production deployment

**Checklist:**
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Load tests passing
- [ ] GST calculations verified
- [ ] Invoice PDFs generated correctly
- [ ] Email delivery working
- [ ] Webhook idempotency working
- [ ] Admin controls working
- [ ] Audit logs created
- [ ] Monitoring enabled

**Deploy:**
```bash
# 1. Run migrations on production
npx prisma migrate deploy

# 2. Deploy code
./DEPLOY_AUTO.exp

# 3. Verify
curl https://grafty.pro/api/credits/wallet
```

---

## 📚 REFERENCE DOCUMENTS

1. **Implementation Plan:** `CREDIT_WALLET_IMPLEMENTATION_PLAN.md`
2. **Technical Spec:** `CREDIT_WALLET_TECHNICAL_SPEC.md`
3. **API Documentation:** Generate with Swagger/OpenAPI
4. **Database Schema:** View in Prisma Studio

---

## 🧪 TESTING COMMANDS

```bash
# Unit tests
npm test lib/finance/gst-service.test.ts
npm test lib/credits/service.test.ts

# Integration tests
npm test tests/integration/recharge-flow.test.ts
npm test tests/integration/deduction-flow.test.ts

# Load tests
npx tsx scripts/load-test/concurrent-deductions.ts
npx tsx scripts/load-test/webhook-replay.ts

# E2E tests
npm run test:e2e
```

---

## 🐛 DEBUGGING TIPS

### Issue: Negative Balance
**Check:**
```sql
SELECT * FROM vendor_wallets WHERE current_balance < 0;
```

**Fix:**
- Review transaction isolation level
- Check for race conditions
- Verify row locking

---

### Issue: Duplicate Deductions
**Check:**
```sql
SELECT related_message_id, COUNT(*) 
FROM credit_transactions 
WHERE type = 'DEDUCTION' 
GROUP BY related_message_id 
HAVING COUNT(*) > 1;
```

**Fix:**
- Verify unique constraint on `related_message_id`
- Check idempotency logic

---

### Issue: GST Calculation Wrong
**Check:**
```typescript
const result = GSTService.calculateGST(10000, "Karnataka");
console.log(result);
```

**Expected:**
```json
{
  "net_amount": 10000,
  "cgst": 900,
  "sgst": 900,
  "igst": 0,
  "gst_total": 1800,
  "total_amount": 11800
}
```

---

### Issue: Invoice Not Generated
**Check:**
1. Webhook received?
2. Payment ID in database?
3. Invoice record created?
4. PDF generation error?

**Debug:**
```bash
# Check webhook logs
docker compose -f docker-compose.prod.yml logs -f web | grep webhook

# Check invoice table
npx prisma studio
```

---

## 📞 SUPPORT

**Questions?**
- Check technical spec: `CREDIT_WALLET_TECHNICAL_SPEC.md`
- Review implementation plan: `CREDIT_WALLET_IMPLEMENTATION_PLAN.md`
- Check existing code: `lib/credits/service.ts`

**Issues?**
- Create GitHub issue
- Tag: `credit-wallet`, `gst`, `invoice`

---

## ✅ DEFINITION OF DONE

A feature is complete when:
- [ ] Code written & tested
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Load tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] QA approved
- [ ] Deployed to production
- [ ] Monitoring enabled

---

**Happy Coding! 🚀**

*This is a production-grade financial system. Take your time. Test thoroughly.*
