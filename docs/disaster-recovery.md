# JeevanSetu Disaster Recovery & Backup Runbook

## 1. Core Principles & Safety Invariants
> **"Backups and recovery procedures must never be claimed as operationally available unless they have actually been configured and verified."**
> **"Never execute destructive database restore operations automatically. All database restore procedures must remain explicit, audited manual operations with pre-restore snapshots."**

---

## 2. Backup Strategy (PostgreSQL / Supabase)

### Automated Snapshots
- **Primary Source**: Managed Supabase PostgreSQL automated daily backups with Write-Ahead Logging (WAL) for Point-In-Time Recovery (PITR) up to 7 days in production.
- **Retention**: 7 to 30 days depending on operational tier.
- **Manual Backups**: Before applying major database schema migrations (e.g. `pg_dump -Fc` snapshot).

### Verification Procedure
1. Perform test restoration to an isolated staging / test instance once per quarter.
2. Verify table count, Row Level Security (RLS) policies, and foreign key integrity.
3. Validate application startup against the restored staging database.

---

## 3. Disaster Recovery Runbooks by Outage Scenario

### Scenario 1: Database Outage / Connection Loss
- **Detection**: `/api/health/ready` probe returns `503 Service Unavailable` with `dependencies.database.status = "UNAVAILABLE"`.
- **Containment**:
  1. Express API enters degraded read mode where possible.
  2. Transactional outbox queues events in memory/failover buffer.
- **Recovery**:
  1. Inspect Supabase project status and connection pooler health (PgBouncer/Supavisor).
  2. Verify database connection string and environment variables.
  3. If catastrophic database corruption occurs, initiate manual PITR restore via Supabase dashboard to last known good timestamp.
- **Verification**:
  1. Query `SELECT count(*) FROM public.phcs;` to verify data availability.
  2. Confirm `/api/health/ready` returns `200 OK`.

### Scenario 2: Backend Process Failure / Crash
- **Detection**: `/api/health/live` probe fails or container orchestrator restarts instance.
- **Containment**: Container orchestrator (Docker/Kubernetes) triggers auto-restart.
- **Recovery**:
  1. Inspect structured error logs for unhandled exception or memory limit breach.
  2. Verify environment configuration (`env.js`).
  3. Restart process instance (`npm start` or container restart).
- **Verification**:
  1. Verify `/api/health/live` returns `{ status: "HEALTHY", process: "alive" }`.
  2. Confirm background job worker initializes and logs start banner.

### Scenario 3: Optional n8n Orchestrator Outage
- **Detection**: `/api/health/ready` reports `dependencies.n8n.status = "UNAVAILABLE"`.
- **Containment**:
  1. Core JeevanSetu backend continues operating normally as the source of truth.
  2. Events remain queued in `outbox_events` table with status `RETRYING` or `PENDING`.
- **Recovery**:
  1. Restart n8n container instance.
  2. Verify webhook URL and `N8N_WEBHOOK_SECRET`.
- **Verification**:
  1. Trigger Outbox worker sweep (`POST /api/automation/events/trigger-worker`).
  2. Confirm pending events transition to `SENT`.

### Scenario 4: External SMS / Telephony Gateway Outage
- **Detection**: Notification dispatch logs `GATEWAY_ERROR` or `PROVIDER_NOT_CONFIGURED`.
- **Containment**:
  1. Critical clinical updates remain visible via in-app notifications.
  2. Outbox event worker applies exponential backoff and retries automatically.
- **Recovery**:
  1. Switch to secondary SMS gateway provider or contact telecom aggregator (CDAC/Twilio).
- **Verification**:
  1. Dispatch test SMS from `/admin/operations` and verify delivery status.

### Scenario 5: AI Provider Outage (Groq / OpenAI API down)
- **Detection**: AI endpoint calls return HTTP 502/503 or timeout.
- **Containment**:
  1. Automatic fallback activated: deterministic rule-based algorithms generate safe summaries and structured advice.
  2. No operations are blocked.
- **Recovery**:
  1. Inspect API keys and provider quota.
- **Verification**:
  1. Verify `ai_fallbacks_total` counter in `/api/operations/metrics`.

---

## 4. Migration Safety & Rollback Guidelines

- **Forward-Only Schema Design**: New columns should have safe defaults (`DEFAULT NOW()`, `DEFAULT '{}'::jsonb`) and allow `NULL` during rollout to prevent breaking running backend instances.
- **Pre-Migration Snapshot**: Always take an automated snapshot before executing migration scripts.
- **Rollback Limitations**: Schema migrations adding new tables/indexes are non-destructive, but destructive column drops must be executed in separate scheduled maintenance windows after code retirement.

---

## 5. Pre-Release Backup Checklist & Post-Deployment Rollback Execution (Phase 31)
- **Pre-Release Snapshot**: Always verify a fresh automated snapshot exists prior to executing migrations.
- **Instant Frontend/Backend Rollback**: Revert to the prior git commit SHA or container tag on the host platform without waiting for database changes.
- **Database Forward-Migration Invariant**: In case of schema issues, roll forward by deploying a remedial migration script (`20260822000023_...sql`) rather than running destructive rollbacks on live patient data.

