# JeevanSetu Quality Assurance & Regression Verification Guide

## 1. QA Strategy & Methodology

The JeevanSetu QA framework evaluates the healthcare platform as a unified, defense-in-depth system:
- **Defense in Depth**: Verification spans client UI rendering, API gateway security, server-side RBAC, transactional event outboxes, and database PostgreSQL Row Level Security (RLS).
- **Synthetic Test Isolation**: All QA tests utilize strictly synthetic, non-identifiable test accounts, mock medical records, and deterministic fixtures. Live production patient records are never accessed or simulated with real data.
- **Fail-Safe Verifications**: Negative testing explicitly validates permission rejections (HTTP 403), authentication failures (HTTP 401), rate limits (HTTP 429), and non-diagnostic AI boundaries.

---

## 2. Synthetic Test Account Matrix

| Account Identifier | Role | Facility Assignment | Test Purpose & Scope |
|---|---|---|---|
| **`PATIENT_A`** | `patient` | Shirwal PHC | Primary patient workflow, case registration, referral tracking, feedback. |
| **`PATIENT_B`** | `patient` | Bhor PHC | Secondary patient used to test IDOR boundaries against Patient A. |
| **`PHC_STAFF_A`** | `phc_staff` | Shirwal PHC | Case intake, vitals entry, referral initiation, PHC medicine inventory. |
| **`PHC_STAFF_B`** | `phc_staff` | Bhor PHC | Cross-facility IDOR validation (cannot mutate Shirwal PHC inventory). |
| **`DOCTOR_A`** | `doctor` | Shirwal PHC | Clinical consultation, medical case assessment, referral review. |
| **`DOCTOR_B`** | `doctor` | Saswad PHC | Cross-facility clinical privacy boundaries. |
| **`HOSPITAL_STAFF_A`** | `hospital_staff`| Pune District Hospital | Inbound referral intake, bed triage, treatment confirmation. |
| **`HOSPITAL_STAFF_B`** | `hospital_staff`| Satara Civil Hospital | Cross-hospital referral stage isolation. |
| **`NGO_STAFF_A`** | `ngo_staff` | Arogya Vahini NGO | Emergency transport coordination, driver dispatch, transit tracking. |
| **`DISTRICT_ADMIN_A`** | `district_admin` | Pune District | District-wide operations desk, early warning review, audit logs. |

---

## 3. Regression Testing Summary

| Test Suite | Associated Phase | Number of Tests | Pass Rate |
|---|---|---|---|
| `phase26_citizen_feedback.test.js` | Phase 26 (Citizen Feedback) | 60 Tests | 100% (60/60) |
| `phase27_early_warning.test.js` | Phase 27 (Outbreak Intelligence) | 56 Tests | 100% (56/56) |
| `phase28_automation_n8n.test.js` | Phase 28 (Outbox & Orchestration) | 56 Tests | 100% (56/56) |
| `phase29_observability_reliability.test.js` | Phase 29 (Monitoring & Recovery) | 52 Tests | 100% (52/52) |
| `phase30_security_hardening.test.js` | Phase 30 (Security & Privacy) | 60 Tests | 100% (60/60) |
| `phase31_deployment_release.test.js` | Phase 31 (Deployment & CI/CD) | 44 Tests | 100% (44/44) |
| `phase32_final_qa_uat.test.js` | Phase 32 (Final QA & UAT) | 52 Tests | 100% (52/52) |
| `phase33_release_candidate.test.js` | Phase 33 (Release Candidate Hardening) | 45 Tests | 100% (45/45) |
| **CUMULATIVE TEST SUITE TOTAL** | **Platform Verification (8 Suites)** | **425 Tests** | **100% (425/425 PASS)** |

---

## 4. Release Candidate Identifier & Change Freeze Status

- **Release Candidate ID**: `JEEVANSETU-RC-33`
- **Release Version**: `1.0.0`
- **Change Freeze**: ACTIVE. All features, schemas, and configurations locked for release candidate hardening.
- **Defect Count**: 0 P0 / 0 P1 / 0 P2 / 0 P3 remaining.

---

## 5. Known Limitations & Operational Warnings

1. **AI Output Advisory Nature**: All AI summaries and symptom checks are strictly non-diagnostic and provide clinical grounding for rural healthcare workers without substituting licensed clinical judgment.
2. **Deterministic IVR Emergency Bypass**: Acute symptom keywords (chest pain, severe breathlessness) immediately bypass AI inference to provide 108 emergency contact guidance.
3. **Small-Sample Privacy Suppression**: Disease clusters with fewer than 3 observed cases are suppressed in supervisory surveillance views to prevent statistical re-identification of rural patients.
4. **Third-Party Telephony Fallbacks**: When external SMS or Telephony carriers encounter gateway downtimes, events are safely retained in `outbox_events` with exponential backoff retries.

---

## 6. NOT VERIFIED Items (Controlled Exclusions)

In strict accordance with project safety guidelines (*"Do NOT deploy to a real production environment automatically. Do NOT purchase a domain. Do NOT create paid infrastructure."*):
- **Live Paid Cloud Production Deployment**: Excluded from automated CI and verified locally via Docker containers and mock configurations.
- **Physical GSM Telephony Hardware**: Verified using mock telephony adapters and simulated DTMF webhooks.

