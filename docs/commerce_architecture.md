# WhatsApp Commerce Module: Architecture & Strategy

## 🏗️ Core Architecture (PHASE 0)

### 1. Multi-Tenant Safety
- **Data Isolation**: All commerce data (`stores`, `products`, `orders`) is strictly partitioned by `workspace_id`.
- **Query Guardrails**: All database queries must include `workspace_id` to prevent cross-store leakage.

### 2. Security & Credentials
- **Encryption**: Tokens (Shopify Admin Tokens / WooCommerce API Keys) are encrypted at rest using AES-256 before storage in `encrypted_credentials`.
- **Webhook Integrity**: HMAC verification is mandatory for all incoming commerce webhooks. Requests without valid signatures will be rejected (HTTP 401).

### 3. Order Lifecycle & Idempotency
- **Event Deduplication**: Use `external_id` (from the source platform) combined with `store_id` as a unique constraint.
- **Idempotent Webhooks**: Processed webhooks must be logged in `commerce_events` to prevent double-processing of status changes.

### 4. Financial Integrity (Credits)
- **Pre-Send Validation**: No WhatsApp message (Carousel, Template, Button) can be sent without a real-time credit balance check.
- **Atomic Deduction**: Credits for commerce automations must be deducted atomically using the `CreditService`.
- **Margin Floor**: Minimum message pricing is enforced globally to prevent reseller margin leakage.

### 5. Messaging Constraints
- **Carousel Limit**: Hard limit of **20 cards** per carousel as per WhatsApp API spec and platform stability rules.
- **Rate Limiting**: Automated commerce triggers are throttled to prevent spam bursts (max 100 messages/min/workspace).

---

## 🛰️ Webhook Event Map

| Event String | Source Event | Action |
| :--- | :--- | :--- |
| `order.placed` | Shopify: `orders/create` | Trigger Flow / Create Order Entry |
| `order.paid` | Woo: `payment_complete` | Trigger Drip / Status Update |
| `order.shipped` | Shopify: `fulfillments/create` | Send Shipped Notification |
| `cart.abandoned` | Shopify: `checkouts/create` | Start Recovery Drip after 30m |
| `product.sync` | Manual/Webhook | Update Local Catalog |

---

## ⚡ Commerce Trigger Matrix

| Trigger | Logic | Payload Requirement |
| :--- | :--- | :--- |
| **New Order Welcome** | `order.placed` | Customer Phone, Order Total |
| **Abandoned Cart Carousel** | No order within 30m of cart | List of Product IDs in cart |
| **Payment Reminder** | `order.placed` & status == 'PENDING' | Razorpay/Stripe Link |
| **Shipping Tracker** | `order.shipped` | Tracking Number, Courier Link |

---

## 💰 Credit Deduction Hook Spec

- **Transaction Type**: `COMMISSION` + `USAGE`
- **Commission Split**: (Final Price - Cost) * Reseller Tier %.
- **Markup Profit**: (Custom Margin) goes 100% to Reseller.
- **Logging**: Every commerce message creates a ledger entry with `related_order_id`.
