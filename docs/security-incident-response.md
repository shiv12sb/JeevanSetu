# JeevanSetu Security & Privacy Incident Response Runbook

## 1. Scope & Objective
This runbook defines the standard operating procedures for identifying, containing, eradicating, and recovering from security anomalies, unauthorized access attempts, and privacy incidents on the JeevanSetu platform.

---

## 2. Security Incident Response Lifecycle

```
[ 1. DETECT ] ──► [ 2. CONTAIN ] ──► [ 3. ERADICATE ] ──► [ 4. RECOVER ] ──► [ 5. POST-MORTEM ]
```

### Stage 1: Detection & Triage
- **Vectors**: Automated health probes, auth failure spikes ($> 50$/5m in `metrics.service.js`), webhook signature mismatches, or suspicious audit log entries.
- **Triage Action**: Assign Incident Commander (Security Owner) and establish secure war room.

### Stage 2: Immediate Containment
1. **Network Layer**: Block offending IP addresses or CIDR blocks at Edge CDN / WAF.
2. **Session Layer**: If credential theft is suspected, revoke user session tokens via Supabase Auth admin console.
3. **Secret Compromise**: If `SUPABASE_SERVICE_ROLE_KEY` or `JWT_SECRET` is exposed, trigger emergency secret rotation procedure ([`docs/security-maintenance.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/security-maintenance.md)).

### Stage 3: Eradication
1. Identify and patch the root cause vulnerability (e.g. flawed input validator, permissive RLS policy).
2. Verify that zero unauthorized backdoors or persistence mechanisms were created.

### Stage 4: Recovery & Verification
1. Deploy forward-fix patch following standard CI/CD verification gates.
2. Validate that health probes (`/api/health/ready`) return `ready_to_serve: true`.
3. Require affected users to re-authenticate with multi-factor or new credentials.

### Stage 5: Post-Mortem & Documentation
1. Document complete incident timeline in [`docs/incident-response.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/incident-response.md).
2. Schedule remediation items in [`docs/technical-debt.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/technical-debt.md).

---

## 3. Privacy Incident & Data Exposure Procedures

| Incident Type | Immediate Containment Protocol | User & Administrative Notification |
|---|---|---|
| **Unauthorized Case Access** | Invalidate active sessions; verify and enforce RLS policy; audit `audit_logs`. | Notify affected patient and Medical Officer with sanitized incident summary. |
| **SMS Content Leakage** | Suspend SMS queue; verify outbox payload masking (`+91 98XXX XX04`); resume queue. | Review SMS gateway logs for delivery scope; notify telecommunications administrator. |
| **Small-Sample Cluster Exposure** | Verify public health surveillance queries enforce threshold $< 3$ cases suppression. | Update dashboard analytics views; notify District Health Officer. |
