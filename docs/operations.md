# JeevanSetu Production Operations & Reliability Guide

## 1. Core Operating Principles & Invariants
> **"Observability must never become a source of sensitive healthcare data leakage."**
> **"Backups and recovery procedures must never be claimed as operationally available unless they have actually been configured and verified."**

JeevanSetu's observability and monitoring subsystem is built on strict data minimization, structured telemetry, deterministic failure handling, and decoupled resilience.

---

## 2. Structured Logging & Tracing

### Log Format
All API and background operations emit structured JSON logs:
```json
{
  "timestamp": "2026-08-25T12:00:00.000Z",
  "level": "INFO",
  "service": "jeevansetu-api",
  "environment": "production",
  "message": "HTTP_REQUEST: GET /api/cases 200 - 42ms",
  "request_id": "req-1771934400-a1b2c3d4",
  "route": "/api/cases",
  "method": "GET",
  "status_code": 200,
  "duration_ms": 42,
  "user_role": "phc_staff"
}
```

### Log Levels
- **`DEBUG`**: Detailed diagnostic traces (disabled in production to prevent log bloat).
- **`INFO`**: Standard transactional and lifecycle events.
- **`WARN`**: Slow requests ($> 1000$ms), rate-limit events, degraded provider fallbacks, or stuck background jobs.
- **`ERROR`**: Caught server errors, unexpected database issues, or unhandled exceptions.

### Data Redaction Rules
The logger automatically intercepts and sanitizes payload fields before serialization:
- `password`, `token`, `secret`, `api_key`, `apiKey`, `authorization` $\rightarrow$ `[REDACTED]`
- Indian Phone Numbers $\rightarrow$ Masked to format `+91 98XXX XX04`
- ABHA IDs / Aadhaar Numbers $\rightarrow$ `[REDACTED]`

---

## 3. Health & Probes Architecture

JeevanSetu exposes three standard health endpoints under `/api/health`:

1. **`GET /api/health`** (Unified Overview):
   Returns overall operational status, service name, version, and uptime.
2. **`GET /api/health/live`** (Liveness Probe):
   Answers: *"Is the process alive?"*
   Returns `200 OK` as long as the Node.js runtime is executing.
3. **`GET /api/health/ready`** (Readiness Probe):
   Answers: *"Can this instance safely serve requests?"*
   Evaluates:
   - PostgreSQL / Supabase connection latency
   - Background job runner execution state
   - Provider availability status (SMS, Email, Telephony, Weather, Pharmacy, n8n)
   - Degraded mode features list (if optional providers are unavailable, core APIs remain ready).

---

## 4. Error Classification Taxonomy

All API error responses adhere to standard structure:
```json
{
  "success": false,
  "message": "User-safe error explanation.",
  "error": {
    "code": "VALIDATION_ERROR",
    "status": 400,
    "request_id": "req-1771934400-a1b2c3d4"
  }
}
```

Standard classifications:
- `VALIDATION_ERROR` (HTTP 400): Schema or parameter violation.
- `AUTHENTICATION_ERROR` (HTTP 401): Missing or expired credentials.
- `AUTHORIZATION_ERROR` (HTTP 403): Role or RLS access denied.
- `NOT_FOUND` (HTTP 404): Resource missing.
- `RATE_LIMITED` (HTTP 429): Request volume exceeded limit.
- `DATABASE_ERROR` (HTTP 500): Database query failure (sanitized in production).
- `EXTERNAL_PROVIDER_ERROR` (HTTP 502/503): External gateway error.
- `AI_PROVIDER_ERROR` (HTTP 502/503): AI inference provider failure (deterministic fallback activated).
- `TIMEOUT` (HTTP 504): Upstream or query timeout.
- `INTERNAL_ERROR` (HTTP 500): Catch-all internal error.

---

## 5. Background Job Monitoring & Stuck Job Detection

Every scheduled background job (`outboxWorkerJob`, `inventoryAlertSweep`, `forecastingSweep`, `earlyWarningSweep`, etc.) is wrapped by `jobMonitorService`:
- Starts tracking duration and transitions status to `RUNNING`.
- On completion: Records duration, outcome (`COMPLETED` or `FAILED`), and appends to execution history.
- **Stuck Job Detector**: Jobs active for longer than `JOB_STUCK_THRESHOLD_MS` (default 5 minutes) are flagged as `STUCK`, emitting a deduplicated alert.

---

## 6. Alert Deduplication Strategy

To prevent alert storming during outages:
- Alerts are identified by unique **fingerprints** (e.g. `job_stuck_InventoryAlertSweep`, `database_unavailable`).
- Configurable cooldown window (default 60 seconds) suppresses identical repeated notifications.

---

## 7. Release Engineering & Operational Incident Escalation (Phase 31)

- **Release Runbook**: Follow the 10-step deployment sequence and sign-off checklist in [`docs/release-checklist.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/release-checklist.md).
- **Incident Escalation**: Follow severity classifications (SEV-1 to SEV-4) and containment procedures in [`docs/incident-response.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/incident-response.md).

---

## 8. Phase 36 Production Observation & Stability Verification

- **Production Health Verification**: Active health probes (`/api/health`, `/api/health/live`, `/api/health/ready`) confirmed operational with graceful degradation for optional providers.
- **Incident Summary**: 0 P0/P1/P2/P3 unhandled incidents detected.
- **Observability Invariant**: No unconfigured external cloud drains or carrier telemetries claimed; unconfigured providers return `NOT VERIFIED` without fabricated numbers.
- **Regression Suite**: 11 unified test suites passing 499 / 499 tests.
