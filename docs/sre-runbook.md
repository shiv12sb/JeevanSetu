# JeevanSetu SRE Production Runbook & Failure Recovery

## 1. Quick-Reference Recovery Runbooks

### Runbook 1: Primary Database Outage (CRITICAL)
- **Symptoms**: `/api/health/ready` returns 503; error logs show database connection timeouts.
- **Checks**:
  1. Inspect PostgreSQL cluster status on Supabase dashboard.
  2. Check connection pool exhaustion (PgBouncer client count).
- **Containment & Recovery**:
  1. If primary node failed, initiate automatic or manual failover to hot standby.
  2. Update backend `DATABASE_URL` environment variable if connection endpoint shifted.
  3. Restart backend API container instances.
- **Verification**: Ensure `GET /api/health/ready` returns `ready_to_serve: true`.

---

### Runbook 2: Upstream AI Provider Outage (HIGH)
- **Symptoms**: AI chat endpoint latency exceeds 5000ms; HTTP 502/504 errors from LLM API.
- **Checks**: Verify cloud LLM status page and account quota.
- **Containment & Recovery**:
  1. Confirm that `ai.service.js` deterministic fallback is actively serving localized safe cards.
  2. Switch to secondary cloud model adapter via runtime environment variables if available.
- **Verification**: Test `/api/ai/chat` and verify structured emergency guidance without server crash.

---

### Runbook 3: n8n Orchestrator / Webhook Outage (MEDIUM)
- **Symptoms**: Outbox worker logs show connection refused or HTTP 500 from n8n webhook.
- **Checks**: Inspect n8n container health and memory usage.
- **Containment & Recovery**:
  1. Core clinical intake and referral creation proceed uninterrupted.
  2. Restart n8n container service.
  3. Run batch outbox sweep to process accumulated `PENDING` events.
- **Verification**: Check `outbox_events` table for decreasing pending queue count.

---

### Runbook 4: Bad Application Deployment (CRITICAL)
- **Symptoms**: Elevated 500 error rates ($> 10\%$) or frontend runtime blank screens.
- **Containment & Recovery**:
  1. Instantly roll back frontend deployment in Vercel to previous immutable build ($< 1$m RTO).
  2. Re-deploy previous Docker container image tag for backend API ($< 3$m RTO).
  3. If database schema was modified, deploy additive forward-fix migration.
- **Verification**: Run smoke test across login, cases, and inventory endpoints.
