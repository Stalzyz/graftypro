# AntiGravity Platform Architecture - Phase 1: Core Foundation

## 1. System Architecture Diagram

```mermaid
graph TD
    User[User / Vendor] -->|HTTPS| CDN[CDN / Edge Layer]
    CDN -->|Load Verify| AppServer[Next.js App Server]
    
    subgraph "SaaS Core"
        AppServer -->|Auth/Session| AuthProvider[Auth System (JWT)]
        AppServer -->|API| API[Core API Layer]
    end
    
    subgraph "Data Layer"
        API -->|Read/Write| DB[(Primary Database - PostgreSQL)]
        API -->|Cache/Queue| Redis[(Redis)]
    end
    
    subgraph "Worker Layer"
        Redis -->|Jobs| QueueWorker[Message Queue Workers]
        QueueWorker -->|Send| MetaAPI[Meta WhatsApp Cloud API]
        MetaAPI -->|Webhooks| WebhookIngest[Webhook Ingestion Service]
        WebhookIngest -->|Deduplicate| Redis
        WebhookIngest -->|Process| QueueWorker
    end
```

## 2. Technology Stack

*   **Frontend/Backend Framework**: Next.js (React + Node.js)
    *   Selected for unified full-stack capabilities, server-side rendering, and rapid API development.
*   **Database**: PostgreSQL
    *   Chosen for robust relational data modeling and JSONB support for flexible metadata.
*   **Queue System**: BullMQ (Redis)
    *   Essential for high-throughput message sending and webhook processing.
*   **Authentication**: Custom JWT or NextAuth
    *   Supporting Vendor -> Team -> Agent hierarchy.

## 3. Auth & Tenant Isolation Strategy

### Multi-Tenancy Model
We will use a **Row-Level Tenancy** (Shared Database, Separate Schemas logically) approach.
*   Every critical table (Contacts, Messages, Templates) will have a `workspace_id` (Vendor ID).
*   All queries must strictly filter by `workspace_id`.

### Hierarchy & Access Control (RBAC)
Levels:
1.  **Platform Owner** (Super Admin) - Cross-tenant access (for support/billing).
2.  **Vendor (Tenant Owner)** - Full access to their workspace.
3.  **Finance** - Access to billing/credits only.
4.  **Admin** - Can manage teams, templates, flows.
5.  **Agent** - Can only view assigned conversations/teams.

### Implementation
*   **Middleware**: Intercepts requests, validates JWT, extracts `workspace_id`, and enforces context.
*   **Policies**: Code-level policies (e.g., CASL or custom logic) to check permissions per resource.

## 4. Event-Driven Architecture
*   **Events**: `message.received`, `message.sent`, `template.status_update`.
*   **Bus**: Internal Event Emitter or Redis Pub/Sub for decoupling components.
*   **Webhook Handling**:
    *   Incoming Meta webhooks are pushed immediately to a "Raw Queue".
    *   Acknowledged with `200 OK` instantly (standard requirement).
    *   Processed asynchronously to prevent timeouts.
