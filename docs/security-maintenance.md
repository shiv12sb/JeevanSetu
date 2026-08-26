# JeevanSetu Security Maintenance & Operational Hygiene Guide

## 1. Scope & Objective
This document outlines the regular security maintenance procedures, credential rotation schedules, dependency patch policies, and access control audit checklists for the JeevanSetu platform.

---

## 2. Credential & Secret Rotation Schedule

| Secret / Credential | Storage Location | Rotation Frequency | Rotation Procedure | Impact / Downtime |
|---|---|---|---|---|
| **Supabase JWT Secret** | PaaS Environment (`JWT_SECRET`) | Every 180 Days | 1. Update in Supabase Auth Settings.<br>2. Update in Backend PaaS.<br>3. Restart API instances. | Active user sessions will be required to re-authenticate ($< 1$m). |
| **Supabase Service Role Key** | Backend `.env` only (NEVER frontend) | Every 180 Days | 1. Generate new key in Supabase API dashboard.<br>2. Deploy new backend environment variable.<br>3. Invalidate old key. | Zero downtime if deployed via rolling restart. |
| **n8n Inbound Webhook Secret** | PaaS `N8N_WEBHOOK_SECRET` | Every 90 Days | 1. Update secret in n8n credential store.<br>2. Update backend env variable.<br>3. Validate HMAC signature tests. | $< 1$ minute queue delay for outbox dispatches. |
| **Database Master Password** | Supabase Project Settings | Every 365 Days | 1. Reset password in database settings.<br>2. Update `DATABASE_URL` in backend secrets. | Rolling restart of backend container. |

---

## 3. Dependency Management & Vulnerability Patching

### Security Patching Protocol:
1. **Weekly Automated Scan**: Run `npm audit` across both `backend/` and `frontend/`.
2. **Severity Thresholds**:
   - **Critical / High**: Must be patched and deployed within 48 hours.
   - **Moderate**: Must be evaluated and included in the next scheduled minor release.
   - **Low**: Included during standard quarterly dependency cleanups.
3. **Breaking Dependency Upgrades**:
   - Major framework upgrades (e.g., Next.js, Express, React) must be tested on a dedicated staging branch with full regression test verification before merging.

---

## 4. Server-Side RBAC & Row-Level Security (RLS) Review Checklist

Every quarter, the Security Owner and Database Owner must verify:
- [ ] **100% RLS Coverage**: Ensure all tables in `supabase/migrations/` have `ROW LEVEL SECURITY` enabled.
- [ ] **Zero Public Bypass**: Verify that no policy uses `USING (true)` for write operations on sensitive tables.
- [ ] **Server-Side Role Authority**: Confirm that `req.role` is derived from trusted database profiles and not client-supplied headers or tokens.
- [ ] **IDOR Boundaries**: Verify that patient case endpoints enforce `profile_id` ownership checks and facility endpoints enforce `assigned_phc_id` / `assigned_hospital_id`.

---

## 5. Security Event Monitoring & Threat Response

The Express API monitors suspicious security events via [`metrics.service.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/services/observability/metrics.service.js):
- **Auth Failure Spike**: Triggered if failed login attempts exceed 50 per 5-minute window.
- **Webhook Signature Mismatch**: Triggered if HMAC SHA-256 signatures fail verification.
- **Replay Attack Detection**: Triggered if nonce or timestamp drift exceeds $\pm 5$ minutes.
- **Rate Limit Trigger**: Sliding window blocks IPs exceeding route thresholds (e.g., 30 requests/15m for auth routes).

### Immediate Response Action:
1. Inspect IP address and source user agent in structured logs.
2. If malicious, add IP to Edge WAF / CDN blocklist (Cloudflare / AWS WAF).
3. Record incident timeline in [`docs/incident-response.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/incident-response.md).
