# JeevanSetu Testing Strategy & Regression Policy

## 1. Testing Philosophy & Standards
JeevanSetu employs a unified automated testing approach across all backend services, database migrations, security middleware, and frontend builds. The test harness guarantees that no clinical safety rule, access boundary, or data integrity invariant can silently regress.

---

## 2. Test Pyramid & Directory Structure

```
backend/tests/
├── run_all.js                                # Master unified test suite runner
├── phase26_citizen_feedback.test.js          # Feedback anonymity & category tests
├── phase27_early_warning.test.js             # Epidemiological anomaly & small-sample tests
├── phase28_automation_n8n.test.js            # Outbox pattern & webhook HMAC tests
├── phase29_observability_reliability.test.js # Metrics, error tracing & health probes
├── phase30_security_hardening.test.js        # RBAC, RLS, IDOR & rate limiting tests
├── phase31_deployment_release.test.js        # Release candidate scenarios A-T
├── phase32_final_qa_uat.test.js              # Full 6-role UAT journeys & edge cases
├── phase33_release_candidate.test.js         # Release candidate freeze verification
├── phase34_operations_readiness.test.js      # Operations, DR runbooks & backup tests
├── phase35_launch_rehearsal.test.js          # Launch rehearsal across 6 user journeys
├── phase36_production_hardening.test.js      # Production observation & stability tests
└── phase37_governance_handover.test.js       # Long-term governance & maintenance tests
```

---

## 3. Mandatory Regression Policy by Subsystem

When submitting changes to a specific subsystem, the following test suites MUST be executed and pass with 100% success before merging:

| Modified Subsystem | Mandatory Test Suites | Key Verification Areas |
|---|---|---|
| **Authentication & RBAC** | `auth.test.js`, `phase30_security_hardening.test.js`, `phase36_production_hardening.test.js` | JWT verification, cross-role privilege escalation prevention, expired token handling. |
| **Referrals & Care Continuity** | `phase11_referral_followup.test.js`, `phase19_referral_continuity.test.js`, `phase32_final_qa_uat.test.js` | 6-stage lifecycle transitions, facility scoping, hospital acceptance. |
| **Medicine Supply Chain** | `phase14_supply_chain.test.js`, `phase20_stockout_prediction.test.js`, `phase23_inventory_forecasting.test.js` | Atomic stock reduction, negative balance prevention (`current_quantity >= 0`), restock ledger. |
| **AI Advisory Guidance** | `phase8_ai.test.js`, `phase33_release_candidate.test.js`, `phase36_production_hardening.test.js` | Structured JSON output, non-diagnostic framing, deterministic fallback activation. |
| **IVR Telephony & DTMF** | `phase12_ivr.test.js`, `phase24_ivr_update.test.js`, `phase35_launch_rehearsal.test.js` | 6 DTMF menus, retry attempt limit, immediate 108 emergency preemption. |
| **Surveillance & Early Warning**| `phase10_early_warning.test.js`, `phase17_early_warning.test.js`, `phase27_early_warning.test.js` | Anomaly score calculation, small-sample privacy masking ($< 3$ cases). |
| **Automation & Outbox** | `phase28_automation_n8n.test.js`, `phase31_deployment_release.test.js` | Outbox event creation, HMAC SHA-256 signatures, decoupled operation when n8n offline. |
| **Frontend UI Pages** | `npm run build` in `frontend/` | Next.js compilation, static route generation across all 32 routes, zero TypeScript/syntax errors. |

---

## 4. Test Execution Guidelines

- **Run All Tests**:
  ```bash
  cd backend && npm test
  ```
- **Run Frontend Smoke Test**:
  ```bash
  cd frontend && npm run build
  ```
- **Execution Mode**: All tests must execute in single-run, non-interactive CI mode with bounded timeouts ($< 10$s per suite).
