# 💳 CREDIT WALLET MODULE - TECHNICAL SPECIFICATION
## Meta-Connected, GST Enabled, Usage-Based Deduction Engine

---

## 📖 TABLE OF CONTENTS
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Specifications](#api-specifications)
5. [Business Logic](#business-logic)
6. [Security Requirements](#security-requirements)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Guide](#deployment-guide)

---

## 1. SYSTEM OVERVIEW

### 1.1 Objective
Build a production-grade credit wallet system that:
- Handles vendor recharges with GST compliance
- Deducts credits atomically for WhatsApp messages
- Reconciles with Meta billing
- Maintains immutable audit trail
- Prevents negative balances and double deductions

### 1.2 Key Features
✅ GST-compliant invoicing (18% GST for India)
✅ Atomic credit deduction with row-level locking
✅ Idempotent webhook processing
✅ Meta billing reconciliation
✅ Super admin wallet controls
✅ Real-time balance alerts
✅ Comprehensive audit logging

### 1.3 Non-Functional Requirements
- **Atomicity:** All transactions must be ACID-compliant
- **Idempotency:** Duplicate webhooks must not create duplicate credits
- **Scalability:** Handle 10,000+ concurrent deductions
- **Auditability:** Every transaction must be traceable
- **Security:** No client-side balance manipulation

---

## 2. ARCHITECTURE

### 2.1 System Components

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Recharge   │  │   Wallet     │  │  Transaction │  │
│  │     Page     │  │  Dashboard   │  │   History    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                      API LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Recharge   │  │   Deduction  │  │    Wallet    │  │
│  │     API      │  │     API      │  │     API      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │     GST      │  │    Credit    │  │   Invoice    │  │
│  │   Service    │  │   Service    │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Pricing    │  │Reconciliation│  │    Alert     │  │
│  │   Service    │  │   Service    │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ VendorWallet │  │    Credit    │  │   Invoice    │  │
│  │    Model     │  │ Transaction  │  │    Model     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL INTEGRATIONS                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Razorpay   │  │  Meta Graph  │  │    Email     │  │
│  │   Webhooks   │  │     API      │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

#### Recharge Flow
```
User → Recharge Page → Calculate GST → Razorpay Payment
  → Webhook → Verify Signature → Check Idempotency
  → Add Credits (Atomic) → Create Ledger Entry
  → Generate Invoice → Send Email → Update UI
```

#### Deduction Flow
```
Send Message → Calculate Cost → Check Balance
  → Lock Wallet Row → Deduct Credits (Atomic)
  → Create Ledger Entry → Update Reseller Commission
  → Send to Meta → Store Meta Message ID → Release Lock
```

---

## 3. DATABASE SCHEMA

### 3.1 Core Models

#### VendorWallet (Enhanced)
```prisma
model VendorWallet {
  id                 String   @id @default(uuid())
  workspace_id       String   @unique
  
  // Balances
  current_balance    Decimal  @default(0.00)
  locked_balance     Decimal  @default(0.00)  // Credits locked during sends
  total_purchased    Decimal  @default(0.00)
  total_used         Decimal  @default(0.00)
  
  // GST Details
  gst_registered     Boolean  @default(false)
  gstin              String?  @db.VarChar(15)
  billing_name       String?
  billing_address    String?  @db.Text
  billing_state      String?
  billing_pincode    String?  @db.VarChar(6)
  
  // Security
  is_frozen          Boolean  @default(false)
  freeze_reason      String?
  frozen_at          DateTime?
  frozen_by          String?  // Admin ID
  
  // Metadata
  created_at         DateTime @default(now())
  updated_at         DateTime @updatedAt
  
  // Relations
  workspace          Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  ledger_entries     CreditTransaction[]
  invoices           Invoice[]
  
  @@index([workspace_id])
  @@map("vendor_wallets")
}
```

#### CreditTransaction (Enhanced)
```prisma
model CreditTransaction {
  id                   String   @id @default(uuid())
  workspace_id         String
  wallet_id            String
  
  // Transaction Details
  type                 String   // PURCHASE, DEDUCTION, REFUND, ADJUSTMENT
  amount               Decimal  // Can be negative for deductions
  
  // Balance Snapshots (Critical for audit)
  balance_before       Decimal
  balance_after        Decimal
  
  // GST Breakdown (for PURCHASE type)
  net_amount           Decimal  @default(0.00)
  gst_amount           Decimal  @default(0.00)
  cgst_amount          Decimal  @default(0.00)
  sgst_amount          Decimal  @default(0.00)
  igst_amount          Decimal  @default(0.00)
  total_amount         Decimal  @default(0.00)
  
  // References
  related_payment_id   String?  @unique  // Razorpay payment_id (for idempotency)
  related_message_id   String?  @unique  // WhatsApp message_id (for idempotency)
  meta_message_id      String?           // Meta's message ID
  invoice_id           String?
  
  // Message Details (for DEDUCTION type)
  message_category     String?  // MARKETING, UTILITY, AUTH, SERVICE
  country_code         String?
  meta_cost            Decimal  @default(0.00)
  our_charge           Decimal  @default(0.00)
  margin               Decimal  @default(0.00)
  
  // Metadata
  description          String
  initiated_by         String?  // User ID or SYSTEM
  ip_address           String?
  user_agent           String?
  
  // Status
  status               String   @default("COMPLETED")  // COMPLETED, FAILED, REVERSED
  failure_reason       String?
  
  // Timestamps
  created_at           DateTime @default(now())
  reversed_at          DateTime?
  
  // Relations
  wallet               VendorWallet @relation(fields: [wallet_id], references: [id])
  invoice              Invoice? @relation(fields: [invoice_id], references: [id])
  
  @@index([workspace_id])
  @@index([type])
  @@index([created_at])
  @@index([related_payment_id])
  @@index([related_message_id])
  @@map("credit_transactions")
}
```

#### Invoice (New)
```prisma
model Invoice {
  id                 String   @id @default(uuid())
  invoice_number     String   @unique  // INV-2024-0001
  workspace_id       String
  
  // Financial Details
  net_amount         Decimal
  gst_amount         Decimal
  cgst_amount        Decimal  @default(0.00)
  sgst_amount        Decimal  @default(0.00)
  igst_amount        Decimal  @default(0.00)
  total_amount       Decimal
  
  // Billing Details (Customer)
  billing_name       String
  billing_address    String   @db.Text
  billing_gstin      String?
  billing_state      String
  billing_pincode    String
  billing_email      String?
  billing_phone      String?
  
  // Company Details (Our Company)
  company_name       String   @default("Your Company Pvt Ltd")
  company_gstin      String   @default("29XXXXX1234X1ZX")
  company_address    String   @db.Text
  company_state      String   @default("Karnataka")
  company_pincode    String   @default("560001")
  
  // Payment Details
  payment_method     String   @default("Razorpay")
  payment_id         String?
  payment_status     String   @default("PAID")  // PAID, PENDING, FAILED
  
  // Invoice Status
  status             String   @default("ACTIVE")  // ACTIVE, CANCELLED
  cancelled_reason   String?
  cancelled_at       DateTime?
  
  // PDF Storage
  pdf_url            String?
  pdf_generated_at   DateTime?
  
  // Email Status
  email_sent         Boolean  @default(false)
  email_sent_at      DateTime?
  
  // Metadata
  notes              String?  @db.Text
  created_at         DateTime @default(now())
  updated_at         DateTime @updatedAt
  
  // Relations
  workspace          Workspace @relation(fields: [workspace_id], references: [id])
  transactions       CreditTransaction[]
  
  @@index([workspace_id])
  @@index([invoice_number])
  @@index([created_at])
  @@map("invoices")
}
```

#### GSTReport (New)
```prisma
model GSTReport {
  id                 String   @id @default(uuid())
  
  // Period
  month              Int      // 1-12
  year               Int      // 2024
  
  // Aggregated Amounts
  total_sales        Decimal  @default(0.00)  // Sum of all net amounts
  total_gst          Decimal  @default(0.00)  // Sum of all GST
  total_cgst         Decimal  @default(0.00)
  total_sgst         Decimal  @default(0.00)
  total_igst         Decimal  @default(0.00)
  
  // Statistics
  invoice_count      Int      @default(0)
  transaction_count  Int      @default(0)
  
  // Report Status
  status             String   @default("DRAFT")  // DRAFT, FINALIZED
  finalized_at       DateTime?
  
  // PDF Export
  pdf_url            String?
  
  // Metadata
  generated_at       DateTime @default(now())
  generated_by       String?  // Admin ID
  notes              String?  @db.Text
  
  @@unique([month, year])
  @@map("gst_reports")
}
```

#### AuditLog (New)
```prisma
model AuditLog {
  id                 String   @id @default(uuid())
  
  // Actor
  admin_id           String
  admin_email        String
  
  // Action
  action_type        String   // ADJUST_CREDITS, FREEZE_WALLET, REFUND, etc.
  target_type        String   // WALLET, TRANSACTION, INVOICE
  target_id          String
  target_workspace   String?
  
  // Changes
  before_value       Json?
  after_value        Json?
  
  // Reason & Context
  reason             String   @db.Text
  ip_address         String?
  user_agent         String?
  
  // Metadata
  created_at         DateTime @default(now())
  
  @@index([admin_id])
  @@index([target_workspace])
  @@index([action_type])
  @@index([created_at])
  @@map("audit_logs")
}
```

---

## 4. API SPECIFICATIONS

### 4.1 Recharge APIs

#### POST /api/credits/recharge/calculate
**Purpose:** Calculate GST and total amount before payment

**Request:**
```json
{
  "amount": 10000
}
```

**Response:**
```json
{
  "success": true,
  "calculation": {
    "net_amount": 10000,
    "gst_rate": 0.18,
    "cgst": 900,
    "sgst": 900,
    "igst": 0,
    "gst_total": 1800,
    "total_amount": 11800
  }
}
```

#### POST /api/credits/recharge/initiate
**Purpose:** Create Razorpay order for recharge

**Request:**
```json
{
  "amount": 10000,
  "billing_details": {
    "name": "John Doe",
    "address": "123 Main St",
    "state": "Karnataka",
    "pincode": "560001",
    "gstin": "29XXXXX1234X1ZX"  // Optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "order_xxx",
  "amount": 11800,
  "currency": "INR",
  "razorpay_key": "rzp_live_xxx"
}
```

### 4.2 Wallet APIs

#### GET /api/credits/wallet
**Purpose:** Get wallet balance and recent transactions

**Response:**
```json
{
  "success": true,
  "wallet": {
    "current_balance": 5000,
    "locked_balance": 100,
    "total_purchased": 50000,
    "total_used": 45000,
    "is_frozen": false,
    "gst_registered": true,
    "gstin": "29XXXXX1234X1ZX"
  },
  "transactions": [...]
}
```

#### POST /api/credits/deduct
**Purpose:** Deduct credits for message sending (Internal API)

**Request:**
```json
{
  "workspace_id": "ws_xxx",
  "amount": 1.5,
  "message_id": "msg_xxx",
  "meta_message_id": "wamid.xxx",
  "category": "MARKETING",
  "country_code": "91",
  "description": "Marketing message to +91XXXXXXXXXX"
}
```

**Response:**
```json
{
  "success": true,
  "balance_after": 4998.5,
  "transaction_id": "tx_xxx"
}
```

### 4.3 Invoice APIs

#### GET /api/invoices
**Purpose:** List all invoices

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional: ACTIVE, CANCELLED)

**Response:**
```json
{
  "success": true,
  "invoices": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

#### GET /api/invoices/[id]
**Purpose:** Get invoice details

**Response:**
```json
{
  "success": true,
  "invoice": {
    "invoice_number": "INV-2024-0001",
    "net_amount": 10000,
    "gst_amount": 1800,
    "total_amount": 11800,
    "billing_name": "John Doe",
    "pdf_url": "/invoices/INV-2024-0001.pdf",
    ...
  }
}
```

#### GET /api/invoices/[id]/download
**Purpose:** Download invoice PDF

**Response:** PDF file

### 4.4 Super Admin APIs

#### POST /api/super-admin/wallets/[id]/adjust
**Purpose:** Manually adjust wallet balance

**Request:**
```json
{
  "amount": 1000,
  "type": "ADD",  // ADD or DEDUCT
  "reason": "Compensation for service downtime"
}
```

**Response:**
```json
{
  "success": true,
  "balance_after": 6000,
  "audit_log_id": "audit_xxx"
}
```

#### POST /api/super-admin/wallets/[id]/freeze
**Purpose:** Freeze wallet

**Request:**
```json
{
  "reason": "Suspicious activity detected"
}
```

#### POST /api/super-admin/wallets/[id]/unfreeze
**Purpose:** Unfreeze wallet

#### GET /api/super-admin/gst-report
**Purpose:** Generate monthly GST report

**Query Params:**
- `month` (1-12)
- `year` (2024)

**Response:**
```json
{
  "success": true,
  "report": {
    "month": 1,
    "year": 2024,
    "total_sales": 1000000,
    "total_gst": 180000,
    "invoice_count": 150,
    "pdf_url": "/reports/GST-2024-01.pdf"
  }
}
```

---

## 5. BUSINESS LOGIC

### 5.1 GST Calculation

```typescript
// lib/finance/gst-service.ts
export class GSTService {
  static readonly GST_RATE = 0.18;
  static readonly CGST_RATE = 0.09;
  static readonly SGST_RATE = 0.09;
  static readonly IGST_RATE = 0.18;
  
  static readonly COMPANY_STATE = "Karnataka";
  
  static calculateGST(netAmount: number, customerState: string) {
    const isSameState = customerState === this.COMPANY_STATE;
    const gstAmount = netAmount * this.GST_RATE;
    
    if (isSameState) {
      // Intra-state: CGST + SGST
      return {
        net_amount: netAmount,
        cgst: netAmount * this.CGST_RATE,
        sgst: netAmount * this.SGST_RATE,
        igst: 0,
        gst_total: gstAmount,
        total_amount: netAmount + gstAmount
      };
    } else {
      // Inter-state: IGST
      return {
        net_amount: netAmount,
        cgst: 0,
        sgst: 0,
        igst: netAmount * this.IGST_RATE,
        gst_total: gstAmount,
        total_amount: netAmount + gstAmount
      };
    }
  }
}
```

### 5.2 Atomic Credit Deduction

```typescript
// lib/credits/service.ts (Enhanced)
export class CreditService {
  static async deductCreditsAtomic(
    workspaceId: string,
    amount: number,
    messageId: string,
    metaMessageId: string,
    category: string,
    countryCode: string,
    description: string
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Row-level lock
      await tx.$executeRaw`
        SELECT * FROM vendor_wallets 
        WHERE workspace_id = ${workspaceId} 
        FOR UPDATE
      `;
      
      // 2. Check for duplicate deduction (idempotency)
      const existing = await tx.creditTransaction.findFirst({
        where: {
          related_message_id: messageId,
          type: 'DEDUCTION'
        }
      });
      
      if (existing) {
        console.log(`Duplicate deduction prevented: ${messageId}`);
        return {
          success: false,
          error: 'DUPLICATE_DEDUCTION',
          transaction_id: existing.id
        };
      }
      
      // 3. Get wallet
      const wallet = await tx.vendorWallet.findUnique({
        where: { workspace_id: workspaceId }
      });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      if (wallet.is_frozen) {
        throw new Error(`Wallet frozen: ${wallet.freeze_reason}`);
      }
      
      const currentBalance = Number(wallet.current_balance);
      
      if (currentBalance < amount) {
        throw new Error('Insufficient balance');
      }
      
      // 4. Calculate pricing breakdown
      const metaCost = await this.getMetaCost(category, countryCode);
      const ourCharge = amount;
      const margin = ourCharge - metaCost;
      
      // 5. Update wallet
      const balanceAfter = currentBalance - amount;
      
      await tx.vendorWallet.update({
        where: { id: wallet.id },
        data: {
          current_balance: { decrement: amount },
          total_used: { increment: amount }
        }
      });
      
      // 6. Create ledger entry
      const transaction = await tx.creditTransaction.create({
        data: {
          workspace_id: workspaceId,
          wallet_id: wallet.id,
          type: 'DEDUCTION',
          amount: -amount,
          balance_before: currentBalance,
          balance_after: balanceAfter,
          related_message_id: messageId,
          meta_message_id: metaMessageId,
          message_category: category,
          country_code: countryCode,
          meta_cost: metaCost,
          our_charge: ourCharge,
          margin: margin,
          description: description,
          status: 'COMPLETED'
        }
      });
      
      // 7. Process reseller commission
      try {
        const { ResellerService } = require('@/lib/reseller/service');
        await ResellerService.processUsageCommission(
          tx,
          workspaceId,
          amount,
          messageId
        );
      } catch (err) {
        console.error('Reseller commission error:', err);
      }
      
      return {
        success: true,
        balance_after: balanceAfter,
        transaction_id: transaction.id
      };
      
    }, {
      isolationLevel: 'Serializable',
      timeout: 10000
    });
  }
}
```

### 5.3 Webhook Idempotency

```typescript
// app/api/webhooks/razorpay/route.ts
export async function POST(req: Request) {
  try {
    // 1. Verify signature
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    
    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    const payload = JSON.parse(body);
    const payment = payload.payload.payment.entity;
    
    // 2. Check idempotency
    const existing = await prisma.creditTransaction.findFirst({
      where: {
        related_payment_id: payment.id,
        type: 'PURCHASE'
      }
    });
    
    if (existing) {
      console.log(`Duplicate webhook: ${payment.id}`);
      return NextResponse.json({ 
        status: 'already_processed',
        transaction_id: existing.id 
      });
    }
    
    // 3. Process payment
    const workspaceId = payment.notes?.workspaceId;
    const netAmount = parseInt(payment.notes?.netAmount || "0");
    const gstAmount = parseInt(payment.notes?.gstAmount || "0");
    
    if (!workspaceId || netAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 });
    }
    
    // 4. Add credits atomically
    await prisma.$transaction(async (tx) => {
      const { CreditService } = await import('@/lib/credits/service');
      
      await CreditService.addCredits(
        tx,
        workspaceId,
        netAmount,  // Credits = net amount (before GST)
        payment.id,
        `Razorpay Payment: ${payment.id}`
      );
      
      // 5. Generate invoice
      const { InvoiceService } = await import('@/lib/finance/invoice-service');
      
      await InvoiceService.generateInvoice(
        tx,
        workspaceId,
        payment.id,
        netAmount,
        gstAmount
      );
    });
    
    return NextResponse.json({ status: 'success' });
    
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 6. SECURITY REQUIREMENTS

