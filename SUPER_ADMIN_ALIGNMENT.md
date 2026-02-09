# Super Admin Alignment & Architecture (Phase 0)

> "This panel is for **decisions**, not configuration."

## 1. Core Vocabulary
We define the following terms to ensure unambiguous communication in code and design:

| Term | Definition within Wabot BSP | Database Mapping |
| :--- | :--- | :--- |
| **Vendor** | A business entity paying for the service. Isolated tenant. | `Workspace` Model |
| **Reseller** | A strategic partner who sells Wabot to multiple Vendors. Earns commission. | *New Model Needed* (`Partner` / `Reseller`) |
| **Health** | A real-time functional status (Is it working?). | `waba.quality_rating`, `campaign.failure_rate` |
| **Risk** | A predictive metric of future instability (Will it be banned?). | derived from `block_rates`, `template_rejections` |
| **Margin** | Net Profit per Vendor. | `(Subscription + Markup) - (Meta Conversation Fees)` |
| **Impersonation** | Logging in *as* a Vendor User to debug issues. | *Auth Feature* (Audit Logged) |

## 2. Admin Role Matrix
These roles apply strictly to the **Super Admin Panel**, separate from Workspace roles.

| Role | Responsibility | Key Permissions | Forbidden Actions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Platform Owner / CTO | **ALL**. Schema changes, deletions, global configs. | None (except intentional failsafes). |
| **Sales Admin** | Growth & Account Mgmt | View revenue, usage, contact info. Upsell capability. | Banning vendors, processing refunds, reading message content. |
| **Finance Admin**| Collections & Margins | View Invoices, Process Refunds, Adjust Credit Limits. | modifying flows, viewing chat content. |
| **Support Admin**| Incident Response | View logs, restart stuck jobs, Impersonate (Read-Only). | Deleting data, Adjusting billing/prices. |
| **Read-Only** | Investors / Auditors | View aggregate charts & global health. | Any write action. |

## 3. Action Impact Classification
To prevent "fat-finger" disasters, all admin actions are classified:

### 🔴 Irreversible (The "Nuclear" Option)
*Requires 2FA / Double Confirmation + Mandatory Audit Note*
1. **Permanent Delete Workspace**: Wipes all contacts, chats, history.
2. **Refund Transaction**: Triggers banking API, money leaves account.
3. **Hard Ban User**: Blocks email/phone from ever signing up again.

### 🟡 Reversible (Operational Controls)
*Logged but fast to execute*
1. **Suspend Workspace**: Stops message sending/API access. Can be unsuspended.
2. **Pause Campaign**: Stops the worker from processing a specific job.
3. **Adjust Credit Limit**: Temporarily increasing/decreasing spending cap.
4. **Impersonate User**: entering their dashboard view.

### 🟢 Safe / Read-Only
*Low friction*
1. Viewing Analytics.
2. Searching Vendors.
3. Exporting Reports.

---

## 4. Proposed Technical Architecture (Phase 1 Preview)

To ensure security and separation of concerns:

1.  **Separate Model**: We will NOT use the existing `User` table for Admins. We will introduce `AdminUser`.
    *   Why? Prevents accidental exposure of admin privileges in tenant logic.
2.  **Separate Route Group**: `app/super-admin` (protected by middleware checking `AdminUser`).
3.  **Audit Log**: `AdminAuditLog` table capturing `actor_id`, `action`, `target_resource`, `payload`, `ip`.

### Next Steps (Phase 1 Execution)
1.  Define `AdminUser` and `AdminAuditLog` in Prisma Schema.
2.  Create `seed.ts` to generate the first Super Admin.
3.  Implement Admin Auth Middleware.
