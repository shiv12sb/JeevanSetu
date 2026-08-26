# JeevanSetu User Support & Troubleshooting Runbook

## 1. Support Principles
- **Patient Safety First**: If a user reports life-threatening medical distress, immediately direct them to call **108** or visit their nearest Primary Health Centre.
- **Role-Based Support Triage**: Tailored workflows for Patient, PHC Staff, Doctor, Hospital Staff, NGO Staff, and District Administrator.

---

## 2. Role-Based Support Workflows

### A. Patient Support
| Common Issue | First Troubleshooting Step | Fallback / Workaround | Escalation |
|---|---|---|---|
| **Cannot log in (OTP/Password)** | Verify 10-digit Indian phone number format (`+91`). | Use magic link or password reset. | Helpdesk Tier 1 |
| **Referral status not updating** | Refresh referral timeline; verify patient ID matches. | Call local PHC for verbal status. | PHC Staff Lead |
| **Feedback token lost** | Search SMS history for `JS-FB-` tracking token. | Re-submit feedback or ask PHC desk. | PHC Support Desk |

### B. PHC Staff Support
| Common Issue | First Troubleshooting Step | Fallback / Workaround | Escalation |
|---|---|---|---|
| **Internet connectivity down** | Switch to offline paper triage register. | Re-enter records once connectivity restores. | Facility Medical Officer |
| **Cannot record medicine usage** | Check if medicine is registered under assigned PHC. | Request District Admin to add medicine. | District Pharmacist |
| **Callback queue not loading** | Clear browser cache; check `/api/health/ready`. | Check manual IVR log sheet. | Backend Owner |

### C. Doctor Support
| Common Issue | First Troubleshooting Step | Fallback / Workaround | Escalation |
|---|---|---|---|
| **Consultation notes not saving** | Check active session JWT token (re-login if expired). | Copy notes to temporary text file. | Backend Owner |
| **Cannot view referred patient case**| Verify referral is assigned to current PHC/Hospital. | Request triage re-assignment. | PHC Staff Lead |

### D. Hospital Staff Support
| Common Issue | First Troubleshooting Step | Fallback / Workaround | Escalation |
|---|---|---|---|
| **Cannot find inbound referral** | Search by 6-digit Referral ID or Patient Name. | Contact originating PHC staff. | Hospital Administrator |
| **Bed allocation mismatch** | Update bed status in referral modal. | Coordinate via internal hospital phone. | Triage Lead |

### E. NGO Staff Support
| Common Issue | First Troubleshooting Step | Fallback / Workaround | Escalation |
|---|---|---|---|
| **Driver transit update failing** | Verify GPS permissions; re-submit status. | Call PHC desk with ETA update. | Transport Coordinator |
| **Patient not found at pickup** | Contact patient phone or local ASHA worker. | Log transport exception in app. | PHC Staff Lead |

### F. District Health Administrator Support
| Common Issue | First Troubleshooting Step | Fallback / Workaround | Escalation |
|---|---|---|---|
| **Early warning alert unacknowledged** | Review incident threshold and taluka breakdown. | Authorize field inspection team. | District Health Officer |
| **Audit log export timeout** | Filter query by specific 7-day date range. | Contact Database Admin for dump. | Database Owner |

---

## 3. IVR & Feature Phone Citizen Support
- **Toll-Free Helpline**: Configured with automated voice menus in English, Hindi, and Marathi.
- **Missed-Call Flow**: Citizen places missed call $\rightarrow$ system queues callback within 15 minutes.
- **Direct Emergency Route**: Pressing `0` or reporting emergency keywords immediately triggers 108 referral advisory.