### 6.1 Authentication & Authorization
- All wallet APIs require JWT authentication
- Super admin APIs require admin role verification
- Webhook endpoints require signature verification

### 6.2 Data Protection
- No client-side balance manipulation
- All deductions must go through server-side API
- Pricing logic not exposed to client
- Audit logs are immutable (no DELETE allowed)

### 6.3 Idempotency
- Use `related_payment_id` for webhook idempotency
- Use `related_message_id` for deduction idempotency
- Unique constraints on these fields

### 6.4 Rate Limiting
- Recharge API: 10 requests/minute per user
- Deduction API: 1000 requests/minute per workspace
- Webhook API: No limit (but signature verified)

---

## 7. TESTING STRATEGY

### 7.1 Unit Tests
```typescript
describe('CreditService', () => {
  it('should prevent negative balance', async () => {
    // Test
  });
  
  it('should prevent duplicate deduction', async () => {
    // Test
  });
  
  it('should calculate GST correctly', async () => {
    // Test
  });
});
```

### 7.2 Integration Tests
```typescript
describe('Recharge Flow', () => {
  it('should complete full recharge with invoice', async () => {
    // 1. Calculate GST
    // 2. Create Razorpay order
    // 3. Simulate webhook
    // 4. Verify credits added
    // 5. Verify invoice generated
  });
});
```

