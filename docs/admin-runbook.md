# JeevanSetu District Health Administrator Operational Runbook

## 1. Governance & Supervisory Scope
District Health Administrators oversee all Primary Health Centres, Sub-Centres, and secondary referral hospitals across the district.

---

## 2. Daily Supervisory Workflows

### 1. Operations & Health Overview
1. Log in with `district_admin` role credentials.
2. Review `/admin/operations`:
   - Active PHC counts and daily consultation totals.
   - 6-stage referral pipeline throughput.
   - Background worker job health status and stuck job alerts.

### 2. Medicine Inventory & Stockout Prevention
1. Navigate to `/inventory` (District View).
2. Inspect medicines with `HIGH` or `CRITICAL` stockout risk.
3. Review projected 7-day and 30-day depletion timelines.
4. Authorize inter-facility stock transfers or trigger district warehouse replenishment.

### 3. Epidemiological Surveillance & Early Warning
1. Open `/admin/early-warning` daily at 09:00 and 16:00.
2. Review aggregated fever, diarrheal, and respiratory signal anomalies.
3. Note: Small clusters ($< 3$ cases) are masked for patient privacy protection.
4. If an anomaly exceeds confidence threshold $\ge 0.75$:
   - Click **Acknowledge Alert**.
   - Assign field surveillance team (District Epidemiologist / ASHA supervisors).
   - Log review notes and action items in audit trail.

### 4. Citizen Feedback & Service Quality Desk
1. Open `/admin/feedback`.
2. Inspect overall citizen satisfaction index (Average Rating $\ge 4.2 / 5.0$).
3. Review categorized feedback trends (Wait Times, Cleanliness, Doctor Availability).
4. Note: Anonymous feedback records contain isolated UUID tracking tokens with zero caller identity linkage.

### 5. Audit Log Inspection & Security Review
1. Open `/admin/operations` $\rightarrow$ **Security Audit Trail**.
2. Filter for critical security actions:
   - `AUTH_FAILURE_SPIKE`
   - `INVENTORY_THRESHOLD_UPDATED`
   - `ROLE_CHANGE_ATTEMPT`
   - `AI_EMERGENCY_ESCALATION`
3. Export compliance audit snapshots on a monthly basis.
