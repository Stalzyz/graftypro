# Manual WhatsApp Integration with Health Monitoring
## Implementation Master Plan

---

## 🎯 Project Overview

This document outlines the complete implementation of a **Manual WhatsApp Integration Module** that allows power users to configure their own Meta WhatsApp Business API credentials while ensuring security, reliability, and health monitoring.

### Core Objectives

1. **Security First**: Encrypted credential storage, validation before activation
2. **Health Visibility**: Real-time monitoring of integration health
3. **Risk Prevention**: Auto-pause on critical failures, ban prevention
4. **User Empowerment**: Clear UI for setup, diagnostics, and troubleshooting
5. **Enterprise Ready**: Audit logs, compliance enforcement, multi-tenant isolation

---

## 📊 Current State Analysis

### Existing Infrastructure
- ✅ `WhatsAppAccount` model with basic WABA fields
- ✅ Workspace-based multi-tenancy
- ✅ WhatsApp messaging service (`lib/whatsapp/service.ts`)
- ✅ Basic integration framework
- ✅ Campaign and drip messaging systems

### Gaps to Address
- ❌ No credential validation pipeline
- ❌ No health monitoring engine
- ❌ No manual setup UI/wizard
- ❌ No webhook verification system
- ❌ No risk detection or auto-pause
- ❌ No encryption for sensitive credentials
- ❌ No permission/scope validation

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  Setup Wizard  │  Health Dashboard  │  Diagnostics Panel    │
└────────┬────────────────┬────────────────────┬──────────────┘
         │                │                    │
┌────────▼────────────────▼────────────────────▼──────────────┐
│                   API & VALIDATION LAYER                     │
├─────────────────────────────────────────────────────────────┤
│  Credential Input  │  Validation Engine  │  Webhook Setup   │
└────────┬────────────────┬────────────────────┬──────────────┘
         │                │                    │
┌────────▼────────────────▼────────────────────▼──────────────┐
│                    CORE SERVICES LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Health Monitor  │  Risk Detector  │  Meta Graph API Client │
└────────┬────────────────┬────────────────────┬──────────────┘
         │                │                    │
┌────────▼────────────────▼────────────────────▼──────────────┐
│                      DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  WhatsAppIntegration  │  HealthMetrics  │  AuditLogs        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Implementation Phases

### ✅ PHASE 0: Meta & Security Alignment (COMPLETED)
**Status**: Understanding established
- Meta Graph API constraints documented
- Security requirements defined
- Credential validation checklist created

---

### 🔨 PHASE 1: Integration Data Model & Security Foundation

**Goal**: Create secure, auditable database schema for WhatsApp integrations

#### Database Schema Changes

**1.1 Enhanced WhatsAppAccount Model**
```prisma
enum IntegrationStatus {
  DRAFT           // Credentials entered, not validated
  VALIDATING      // Validation in progress
  ACTIVE          // Fully operational
  DEGRADED        // Working but with warnings
  PAUSED          // Manually paused by user
  SUSPENDED       // Auto-paused due to risk
  DISABLED        // Permanently disabled
  FAILED          // Validation failed
}

enum HealthStatus {
  HEALTHY         // All checks passing
  WARNING         // Minor issues detected
  CRITICAL        // Major issues, auto-pause triggered
  UNKNOWN         // Not yet checked
}

model WhatsAppAccount {
  // ... existing fields ...
  
  // Enhanced Status Management
  integration_status IntegrationStatus @default(DRAFT)
  health_status      HealthStatus      @default(UNKNOWN)
  
  // Meta Credentials (Enhanced)
  app_id             String?           // Meta App ID
  app_secret         String?           // Encrypted
  access_token       String            // Encrypted
  waba_id            String            // Meta WABA ID
  phone_number_id    String   @unique  // Meta Phone Number ID
  business_id        String?           // Meta Business Manager ID
  
  // Webhook Configuration
  webhook_url        String?           // Generated webhook URL
  webhook_verify_token String?         // Generated verify token
  webhook_verified_at  DateTime?       // When webhook was verified
  
  // Permissions & Scopes
  granted_permissions Json?            // Array of granted permissions
  required_permissions Json?           // Array of required permissions
  permission_check_at  DateTime?       // Last permission check
  
  // Health Metrics
  last_health_check_at DateTime?
  last_successful_send_at DateTime?
  consecutive_failures Int @default(0)
  
  // Risk Indicators
  quality_rating     String?           // GREEN, YELLOW, RED
  messaging_limit    String?           // 250, 1K, 10K, 100K, UNLIMITED
  rate_limit_tier    String?           // Tier information
  
  // Audit Trail
  validated_at       DateTime?
  suspended_at       DateTime?
  suspension_reason  String?
  
  // Relations
  health_logs        IntegrationHealthLog[]
  audit_logs         IntegrationAuditLog[]
}
```