### 7.3 Load Tests
- 1000 concurrent deductions
- Verify no race conditions
- Verify no duplicate deductions
- Verify balance consistency

---

## 8. DEPLOYMENT GUIDE

### 8.1 Database Migration
```bash
# 1. Add new models
npx prisma migrate dev --name add_invoice_and_gst

# 2. Generate Prisma client
npx prisma generate

# 3. Seed default pricing
npx tsx scripts/seed-pricing.ts
```

### 8.2 Environment Variables
```env
# GST Configuration
COMPANY_NAME="Your Company Pvt Ltd"
COMPANY_GSTIN="29XXXXX1234X1ZX"
COMPANY_ADDRESS="123 Main St, Bangalore"
COMPANY_STATE="Karnataka"
COMPANY_PINCODE="560001"

# Razorpay
RAZORPAY_KEY_ID="rzp_live_xxx"
RAZORPAY_KEY_SECRET="xxx"
RAZORPAY_WEBHOOK_SECRET="xxx"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourcompany.com"
SMTP_PASS="xxx"
```

### 8.3 Deployment Checklist
- [ ] Database migrated
- [ ] Environment variables set
- [ ] Razorpay webhook configured
- [ ] Email service tested
- [ ] Invoice template uploaded
- [ ] GST details verified
- [ ] Load testing completed
- [ ] Monitoring enabled

---

**END OF TECHNICAL SPECIFICATION**

*Version: 1.0*
*Last Updated: 2026-02-10*
*Status: READY FOR IMPLEMENTATION*
