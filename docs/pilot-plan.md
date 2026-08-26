# JeevanSetu Controlled Pilot Deployment Plan

## 1. Pilot Objectives
The primary objective of the **JeevanSetu Controlled Pilot Deployment** is to evaluate the platform's clinical usability, care continuity workflows, and rural operational resilience in a controlled real-world health setting prior to wide-scale district rollout.

---

## 2. Pilot Scope & Cohort Definition

| Dimension | Pilot Parameter | Description & Constraints |
|---|---|---|
| **Target Geography** | Rural Block (e.g. Ashti / Aheri Block, Gadchiroli District) `[TBD based on final MOU]` | 2–5 Primary Health Centres (PHCs) and 1 Sub-District / Civil Hospital. |
| **Participating Facilities** | - Ashti Primary Health Centre `[TBD]`<br>- Aheri Health Centre `[TBD]`<br>- Gadchiroli Sub-District Hospital `[TBD]` | Primary care intake, medicine dispensation, and secondary specialist triage. |
| **Target User Cohorts** | - PHC Medical Officers & Staff (10–15 users)<br>- Hospital Triage Staff (4–6 users)<br>- NGO Transport Drivers (3–5 vehicles)<br>- Rural Patients & Caregivers (100–300 walk-ins)<br>- District Health Officers (2 admins) | Real users operating with consent and synthetic test shadow parallel logging. |
| **Pilot Duration** | **30 Calendar Days** | Divided into: Week 1 (Onboarding), Weeks 2-3 (Active Operations), Week 4 (Review). |

---

## 3. Scope of Evaluated Workflows

1. **Patient Intake & Vitals Recording**: Walk-in registration, digital case creation, and vitals tracking at participating PHCs.
2. **Closed-Loop Specialty Referrals**: Initiation of secondary care transfers from PHCs to Civil Hospital with transport coordination.
3. **Medicine Inventory Dispensation**: Atomic stock consumption logging and depletion forecasting for essential PHC drugs.
4. **Community IVR Hotline**: Toll-free voice health guidance and callback requests for feature-phone citizens.
5. **Citizen Feedback Collection**: Both authenticated and anonymous patient service ratings.
6. **District Public Health Surveillance**: Daily anomaly tracking and early warning signal reviews by District Health Officers.

---

## 4. Success vs. Failure Criteria

### Success Criteria (Must meet all):
- **Care Continuity Rate**: $\ge 85\%$ of initiated specialty referrals successfully tracked to hospital arrival or treatment completion.
- **Stock Discrepancy**: Zero negative inventory balance occurrences (`current_quantity < 0`).
- **Emergency Safety**: 100% of acute emergency symptom queries immediately routed to 108 ambulance dispatch.
- **Platform Availability**: Backend API uptime $\ge 99.5\%$ during primary OPD hours (08:00 to 18:00 IST).
- **User Satisfaction**: $\ge 80\%$ positive feedback from participating PHC and hospital staff on ease of use.

### Failure / Rollback Trigger Criteria:
- Any clinical misguidance or prescriptive drug error caused by automated AI systems.
- Any failure or delay in 108 emergency preemption routing.
- Sustained backend API outage $> 4$ continuous hours without automated recovery.
- Any security breach or unauthorized access to patient medical records.

---

## 5. Pilot Data Privacy & Hygiene Policy

- **Shadow Parallel Logging**: During initial 14 days, participating PHCs maintain parallel standard physical paper registers alongside digital entries.
- **Data Minimization**: Phone numbers are masked in all staff dashboard views (`+91 98XXX XX04`).
- **No Unencrypted Storage**: Local tablet caching must not store unencrypted clinical identifiers in plain web storage.