**1.2 Health Monitoring Tables**
```prisma
enum HealthCheckType {
  TOKEN_VALIDITY
  WEBHOOK_REACHABILITY
  PERMISSION_CHECK
  PHONE_STATUS
  RATE_LIMIT_CHECK
  MESSAGE_DELIVERY
  QUALITY_RATING
}

model IntegrationHealthLog {
  id                   String   @id @default(uuid())
  whatsapp_account_id  String
  
  check_type           HealthCheckType
  status               String   // PASS, WARN, FAIL
  
  details              Json     // Check-specific data
  error_message        String?
  
  checked_at           DateTime @default(now())
  
  whatsapp_account     WhatsAppAccount @relation(fields: [whatsapp_account_id], references: [id], onDelete: Cascade)
  
  @@index([whatsapp_account_id, checked_at])
  @@map("integration_health_logs")
}
```

**1.3 Audit Logging**
```prisma
enum AuditAction {
  INTEGRATION_CREATED
  CREDENTIALS_UPDATED
  VALIDATION_STARTED
  VALIDATION_PASSED
  VALIDATION_FAILED
  ACTIVATED
  PAUSED
  SUSPENDED
  RESUMED
  DELETED
  WEBHOOK_VERIFIED
  PERMISSION_GRANTED
  PERMISSION_REVOKED
  HEALTH_CHECK_FAILED
}

model IntegrationAuditLog {
  id                   String   @id @default(uuid())
  whatsapp_account_id  String
  workspace_id         String
  user_id              String?
  
  action               AuditAction
  details              Json?
  ip_address           String?
  user_agent           String?
  
  created_at           DateTime @default(now())
  
  whatsapp_account     WhatsAppAccount @relation(fields: [whatsapp_account_id], references: [id], onDelete: Cascade)
  
  @@index([whatsapp_account_id, created_at])
  @@index([workspace_id, created_at])
  @@map("integration_audit_logs")
}
```

#### Deliverables
- [ ] Updated Prisma schema with new models
- [ ] Migration files generated
- [ ] Encryption utilities for sensitive fields
- [ ] Database migration executed

---

### 🔨 PHASE 2: Credential Validation Engine

**Goal**: Validate Meta credentials before allowing activation

#### Core Validation Service

**File**: `lib/whatsapp/validation.ts`

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: {
    appName?: string;
    wabaName?: string;
    phoneNumber?: string;
    permissions?: string[];
  };
}

class WhatsAppCredentialValidator {
  // 1. Validate Access Token
  async validateAccessToken(token: string): Promise<ValidationResult>
  
  // 2. Validate App ID & Secret
  async validateApp(appId: string, appSecret: string): Promise<ValidationResult>
  
  // 3. Validate WABA Ownership
  async validateWABAOwnership(token: string, wabaId: string): Promise<ValidationResult>
  
  // 4. Validate Phone Number ID
  async validatePhoneNumber(token: string, phoneNumberId: string): Promise<ValidationResult>
  
  // 5. Check Permissions & Scopes
  async checkPermissions(token: string): Promise<ValidationResult>
  
