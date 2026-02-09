# Phase 0: Meta Cloud API Alignment

This document outlines the core constraints and technical requirements for the Meta Cloud API integration.

## 1. Core Facts & Constraints
- **Permanent Access Tokens**: In production, we must use System User access tokens or permanent Page/WABA access tokens.
- **WABA Identity**: Every integration is tied to a specific WhatsApp Business Account (WABA) ID.
- **Phone Number ID**: Messages are sent through a specific Phone Number ID, which must be part of the WABA.
- **Webhook Verification**: Meta requires a `hub.mode`, `hub.challenge`, and `hub.verify_token` handshake.
- **24-Hour Rule**: We can only send certain message types outside the 24-hour window (Templates only).
- **Quality Rating**: Sending behavior is throttled or restricted based on the WABA quality rating (GREEN, YELLOW, RED).

## 2. Graph API Version Strategy
- **Current Targeted Version**: v18.0 (Match existing `whatsapp.ts` strategy).
- **Endpoint Pattern**: `https://graph.facebook.com/v18.0/{phone_number_id}/messages`

## 3. Required Permissions (Scopes)
- `whatsapp_business_messaging`
- `whatsapp_business_management`
- `business_management` (optional but recommended for WABA data)

## 4. Validation Engine Checklist
1. **Token Auth**: Call `/me` or `/debug_token` to verify validity.
2. **WABA Presence**: Verify if the provided WABA ID exists and is accessible.
3. **Number Mapping**: Confirm the Phone Number ID belongs to the WABA ID.
4. **Scope Verification**: Ensure the token has `whatsapp_business_messaging`.
5. **Quality Check**: Fetch current quality rating and messaging limits.

## 5. Failure Scenarios
- **401 Unauthorized**: Invalid or expired token.
- **403 Forbidden**: Missing scopes or permission removed.
- **404 Not Found**: Incorrect Phone Number ID or WABA ID.
- **100 Frequency Limit**: Rate limiting triggered.
- **WABA Banned**: Account suspended by Meta.

🚫 **Go-Live Rule**: No activation allowed until ALL validation checks pass.
