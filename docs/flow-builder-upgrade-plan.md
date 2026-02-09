# Implementation Plan: Advanced Interactive Commerce Engine for Flow Builder

This plan outlines the steps required to upgrade the existing Flow Builder into a sales-focused, interactive commerce engine.

## Phase 1: Interactive Media & Message Types
Upgrade the `Message` node to support multiple media types and interactive buttons.

### 1.1 Data Structure Updates
Update the `NodeData` in `FlowRunner.ts` and the frontend components to support:
- `contentType`: 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'VOICE'
- `mediaUrl`: URL of the media
- `caption`: Text caption for media
- `buttons`: Array of interactive buttons [{ type, label, value, action }]

### 1.2 WhatsApp Service Expansion
Modify `lib/whatsapp/service.ts`:
- Add `sendInteractiveButtons(phoneId, token, to, body, buttons)`
- Add `sendVideo(phoneId, token, to, url, caption)`
- Add `sendVoice(phoneId, token, to, url)`

### 1.3 UI Enhancements
- Update `MessageNode.tsx` to display icons and a preview of media.
- Update `FlowPropertiesPanel.tsx` with a "Content Type" selector.
- Add "Add Button" logic in `FlowPropertiesPanel.tsx`.

## Phase 2: Payment Integration (Razorpay/Stripe)
Standardize payment collection within flows.

### 2.1 Backend Logic
- Enhance `lib/engine/flow-runner.ts` to handle `payment` node logic securely.
- Ensure post-payment webhook (e.g., Razorpay) triggers a session advance or a specific flow path.

### 2.2 Payment Webhook Handler
- Create `app/api/payments/webhook/route.ts` (if not exists) to process success/failure and advance the relevant `FlowSession`.

## Phase 3: Appointment Booking Module
Create a native booking engine within the Flow Builder.

### 3.1 Appointment Service
Create `lib/services/appointment-service.ts`:
- `getAvailableSlots(workspaceId, date)`
- `bookSlot(workspaceId, contactId, slotId)`
- `cancelAppointment(appointmentId)`

### 3.2 Appointment Node
- Create `components/flow-builder/nodes/AppointmentNode.tsx`.
- Add configuration in `FlowPropertiesPanel.tsx` for calendar selection and reminder settings.

## Phase 4: Order Tracking Integration
Connect flows to Shopify/WooCommerce.

### 4.1 Logistics Service
- Enhance `lib/integrations/logistics.ts` to support Shopify/WooCommerce API keys from `Integration` model.

### 4.2 Branching Logic
- Ensure the `order_tracking` node has "Found" and "Not Found" branches (already partially implemented).

## Phase 5: Flow Runner & Analytics
Refine the engine for conversion tracking.

### 5.1 Conditional Routing
- Support complex conditions (e.g., `last_payment_status == 'SUCCESS'`).

### 5.2 Analytics
- Log button clicks in `FlowAnalytics` with `action_type`.

---

## Deliverables Checklist
- [ ] DB Schema Audit & Minor Updates (Appointments/Payments)
- [ ] `AppointmentService` Implementation
- [ ] `FlowRunner` Upgrades (Interactive & Media)
- [ ] `FlowBuilder` UI components (New Nodes & Properties)
- [ ] Payment Webhook Integration
- [ ] Testing suite for Commerce flows