  // 6. Comprehensive Validation
  async validateComplete(credentials: WhatsAppCredentials): Promise<ValidationResult>
}
```

#### Meta Graph API Client

**File**: `lib/whatsapp/meta-graph.ts`

```typescript
class MetaGraphAPI {
  // Token introspection
  async debugToken(token: string, appId: string): Promise<TokenDebugInfo>
  
  // Get WABA details
  async getWABA(wabaId: string, token: string): Promise<WABAInfo>
  
  // Get Phone Number details
  async getPhoneNumber(phoneId: string, token: string): Promise<PhoneInfo>
  
  // Check permissions
  async getPermissions(token: string): Promise<string[]>
  
  // Get message templates
  async getTemplates(wabaId: string, token: string): Promise<Template[]>
  
  // Health check endpoint
  async healthCheck(phoneId: string, token: string): Promise<HealthInfo>
}
```

#### Deliverables
- [ ] Validation service implementation
- [ ] Meta Graph API client
- [ ] Error handling & retry logic
- [ ] Unit tests for validation flows

---

### 🔨 PHASE 3: Manual Setup Wizard UI

**Goal**: User-friendly credential input interface

#### Setup Wizard Component

**File**: `app/dashboard/settings/whatsapp/setup/page.tsx`

**Steps**:
1. **Welcome & Prerequisites**
   - Meta Business Account required
   - WhatsApp Business API access
   - Link to Meta setup guide

2. **App Credentials**
   - App ID input
   - App Secret input (masked)
   - Validation on blur

3. **Access Token**
   - Token input (masked)
   - Token type (System User vs User)
   - Expiry warning

4. **WABA & Phone Selection**
   - WABA ID input
   - Phone Number ID input
   - Auto-fetch if token valid

5. **Verification**
   - Run comprehensive validation
   - Display results
   - Allow retry on failure

6. **Activation**
   - Confirm activation
   - Set up webhooks
   - Final health check

#### Deliverables
- [ ] Multi-step wizard component
- [ ] Form validation & error display
- [ ] Inline help & tooltips
- [ ] Progress indicator
- [ ] API endpoints for setup flow

---

### 🔨 PHASE 4: Webhook Configuration & Verification

**Goal**: Establish two-way communication with Meta

#### Webhook Handler

**File**: `app/api/webhooks/whatsapp/[workspace_id]/route.ts`

```typescript
// GET: Webhook verification
export async function GET(req: Request) {
  // Handle Meta's verification challenge
  // Verify token matches
  // Return challenge
}

// POST: Webhook events
export async function POST(req: Request) {
  // Validate signature
  // Process events
  // Return 200 immediately
}
```

#### Webhook Setup Service

**File**: `lib/whatsapp/webhook-setup.ts`

```typescript
class WebhookSetupService {
  // Generate unique webhook URL per workspace
  generateWebhookURL(workspaceId: string): string
  
  // Generate verify token
  generateVerifyToken(): string
  
  // Configure webhook on Meta side (if API allows)
  async configureWebhook(wabaId: string, token: string, webhookUrl: string): Promise<void>
  
  // Verify webhook is receiving events
  async verifyWebhookConnection(workspaceId: string): Promise<boolean>
}
```

#### Deliverables
- [ ] Webhook endpoint implementation
- [ ] Signature verification
- [ ] Webhook setup UI guide
- [ ] Connection test functionality

---

### 🔨 PHASE 5: Health Monitoring Engine

**Goal**: Continuous health monitoring with auto-detection

#### Health Monitor Service

**File**: `lib/whatsapp/health-monitor.ts`

```typescript
class IntegrationHealthMonitor {
  // Run all health checks
  async runHealthChecks(accountId: string): Promise<HealthReport>
  
  // Individual checks
  async checkTokenValidity(accountId: string): Promise<CheckResult>
  async checkWebhookHealth(accountId: string): Promise<CheckResult>
  async checkPhoneStatus(accountId: string): Promise<CheckResult>
  async checkQualityRating(accountId: string): Promise<CheckResult>
  async checkMessageDelivery(accountId: string): Promise<CheckResult>
  
