# AntiGravity Database Schema (Draft)

## Core Tables

### 1. Workspaces (Tenants)
The root entity for a customer/vendor.
*   `id`: UUID
*   `name`: String
*   `business_name`: String
*   `status`: Enum (ACTIVE, SUSPENDED)
*   `timezone`: String
*   `created_at`: Types.
*   `settings`: JSONB (branding, default_limits)

### 2. Users (Agents/Admins)
*   `id`: UUID
*   `workspace_id`: UUID (FK)
*   `email`: String (Unique per workspace)
*   `password_hash`: String
*   `role`: Enum (OWNER, ADMIN, FINANCE, AGENT)
*   `first_name`: String
*   `last_name`: String
*   `verified`: Boolean

### 3. Teams
Grouping for agents and contacts.
*   `id`: UUID
*   `workspace_id`: UUID (FK)
*   `name`: String
*   `description`: String

### 4. WhatsApp Accounts (WABA)
Connects to Meta.
*   `id`: UUID
*   `workspace_id`: UUID (FK)
*   `waba_id`: String (Meta WABA ID)
*   `phone_number_id`: String (Meta ID)
*   `phone_number`: String
*   `display_name`: String
*   `status`: Enum (CONNECTED, DISCONNECTED, BANNED)
*   `quality_rating`: String
*   `messaging_limit`: String
*   `access_token`: String (Encrypted)

### 5. Templates
WhatsApp Templates synced with Meta.
*   `id`: UUID
*   `workspace_id`: UUID (FK)
*   `waba_id`: UUID (FK)
*   `name`: String
*   `language`: String
*   `category`: String (MARKETING, UTILITY, AUTH)
*   `status`: Enum (APPROVED, REJECTED, PENDING)
*   `components`: JSONB (Header, Body, Buttons)

### 6. Webhook Events (Idempotency)
*   `id`: String (Meta Event ID)
*   `waba_id`: String
*   `payload`: JSONB
*   `processed`: Boolean
*   `created_at`: Timestamp

## Indexes & Constraints
*   **Multi-tenancy**: Composite indexes on `(workspace_id, ...)` for most querying patterns.
*   **Uniqueness**: `email` unique within `workspace_id`.
