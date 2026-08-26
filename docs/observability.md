# JeevanSetu Observability Architecture & Logging Standards

## 1. Observability Asset Inventory

| Logging Channel | Exists | Primary Location | Retention Policy | Sensitivity | Searchability / Tracing |
|---|---|---|---|---|---|
| **Application & API Logs** | Yes | `stdout` / Container log streams | 30 Days (Active) | Internal | Structured JSON with `x-request-id` |
| **Authentication Logs** | Yes | Supabase Auth logs & `audit_logs` | 90 Days | Sensitive | User profile ID & timestamp |
| **Security & Rate-Limit Logs** | Yes | Express middleware logs | 90 Days | Sensitive | Client IP, route, and status |
| **AI Triage Logs** | Yes | `stdout` / `metrics.service.js` | 30 Days | Sensitive | Anonymized tokens (No PII) |
| **IVR Telephony Logs** | Yes | Telephony webhook logs | 30 Days | Sensitive | Masked phone (`+91 98XXX XX04`) |
| **Notification Outbox Logs** | Yes | `outbox_events` table | 90 Days | Sensitive | Event ID, aggregate type, status |
| **Automation / n8n Logs** | Yes | Container logs & outbox status | 30 Days | Internal | Idempotency key & status |
| **Database Audit Logs** | Yes | PostgreSQL `audit_logs` table | 1 Year (Regulatory) | Highly Sensitive | Immutable actor, action, timestamp |

---

## 2. Structured JSON Logging Specification

All platform logs output single-line structured JSON adhering to the following schema:

```json
{
  "timestamp": "2026-08-26T12:00:00.000Z",
  "service": "jeevansetu-backend",
  "environment": "production",
  "request_id": "req-9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "level": "INFO",
  "event_type": "REFERRAL_CREATED",
  "actor_id": "usr-123",
  "phc_id": "phc-1",
  "result": "SUCCESS",
  "duration_ms": 42
}
```

### Log Level Policy:
- **`DEBUG`**: Detailed diagnostic information (disabled in production).
- **`INFO`**: High-level milestone events (user login, case created, referral accepted).
- **`WARN`**: Recoverable anomalies, fallback activations, degraded external dependencies.
- **`ERROR`**: Unhandled exceptions, failed database transactions, webhook auth failures.
- **`FATAL`**: Process crashes or database primary connection failures causing server exit.

---

## 3. PII Masking & Healthcare Data Protection

- **Phone Numbers**: Masked automatically to `+91 98XXX XX04`.
- **Passwords & Tokens**: Redacted automatically to `[REDACTED]`.
- **Health Identifiers**: Clinical notes and ABHA IDs are excluded from operational metrics.
- **Anonymous Feedback**: Tracked purely via `JS-FB-XXXX-XXXX` tokens without user profile linkage.
