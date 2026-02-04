# Core API Specifications (Internal Internal & Public)

## Authentication
*   `POST /api/auth/register`: Signup new Vendor (Tenant).
*   `POST /api/auth/login`: Login for all roles.
*   `POST /api/auth/refresh`: Refresh JWT.
*   `GET /api/auth/me`: Get current user context & permissions.

## Workspace Management
*   `GET /api/workspace`: Get details of current workspace.
*   `PUT /api/workspace/settings`: Update settings.

## Team Management
*   `GET /api/teams`: List teams.
*   `POST /api/teams`: Create team.
*   `POST /api/teams/:id/members`: Add user to team.

## WhatsApp Onboarding (Embedded Signup)
*   `POST /api/whatsapp/onboard/start`: Generate Embedded Signup Config.
*   `POST /api/whatsapp/onboard/callback`: Handle OAuth callback from Meta.
*   `GET /api/whatsapp/phone-numbers`: Sync/List numbers.

## Webhooks (Meta Ingress)
*   `GET /api/webhooks/whatsapp`: Verification challenge.
*   `POST /api/webhooks/whatsapp`: Ingest events (Messages, Statuses).
    *   *Must return 200 OK immediately*
    *   *Must verify X-Hub-Signature*

## Template Management
*   `GET /api/templates`: List templates (Local + Sync).
*   `POST /api/templates/sync`: Force sync from Meta.
*   `POST /api/templates`: Create new template (Validate structure -> Submit to Meta).
