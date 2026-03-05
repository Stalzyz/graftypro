# 💳 CREDIT WALLET MODULE - PRODUCTION IMPLEMENTATION PLAN

## 📋 CURRENT STATUS ASSESSMENT

### ✅ What We Already Have (Foundation)
1. **VendorWallet Model** - Basic wallet structure
2. **CreditTransaction Model** - Ledger system
3. **CreditService** - Atomic add/deduct operations
4. **Webhook Integration** - Razorpay payment processing
5. **Credits Dashboard** - User-facing wallet view
6. **Transaction History** - Basic ledger display

### ❌ What's Missing (Critical Gaps)
1. **GST Handling** - No GST calculation or storage
2. **Invoice Generation** - No automated invoicing
3. **Recharge UI** - No wallet top-up interface
4. **Pricing Engine** - Incomplete Meta billing reconciliation
5. **Admin Controls** - Limited super admin wallet management
6. **Audit Logs** - No immutable audit trail
7. **Alerts System** - No low balance/failure notifications
8. **Idempotency** - Webhook replay protection needed
9. **Rate Plans** - No dynamic pricing per vendor
10. **GST Reports** - No monthly GST export

---

## 🏗️ IMPLEMENTATION ROADMAP

### **PHASE 1: GST & Invoice System** (Priority: CRITICAL)
**Timeline:** 2-3 days

#### 1.1 Database Schema Updates
```prisma
model VendorWallet {
  // ... existing fields ...
  gst_registered     Boolean  @default(false)
  gstin              String?  // GST Identification Number
  billing_name       String?
  billing_address    String?
  billing_state      String?
  billing_pincode    String?
}

model CreditTransaction {
  // ... existing fields ...
  gst_amount         Decimal  @default(0.00)
  net_amount         Decimal  // Amount before GST
  total_amount       Decimal  // Amount after GST
  invoice_id         String?
  invoice            Invoice? @relation(...)
}

model Invoice {
  id                 String   @id @default(uuid())
  invoice_number     String   @unique // INV-2024-001
  workspace_id       String
  transaction_id     String?
  
  // Amounts
  net_amount         Decimal
  gst_amount         Decimal  // 18% of net
  total_amount       Decimal
  
  // GST Details
  cgst_amount        Decimal  @default(0.00) // 9%
  sgst_amount        Decimal  @default(0.00) // 9%
  igst_amount        Decimal  @default(0.00) // 18%
  
  // Billing Details
  billing_name       String
  billing_address    String
  billing_gstin      String?
  billing_state      String
  billing_pincode    String
  
  // Company Details
  company_name       String   @default("Your Company Name")
  company_gstin      String   @default("YOUR_GSTIN")
  company_address    String
  
  // Status
  status             String   @default("PAID") // PAID, CANCELLED
  payment_method     String   @default("Razorpay")
  payment_id         String?
  
  // Metadata
  created_at         DateTime @default(now())
  updated_at         DateTime @updatedAt
  
  workspace          Workspace @relation(...)
  transaction        CreditTransaction? @relation(...)
  
  @@map("invoices")
}

model GSTReport {
  id                 String   @id @default(uuid())
  month              Int      // 1-12
  year               Int      // 2024
  
  total_sales        Decimal  @default(0.00)
  total_gst          Decimal  @default(0.00)
  total_cgst         Decimal  @default(0.00)
  total_sgst         Decimal  @default(0.00)
  total_igst         Decimal  @default(0.00)
  
  invoice_count      Int      @default(0)
  
  generated_at       DateTime @default(now())
  generated_by       String?  // Admin ID
  
  @@unique([month, year])
  @@map("gst_reports")
}
```

#### 1.2 GST Calculation Service
**File:** `lib/finance/gst-service.ts`