  // Update health status
  async updateHealthStatus(accountId: string, status: HealthStatus): Promise<void>
  
  // Log health check
  async logHealthCheck(accountId: string, check: HealthCheck): Promise<void>
}
```

#### Scheduled Health Checks

**File**: `workers/health-monitor.ts`

```typescript
// Cron job: Every 15 minutes
async function monitorAllIntegrations() {
  // Get all ACTIVE integrations
  // Run health checks
  // Update statuses
  // Trigger alerts if needed
}
```

#### Deliverables
- [ ] Health monitoring service
- [ ] Scheduled health check worker
- [ ] Health status calculation logic
- [ ] Alert triggering system

---

### 🔨 PHASE 6: Risk Detection & Auto-Protection

**Goal**: Prevent bans and failures automatically

#### Risk Detector Service

**File**: `lib/whatsapp/risk-detector.ts`

```typescript
class RiskDetector {
  // Detect token expiry
  async detectTokenExpiry(accountId: string): Promise<RiskLevel>
  
  // Detect permission issues
  async detectPermissionIssues(accountId: string): Promise<RiskLevel>
  
  // Detect rate limiting
  async detectRateLimiting(accountId: string): Promise<RiskLevel>
  
  // Detect quality degradation
  async detectQualityDegradation(accountId: string): Promise<RiskLevel>
  
  // Detect consecutive failures
  async detectConsecutiveFailures(accountId: string): Promise<RiskLevel>
  
  // Auto-pause if critical
  async autoPauseIfCritical(accountId: string, reason: string): Promise<void>
}
```

#### Auto-Pause Logic

```typescript
// Trigger auto-pause on:
- Token expired or invalid
- Webhook down for > 1 hour
- Phone number restricted/disabled
- Quality rating = RED
- 10+ consecutive send failures
- Permission revoked
```

#### Deliverables
- [ ] Risk detection service
- [ ] Auto-pause implementation
- [ ] Risk level calculation
- [ ] Alert notification system

---

### 🔨 PHASE 7: User & Admin Dashboards

**Goal**: Clear visibility and control

#### User Health Dashboard

**File**: `app/dashboard/settings/whatsapp/health/page.tsx`

**Features**:
- Integration status card (🟢🟡🔴)
- Recent health checks timeline
- Active warnings/errors
- Quick actions (Test, Pause, Resume)
- Metrics: uptime, success rate, last check

#### Admin Global View

**File**: `app/admin/integrations/page.tsx`

**Features**:
- All workspace integrations
- Filter by status/health
- Bulk actions
- System-wide metrics

#### Deliverables
- [ ] User health dashboard
- [ ] Admin integration view
- [ ] Real-time status updates
- [ ] Action buttons & modals

---

### 🔨 PHASE 8: Diagnostic & Testing Tools

**Goal**: Self-service troubleshooting

#### Diagnostics Panel

**File**: `app/dashboard/settings/whatsapp/diagnostics/page.tsx`

**Features**:
- Test Connection button
- Send Test Message
- Webhook Ping Test
- Permission Checklist
- Detailed error logs
- Export diagnostic report

#### Test Service

**File**: `lib/whatsapp/diagnostics.ts`

```typescript
class DiagnosticsService {
  async testConnection(accountId: string): Promise<DiagnosticReport>
  async sendTestMessage(accountId: string, phoneNumber: string): Promise<TestResult>
  async pingWebhook(accountId: string): Promise<TestResult>
  async checkPermissions(accountId: string): Promise<PermissionReport>
  async generateDiagnosticReport(accountId: string): Promise<Report>
}
```

#### Deliverables
- [ ] Diagnostics UI
- [ ] Test service implementation
- [ ] Diagnostic report generation
- [ ] Export functionality

---

### 🔨 PHASE 9: Compliance & Fail-Safe Enforcement

**Goal**: Never send messages blindly

#### Pre-Send Validation

**File**: `lib/whatsapp/send-guard.ts`

```typescript
class SendGuard {
  // Check before every send
  async canSend(accountId: string): Promise<SendPermission>
  
