# JeevanSetu Pilot Support & User Training Guide

## 1. Support Operations Desk

### Contact Channels:
- **Pilot Technical Support Helpline**: Toll-Free / Direct Extension `[TBD for live pilot]`
- **Dedicated Field Email**: `pilot-support@jeevansetu.gov.in` `[TBD]`
- **Operating Hours**: 07:30 to 19:30 IST (Monday through Saturday); On-Call for SEV-1 emergencies 24/7.

---

## 2. Issue Severity Classification & Response Targets

| Severity | Definition & Examples | Response Target | Resolution Target | Escalation Role |
|---|---|---|---|---|
| **SEV-1 (Critical)** | System outage, 108 emergency routing failure, referral creation crash, auth failure affecting all users. | $< 15$ Minutes | $< 2$ Hours | System Owner & Security Owner |
| **SEV-2 (High)** | Single PHC cannot access dashboard, medicine inventory update fails, delayed SMS notifications. | $< 30$ Minutes | $< 6$ Hours | Backend Owner & Database Owner |
| **SEV-3 (Medium)** | Non-blocking UI glitch, slow report generation, localized translation error in single card. | $< 2$ Hours | $< 24$ Hours | Frontend Owner & QA Owner |
| **SEV-4 (Low)** | General usability question, feature request, cosmetic layout tweak. | $< 8$ Hours | Next Minor Release | Documentation Owner |

---

## 3. Basic Troubleshooting Runbooks for Field Staff

### Problem 1: "Cannot log in to PHC Dashboard"
1. Verify device has active internet connectivity (Wi-Fi or 4G cellular).
2. Ensure phone number and password are entered without leading zeroes or spaces.
3. If error persists, click "Forgot Password" or contact District Admin desk to verify account active status.

### Problem 2: "Medicine stock shows red alert badge"
1. Check current inventory count against physical dispensary shelf stock.
2. If stock was physically received, use "Restock Medicine" button to enter new batch number and quantity.
3. If stock is genuinely exhausted, initiate replenishment request to District Warehouse.

### Problem 3: "Referral status not updating after patient departed"
1. Verify destination hospital staff have logged in and acknowledged receipt.
2. In case of network failure at destination facility, contact hospital triage desk directly and use manual status update button.

---

## 4. Role-Specific User Quick Guides

### A. Patient & Caregiver Quick Guide
- **Track Referral**: Log in with registered mobile number $\rightarrow$ Click "My Referrals" $\rightarrow$ View 6-stage status timeline.
- **Get Health Tips**: Navigate to "Health Awareness" or dial IVR hotline $\rightarrow$ Select preferred language.
- **Submit Feedback**: Click "Feedback" $\rightarrow$ Rate facility service $\rightarrow$ Check "Submit Anonymously" if privacy desired.

### B. PHC Staff Quick Guide
- **Register Patient & Case**: Click "New Patient" $\rightarrow$ Enter mobile number & vitals $\rightarrow$ Record primary symptoms $\rightarrow$ Save case.
- **Create Specialty Referral**: Open Patient Case $\rightarrow$ Click "Initiate Referral" $\rightarrow$ Select specialty & destination hospital $\rightarrow$ Select transport mode.
- **Dispense Medicine**: Navigate to "Medicine Inventory" $\rightarrow$ Select prescribed item $\rightarrow$ Click "Record Usage" $\rightarrow$ Enter quantity consumed.

### C. Doctor Quick Guide
- **Review Tele-Consultation**: Open "Assigned Cases" $\rightarrow$ Inspect recorded vitals and past medical history $\rightarrow$ Record clinical notes & recommendations.

### D. Hospital Staff Quick Guide
- **Triage Inbound Referral**: Open "Inbound Referrals" $\rightarrow$ Click "Accept Referral" $\rightarrow$ Allocate specialty bed $\rightarrow$ Confirm patient arrival upon ambulance transit.
- **Complete Treatment**: Once secondary care is completed, click "Record Treatment" $\rightarrow$ Set follow-up instructions $\rightarrow$ Mark referral completed.

### E. NGO Transport Staff Quick Guide
- **Assign Ambulance**: Open "Transport Queue" $\rightarrow$ Assign driver and vehicle number $\rightarrow$ Mark "Departed" upon patient pickup $\rightarrow$ Mark "Arrived" at hospital.

### F. District Admin Quick Guide
- **Surveillance Desk**: Open "Early Warning Surveillance" $\rightarrow$ Review flagged epidemiological signals $\rightarrow$ Log investigation notes.
- **Audit Logs**: Navigate to "Security Audit Logs" $\rightarrow$ Filter by facility, action, or date range.
