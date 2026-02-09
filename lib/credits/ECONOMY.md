# Enterprise Credit System: Phase 0 — Credit Economy & Margin Model

This document defines the financial logic and "Constitution" of the Wabot BSP Credit System. 

## 1. Credit Formula & Pricing Strategy
The system uses a multi-tier pricing model to ensure the platform, resellers, and Meta are all covered, with a guaranteed margin for the platform.

### The Formula
`Final Price (Vendor) = Meta Raw Cost + Platform Margin + Reseller Margin`

### Components:
| Component | Description |
|-----------|-------------|
| **Meta Raw Cost** | Variable cost based on Meta's Conversation Type (Marketing, Utility, Auth, Service) and Destination Country. |
| **Platform Margin** | A fixed or percentage-based floor that the platform *must* earn to cover overhead. |
| **Reseller Margin** | The markup set by the reseller. If no reseller exists, this defaults to 0 or an additional platform fee. |

### Pricing Categories (Meta Definitions)
1. **Marketing**: User-initiated or business-initiated promotions.
2. **Utility**: Business-initiated (e.g., shipping updates).
3. **Authentication**: One-time passwords.
4. **Service**: User-initiated support conversations.

---

## 2. Margin Protection Rules (The "Floor")
To prevent financial loss, the system enforces these immutable rules:
- **Platform Safety Lock**: The database will reject any pricing configuration where `Final Price < Meta Raw Cost + Platform Margin`.
- **Commission Cap**: The Reseller's share can *never* exceed the `Reseller Margin` component of the price.
- **Negative Balance Prevention**: A transaction *must* be aborted if `Current Balance + Transaction Delta < 0`.

---

## 3. Refund & Reversal Flow
Refunds are never destructive (no `DELETE`). They are always corrective.
1. **Trigger**: Admin or System initiates a reversal.
2. **Ledger Entry**: Create a new transaction type `REVERSAL` or `REFUND`.
3. **Reseller Correction**: If a commission was paid, create a negative ledger entry for the reseller to claw back the share.
4. **Wallet Sync**: Atomically update the vendor wallet based on the reversal delta.

---

## 4. Concurrency & Protection Design
To handle high-volume messaging without balance corruption:

### Atomic Deductions
- **Process**: `DeductCredits(vendor_id, amount, message_id)`
- **Lock**: Uses **Pessimistic Locking** (`SELECT FOR UPDATE`) on the `vendor_wallet` row within a transaction.
- **Verification**: Re-verify balance *after* the lock is acquired but *before* deduction.

### Idempotency
- Every message/payment has a unique ID.
- The `credit_transactions` (ledger) table has a unique constraint on `(related_message_id, type)` or `(related_payment_id, type)`.
- Re-running a webhook or a message send will fail the DB write, preventing double-deduction/crediting.

---

## 5. Ledger Integrity
- **Append-Only**: Ledger rows are immutable.
- **Balance Audit**: `Wallet.balance` must always equal `SUM(Ledger.amount)`. 
- **Consistency Job**: A daily background task will re-sum the ledger and compare it to the wallet balance, flagging any discrepancies for human review.
