# Meta WhatsApp Template Capability & Validation Matrix
**Sprint 0 Deliverable**

## 1. Template Categories
Every template must belong to one of these categories. Mixing is not allowed.

| Category | Description | Use Cases | Constraints |
| :--- | :--- | :--- | :--- |
| **MARKETING** | Promotions, offers, brand awareness. | Product launches, discount codes, newsletters. | Most flexible. Default category if others don't fit. |
| **UTILITY** | Transactional updates, ongoing business. | Order updates, shipment tracking, account alerts. | Must be specific to a transaction. No open-ended marketing. |
| **AUTHENTICATION** | One-time passwords (OTP). | Verification codes, account recovery. | Extremely strict. No images, no custom footers usually. 1 button max (Copy Code or One-tap). |

---

## 2. Component Architecture
A template is composed of 4 optional blocks.

### A. Header (Optional)
*   **Format**: Text OR Media (Image, Video, Document, Location).
*   **Text Limit**: 60 characters.
*   **Variables**: Allowed in Text (e.g., `Welcome {{1}}`).
*   **Media**: No caption allowed in header media itself.

### B. Body (Required)
*   **Format**: Text only.
*   **Limit**: 1024 characters.
*   **Variables**: Allowed (e.g., `Your order {{1}} is ready.`).
*   **Formatting**: Bold (`*`), Italic (`_`), Strikethrough (`~`), Monospace (` ``` `).
*   **Prohibited**: Newlines usage to bypass limits.

### C. Footer (Optional)
*   **Format**: Text only.
*   **Limit**: 60 characters.
*   **Variables**: **NOT** Allowed.
*   **Purpose**: Disclaimers, "Reply STOP to unsubscribe".

### D. Buttons (Optional)
*   **Max Count**: 3 Buttons total per template.
*   **Types**:
    1.  **Quick Reply**: User sends a text back. (Max 25 chars).
    2.  **Call-to-Action (URL)**: Opens a link. Static (`https://site.com`) or Dynamic (`https://site.com/{{1}}`).
    3.  **Call-to-Action (Phone)**: Dials a number.
    4.  **Copy Code**: (Auth only) Copies text to clipboard.
*   **Mixing Rules**: Cannot mix Quick Reply with Call-to-Action.

---

## 3. Validation & Rejection Rules (The "Anti-Rejection" Engine)

We will enforce these strictly in the frontend/backend before sending to Meta.

| Rule ID | Rule Description | Rejection Reason |
| :--- | :--- | :--- |
| `VAL_01` | Variable `{{1}}` must be sequential. Cannot jump to `{{3}}`. | Format Error |
| `VAL_02` | Variables cannot be at the very start/end of Body (floating parameters). *Soft Rule*. | "Ambiguous Parameters" |
| `VAL_03` | URL buttons can have only *one* dynamic variable at the end. | Format Error |
| `VAL_04` | Marketing templates must not ask for "financial information" explicitly. | Policy Violation |
| `VAL_05` | Auth templates can NOT have media headers or footers in some regions. | Category Mismatch |
| `VAL_06` | Double newline `\n\n` is fine, but `\n\n\n\n` is spammy. | Format Quality |

---

## 4. Lifecycle States (BSP Internal vs Meta)

| BSP Status | Meta Status | Description | Action Allowed |
| :--- | :--- | :--- | :--- |
| **DRAFT** | *None* | User is editing. Not saved to Meta. | Edit, Delete |
| **SUBMITTED** | `PENDING` | Sent to Meta API. Waiting for review. | Read-only |
| **APPROVED** | `APPROVED` | Accepted. Ready to send. | Send, Delete (Disable) |
| **REJECTED** | `REJECTED` | Violated policy. | Edit -> Resubmit |
| **PAUSED** | `PAUSED` | High block rate / negative feedback. | Read-only (Cooldown) |
| **DISABLED** | `DISABLED` | Flagged or user deleted. | None |

---

## 5. Scope Lock (Sprint 1)
Based on this, Sprint 1 we will build:
1.  **Table `Template`**: id, name, category, language, status, components_json.
2.  **Table `TemplateVariable`**: mapping for sample values.
3.  **API**: `POST /api/templates` (Create Draft).