```typescript
export class GSTService {
  static readonly GST_RATE = 0.18; // 18%
  static readonly CGST_RATE = 0.09; // 9%
  static readonly SGST_RATE = 0.09; // 9%
  static readonly IGST_RATE = 0.18; // 18%
  
  static calculateGST(netAmount: number, isSameState: boolean = true) {
    const gstAmount = netAmount * this.GST_RATE;
    
    if (isSameState) {
      return {
        net_amount: netAmount,
        cgst: netAmount * this.CGST_RATE,
        sgst: netAmount * this.SGST_RATE,
        igst: 0,
        gst_total: gstAmount,
        total_amount: netAmount + gstAmount
      };
    } else {
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
  
  static async generateMonthlyReport(month: number, year: number) {
    // Aggregate all invoices for the month
    // Generate GST report
  }
}
```

#### 1.3 Invoice Generation Service
**File:** `lib/finance/invoice-service.ts`

```typescript
export class InvoiceService {
  static async generateInvoice(
    workspaceId: string,
    transactionId: string,
    netAmount: number,
    gstDetails: any
  ) {
    // 1. Get workspace billing details
    // 2. Generate invoice number (INV-2024-XXXX)
    // 3. Create invoice record
    // 4. Generate PDF
    // 5. Send email
    // 6. Return invoice
  }
  
  static async generateInvoiceNumber(year: number) {
    // Format: INV-2024-0001
    const count = await prisma.invoice.count({
      where: {
        created_at: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`)
        }
      }
    });
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}
```

#### 1.4 Recharge UI with GST
**File:** `app/dashboard/credits/recharge/page.tsx`

Features:
- Amount input
- GST breakdown display
- Total payable amount
- Billing details form (if not filled)
- Razorpay integration
- Invoice preview

---

### **PHASE 2: Atomic Deduction & Idempotency** (Priority: CRITICAL)
**Timeline:** 2 days

#### 2.1 Enhanced CreditService with Row Locking
```typescript
static async deductCreditsAtomic(
  workspaceId: string,
  amount: number,
  messageId: string,
  description: string,
  metaMessageId?: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Row-level lock using raw SQL
    await tx.$executeRaw`
      SELECT * FROM vendor_wallets 
      WHERE workspace_id = ${workspaceId} 
      FOR UPDATE
    `;
    
    // 2. Check for duplicate deduction
    const existing = await tx.creditTransaction.findFirst({
      where: {
        related_message_id: messageId,
        type: 'DEDUCTION'
      }
    });
    
    if (existing) {
      throw new Error('DUPLICATE_DEDUCTION');
    }
    
    // 3. Proceed with deduction
    return await this.deductCredits(
      tx,
      workspaceId,
      amount,
      messageId,
      description
    );
  }, {
    isolationLevel: 'Serializable',
    timeout: 10000
  });
}
```

#### 2.2 Webhook Idempotency
**File:** `app/api/webhooks/razorpay/route.ts`

```typescript
// Add idempotency check
const existingTransaction = await prisma.creditTransaction.findFirst({
  where: {
    related_payment_id: payment.id,
    type: 'PURCHASE'
  }
});

if (existingTransaction) {
  console.log(`Duplicate webhook for payment: ${payment.id}`);
  return NextResponse.json({ status: 'already_processed' });
}
```

---

### **PHASE 3: Pricing Engine & Meta Reconciliation** (Priority: HIGH)
**Timeline:** 3 days

#### 3.1 Enhanced Pricing Model
```prisma
model CreditPricing {
  // ... existing ...
  effective_from     DateTime @default(now())
  effective_to       DateTime?
  is_active          Boolean  @default(true)
  
  // Vendor-specific overrides
  vendor_overrides   VendorPricing[]
}

model VendorPricing {
  id                 String   @id @default(uuid())
  workspace_id       String
  message_type       String
  country_code       String
  
  custom_price       Decimal
  markup_percentage  Decimal  @default(0.00)
  
  workspace          Workspace @relation(...)
  
  @@unique([workspace_id, message_type, country_code])
}

