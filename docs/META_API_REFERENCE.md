# Meta WhatsApp Business API - Reference Guide

## 🎯 Purpose

Quick reference for Meta Graph API endpoints and requirements used in the WhatsApp Integration module.

---

## 🔑 Required Permissions

### Minimum Required Scopes
```
whatsapp_business_management
whatsapp_business_messaging
business_management
```

### Optional but Recommended
```
pages_messaging
pages_read_engagement
```

---

## 📡 Graph API Endpoints

### Base URL
```
https://graph.facebook.com/v18.0
```

---

## 1️⃣ Token Validation

### Debug Access Token
```http
GET /debug_token?input_token={token}&access_token={app_token}
```

**Response**:
```json
{
  "data": {
    "app_id": "123456789",
    "type": "USER",
    "application": "My App",
    "expires_at": 1234567890,
    "is_valid": true,
    "scopes": ["whatsapp_business_messaging", "..."],
    "user_id": "987654321"
  }
}
```

**Use Case**: Validate token before activation

---

## 2️⃣ WABA Information

### Get WABA Details
```http
GET /{waba_id}?fields=id,name,currency,timezone,message_template_namespace,account_review_status
```

**Response**:
```json
{
  "id": "123456789012345",
  "name": "My Business",
  "currency": "USD",
  "timezone": "America/Los_Angeles",
  "message_template_namespace": "abc123_xyz",
  "account_review_status": "APPROVED"
}
```

**Use Case**: Verify WABA ownership and status

---

## 3️⃣ Phone Number Information

### Get Phone Number Details
```http
GET /{phone_number_id}?fields=id,display_phone_number,verified_name,quality_rating,messaging_limit_tier,code_verification_status
```

**Response**:
```json
{
  "id": "987654321098765",
  "display_phone_number": "+1 555-0123",
  "verified_name": "My Business",
  "quality_rating": "GREEN",
  "messaging_limit_tier": "TIER_1K",
  "code_verification_status": "VERIFIED"
}
```

**Quality Ratings**:
- `GREEN`: High quality
- `YELLOW`: Medium quality (warning)
- `RED`: Low quality (critical)
- `UNKNOWN`: Not yet determined

**Messaging Limit Tiers**:
- `TIER_250`: 250 unique customers/24h
- `TIER_1K`: 1,000 unique customers/24h
- `TIER_10K`: 10,000 unique customers/24h
- `TIER_100K`: 100,000 unique customers/24h
- `UNLIMITED`: No limit

**Use Case**: Health monitoring, quality tracking

---

## 4️⃣ Message Templates

### List Templates
```http
GET /{waba_id}/message_templates?limit=100&fields=id,name,status,category,language
```

**Response**:
```json
{
  "data": [
    {
      "id": "123456789",
      "name": "welcome_message",
      "status": "APPROVED",
      "category": "MARKETING",
      "language": "en"
    }
  ],
  "paging": {
    "cursors": {
      "before": "...",
      "after": "..."
    }
  }
}
```

**Template Statuses**:
- `APPROVED`: Ready to use
- `PENDING`: Under review
- `REJECTED`: Not approved
- `PAUSED`: Temporarily disabled
- `DISABLED`: Permanently disabled

**Use Case**: Template access validation

---

## 5️⃣ Send Message

### Send Text Message
```http
POST /{phone_number_id}/messages
```