  // Validation checks:
  - Integration status = ACTIVE
  - Health status != CRITICAL
  - Token valid
  - Webhook connected
  - Phone number not restricted
  - No active suspension
  
  // Block if any check fails
}
```

#### Integration into Existing Services

Update `lib/whatsapp/service.ts`:
```typescript
static async sendMessage(...) {
  // 1. Get account
  // 2. Run SendGuard.canSend()
  // 3. If blocked, throw error
  // 4. Proceed with send
  // 5. Log result
}
```

#### Deliverables
- [ ] Send guard service
- [ ] Integration into message sending
- [ ] Campaign pre-flight checks
- [ ] Drip sequence validation

---

### 🔨 PHASE 10: Encryption & Security Hardening

**Goal**: Secure credential storage

#### Encryption Service

**File**: `lib/security/encryption.ts`

```typescript
class CredentialEncryption {
  // Encrypt sensitive fields
  async encrypt(plaintext: string): Promise<string>
  
  // Decrypt for use
  async decrypt(ciphertext: string): Promise<string>
  
  // Mask for display
  mask(value: string): string // "sk_live_***************xyz"
}
```

#### Fields to Encrypt
- `app_secret`
- `access_token`
- `webhook_verify_token`

#### Deliverables
- [ ] Encryption service
- [ ] Prisma middleware for auto-encrypt/decrypt
- [ ] Environment variable for encryption key
- [ ] Migration to encrypt existing tokens

---

## 🎯 Success Criteria

### Phase Completion Checklist

Each phase is complete when:
- ✅ All code implemented and tested
- ✅ Database migrations applied
- ✅ API endpoints functional
- ✅ UI components working
- ✅ Documentation updated
- ✅ No breaking changes to existing features

### Final Acceptance Criteria

The entire project is complete when:
- ✅ Users can manually configure WhatsApp credentials
- ✅ All credentials are validated before activation
- ✅ Health monitoring runs automatically
- ✅ Critical issues trigger auto-pause
- ✅ Users can diagnose and fix issues
- ✅ No messages sent with invalid integrations
- ✅ All credentials encrypted at rest
- ✅ Audit logs capture all actions
- ✅ Admin can monitor all integrations

---

## 📅 Estimated Timeline

| Phase | Estimated Time | Dependencies |
|-------|---------------|--------------|
| Phase 1: Data Model | 4 hours | None |
| Phase 2: Validation Engine | 6 hours | Phase 1 |
| Phase 3: Setup Wizard UI | 8 hours | Phase 2 |
| Phase 4: Webhook Setup | 4 hours | Phase 1 |
| Phase 5: Health Monitoring | 6 hours | Phase 2, 4 |
| Phase 6: Risk Detection | 4 hours | Phase 5 |
| Phase 7: Dashboards | 6 hours | Phase 5, 6 |
| Phase 8: Diagnostics | 4 hours | Phase 2, 5 |
| Phase 9: Compliance | 3 hours | Phase 2, 6 |
| Phase 10: Encryption | 3 hours | Phase 1 |

**Total Estimated Time**: ~48 hours (6 working days)

---

## 🚀 Next Steps

1. **Review & Approve** this plan
2. **Start with Phase 1**: Database schema updates
3. **Proceed sequentially** through phases
4. **Test thoroughly** at each phase
5. **Deploy incrementally** to production

---

## 📞 Support & Questions

For questions or clarifications during implementation:
- Review Meta's [WhatsApp Business Platform Documentation](https://developers.facebook.com/docs/whatsapp)
- Check [Graph API Reference](https://developers.facebook.com/docs/graph-api)
- Consult this plan for architecture decisions

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-05  
**Status**: Ready for Implementation
