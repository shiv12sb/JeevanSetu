# JeevanSetu Incident Detection & Subsystem Ownership Matrix

## 1. Subsystem Incident Detection Matrix

| Subsystem | Primary Detection Signal | Alert Trigger Condition | Responsible Role Owner | First Response Action | Escalation Role |
|---|---|---|---|---|---|
| **Core API & Gateway** | `/api/health/live` returns 500 or timeout | 3 consecutive probe failures | **Backend Owner** | Restart container; inspect memory. | System Owner |
| **PostgreSQL Database** | `/api/health/ready` returns 503 | DB connection pool exhausted | **Database Owner** | Failover to standby; verify pooler. | System Owner |
| **Authentication (JWT)** | Login endpoint 5xx spike ($> 20$/5m) | Auth failure error rate $> 10\%$ | **Security Owner** | Verify JWT secret & token validity. | Backend Owner |
| **AI Clinical Triage** | Chat fallback activation rate $> 30\%$ | Upstream LLM response timeout | **AI Safety Owner** | Verify safe fallback; check API quota. | System Owner |
| **IVR Voice Telephony** | Webhook 5xx or signature rejection spike | Inbound carrier delivery drop | **Telephony Owner** | Verify HMAC secret; check SIP trunk. | Backend Owner |
| **Outbox Automation** | `outbox_events` pending count $> 100$ | n8n webhook connection failure | **Backend Owner** | Restart n8n container; sweep queue. | Operations Owner |
| **Medicine Inventory** | Negative balance constraint error | Concurrent dispensation conflict | **Database Owner** | Verify single-row lock constraints. | Backend Owner |
| **Care Referrals** | Hospital acceptance timeout $> 24$h | Referral milestone delay | **Operations Owner** | Escalate to District Nodal Officer. | System Owner |