**Body**:
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "919876543210",
  "type": "text",
  "text": {
    "body": "Hello World"
  }
}
```

**Response**:
```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "919876543210",
      "wa_id": "919876543210"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBgLMTY1MDUwNzY1OTAVAgARGBI5QTNDQTVCM0Q0Q0Q2RTY3RTcA"
    }
  ]
}
```

**Use Case**: Test message sending

---

## 6️⃣ Webhook Configuration

### Subscribe to Webhooks
```http
POST /{waba_id}/subscribed_apps
```

**Body**:
```json
{
  "override": false,
  "callback_url": "https://yourdomain.com/webhooks/whatsapp",
  "verify_token": "your_verify_token_here",
  "fields": ["messages", "message_status"]
}
```

**Note**: This may require app-level configuration in Meta Business Suite

---

## 7️⃣ Webhook Verification

### GET Request from Meta
```http
GET /webhooks/whatsapp?hub.mode=subscribe&hub.verify_token={verify_token}&hub.challenge={challenge}
```

**Expected Response**:
```
{challenge}
```

**Use Case**: Webhook handshake

---

## 8️⃣ Webhook Events

### Message Received
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550123",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": {
                  "name": "John Doe"
                },
                "wa_id": "919876543210"
              }
            ],
            "messages": [
              {
                "from": "919876543210",
                "id": "wamid.XXX",
                "timestamp": "1234567890",
                "type": "text",
                "text": {
                  "body": "Hello"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### Message Status Update
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550123",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "statuses": [
              {
                "id": "wamid.XXX",
                "status": "delivered",
                "timestamp": "1234567890",
                "recipient_id": "919876543210"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

**Status Values**:
- `sent`: Message sent to WhatsApp servers
- `delivered`: Message delivered to recipient
- `read`: Message read by recipient
- `failed`: Message failed to send

---

## 🚨 Error Codes

### Common Errors

| Code | Message | Meaning | Action |
|------|---------|---------|--------|
| 190 | Invalid OAuth access token | Token expired/invalid | Refresh token |
| 100 | Invalid parameter | Bad request data | Check payload |
| 368 | Temporarily blocked for policies violations | Rate limited | Wait and retry |
| 131031 | Message undeliverable | Phone number issue | Check number |
| 131026 | Message failed to send | Generic failure | Retry |
| 133016 | Template does not exist | Template not found | Check template name |
| 132000 | Template parameter count mismatch | Wrong params | Fix parameters |

---

## 🔒 Security Best Practices

### Token Management
- ✅ Use System User tokens (long-lived)
- ✅ Store tokens encrypted
- ✅ Rotate tokens periodically
- ✅ Never log tokens
- ✅ Use HTTPS only

### Webhook Security
- ✅ Verify webhook signature
- ✅ Use strong verify token
- ✅ Validate payload structure
- ✅ Return 200 immediately
- ✅ Process async

### Rate Limiting
- ✅ Respect messaging limits
- ✅ Implement exponential backoff
- ✅ Monitor quality rating
- ✅ Batch when possible

---

## 📊 Health Check Indicators

### Green (Healthy)
- ✅ Token valid
- ✅ Quality rating = GREEN
- ✅ Webhook receiving events
- ✅ Messages sending successfully
- ✅ All permissions granted

### Yellow (Warning)
- ⚠️ Quality rating = YELLOW
- ⚠️ Approaching rate limit
- ⚠️ Token expiring soon (< 7 days)
- ⚠️ Occasional send failures

### Red (Critical)
- 🚨 Token invalid/expired
- 🚨 Quality rating = RED
- 🚨 Webhook not receiving events
- 🚨 Phone number restricted
- 🚨 Consecutive send failures
- 🚨 Permission revoked

---

## 🧪 Testing Checklist

### Pre-Production
- [ ] Test with Meta test numbers
- [ ] Verify webhook delivery
- [ ] Test all message types
- [ ] Test error scenarios
- [ ] Validate rate limiting
- [ ] Check quality rating

### Production
- [ ] Monitor first 100 messages
- [ ] Check delivery rates
- [ ] Monitor quality rating
- [ ] Verify webhook stability
- [ ] Track error rates

---

## 📚 Official Resources

- [WhatsApp Business Platform Docs](https://developers.facebook.com/docs/whatsapp)
- [Cloud API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
- [Webhooks Guide](https://developers.facebook.com/docs/graph-api/webhooks/getting-started)
- [Error Codes](https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes)
- [Rate Limits](https://developers.facebook.com/docs/whatsapp/cloud-api/overview#throughput)

---

## 🔧 Useful Tools

### Graph API Explorer
https://developers.facebook.com/tools/explorer/

### Webhook Tester
https://webhook.site/

### Meta Business Suite
https://business.facebook.com/

---

**Last Updated**: 2026-02-05  
**API Version**: v18.0  
**Status**: Production Ready