model MetaBillingRecord {
  id                 String   @id @default(uuid())
  workspace_id       String
  meta_conversation_id String
  
  category           String   // MARKETING, UTILITY, etc.
  country_code       String
  
  meta_cost          Decimal  // What Meta charged
  our_charge         Decimal  // What we charged
  margin             Decimal  // Profit
  
  billed_at          DateTime
  reconciled         Boolean  @default(false)
  discrepancy        Decimal  @default(0.00)
  
  @@map("meta_billing_records")
}
```

#### 3.2 Reconciliation Service
**File:** `lib/finance/reconciliation-service.ts`

```typescript
export class ReconciliationService {
  static async reconcileMetaBilling(month: number, year: number) {
    // 1. Fetch Meta billing data
    // 2. Compare with our deductions
    // 3. Flag discrepancies
    // 4. Generate report
  }
}
```

---

### **PHASE 4: Super Admin Controls** (Priority: HIGH)
**Timeline:** 2 days

#### 4.1 Admin Wallet Management API
**File:** `app/api/super-admin/wallets/[id]/route.ts`

Features:
- Manual credit adjustment
- Wallet freeze/unfreeze
- Refund processing
- Rate plan override
- View full ledger

#### 4.2 Audit Log System
```prisma
model AuditLog {
  id                 String   @id @default(uuid())
  admin_id           String
  action_type        String   // ADJUST_CREDITS, FREEZE_WALLET, REFUND
  target_workspace   String
  
  before_value       Json?
  after_value        Json?
  reason             String
  
  created_at         DateTime @default(now())
  
  @@map("audit_logs")
}
```

---

### **PHASE 5: Alerts & Notifications** (Priority: MEDIUM)
**Timeline:** 2 days

#### 5.1 Alert System
**File:** `lib/alerts/credit-alerts.ts`

Triggers:
- Low balance (< 1000 credits)
- Failed payment
- Deduction failure
- Meta billing mismatch
- Unusual send volume

Channels:
- Email
- WhatsApp
- Dashboard notification

---

### **PHASE 6: Advanced Features** (Priority: LOW)
**Timeline:** 3-4 days

- Auto top-up
- Credit expiry
- Predictive recharge
- Wallet freeze during send
- Volume discounts

---

## 🧪 TESTING CHECKLIST

### Unit Tests
- [ ] GST calculation accuracy
- [ ] Invoice number generation
- [ ] Atomic deduction
- [ ] Idempotency checks

### Integration Tests
- [ ] Full recharge flow
- [ ] Webhook processing
- [ ] Credit deduction
- [ ] Invoice generation

### Load Tests
- [ ] 1000 concurrent deductions
- [ ] Duplicate webhook handling
- [ ] High-volume sends

### Edge Cases
- [ ] Simultaneous sends
- [ ] Payment success + webhook delay
- [ ] Server crash mid-deduction
- [ ] Negative balance prevention
- [ ] Frozen wallet handling

---

## 📊 SUCCESS METRICS

✅ **Production Ready When:**
1. Zero negative balances in 1 month
2. 100% ledger-balance match
3. < 0.01% duplicate deductions
4. 100% GST invoice generation
5. < 1% Meta billing discrepancy
6. < 5s p99 deduction latency
7. 99.9% webhook processing success

---

## 🚀 DEPLOYMENT STRATEGY

### Phase 1 (Week 1)
- Deploy GST system
- Deploy invoice generation
- Deploy recharge UI

### Phase 2 (Week 2)
- Deploy atomic deduction
- Deploy idempotency
- Deploy pricing engine

### Phase 3 (Week 3)
- Deploy admin controls
- Deploy alerts
- Deploy reconciliation

### Phase 4 (Week 4)
- Load testing
- Bug fixes
- Production rollout

---

## 📚 DOCUMENTATION REQUIREMENTS

1. **API Documentation** - All endpoints
2. **GST Compliance Guide** - For accounting team
3. **Admin Manual** - Wallet management
4. **User Guide** - Recharge & usage
5. **Reconciliation SOP** - Monthly process

---

## 💰 ESTIMATED EFFORT

- **Development:** 15-20 days
- **Testing:** 5-7 days
- **Documentation:** 2-3 days
- **Total:** 22-30 days (1 developer)

---

**This is a production-grade financial system. No shortcuts.**

*Created: 2026-02-10*
*Status: IMPLEMENTATION READY*
