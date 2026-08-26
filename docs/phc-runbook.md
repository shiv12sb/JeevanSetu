# JeevanSetu Primary Health Centre (PHC) Operational Runbook

## 1. Introduction & Operating Scope
This concise runbook provides step-by-step operating instructions for Primary Health Centre (PHC) staff, nurses, and medical officers utilizing JeevanSetu in rural health centers.

---

## 2. Daily Workflow Sequence

### 1. Shift Start & Authentication
1. Navigate to `https://jeevansetu.internal/login`.
2. Enter registered phone number / email and secure password.
3. Verify top navigation bar displays assigned PHC facility name (e.g. *Shirwal Primary Health Centre*).

### 2. Patient Intake & Case Creation
1. Click **+ New Health Case** on the PHC dashboard.
2. Enter patient details (Name, Age, Gender, Village, Contact Phone).
3. Record primary symptoms and triage urgency:
   - `LOW`: Routine OPD consultation.
   - `MEDIUM`: Requires doctor consultation today.
   - `HIGH`: Acute distress requiring immediate secondary hospital referral.
4. Record vital signs (Blood Pressure, SpO2 %, Temperature, Heart Rate, Respiratory Rate).
5. Click **Submit Case**.

### 3. Closed-Loop Referral Initiation
If patient requires higher-tier care:
1. Open the patient's case and click **Initiate Referral**.
2. Select destination facility (e.g. *Pune District Hospital* or *Satara Civil Hospital*).
3. Specify transport requirement:
   - Standard 108 Government Ambulance.
   - NGO Emergency Transport (Arogya Vahini).
   - Self-arranged transport.
4. Click **Dispatch Referral** $\rightarrow$ Patient automatically receives SMS confirmation with Tracking ID.

### 4. Medicine Inventory & Usage Recording
1. Navigate to `/inventory` at the end of each OPD shift.
2. Select dispensed medicines (e.g. *Paracetamol 500mg*, *Amoxicillin 500mg*).
3. Enter total quantity consumed during the shift.
4. If stock is below minimum threshold, system alerts District Admin automatically.
5. Record batch restocking when medical supply kits arrive from district warehouse.

### 5. IVR Callback Queue Triage
1. Navigate to `/call-assistance` or the Callback Queue tab.
2. Review pending citizen callback requests from IVR missed-call entries.
3. Place outbound voice call to citizen, address health query, and mark callback as `RESOLVED`.

### 6. Shift Handover & Logout
1. Verify all active OPD cases have consultation notes or referrals attached.
2. Click profile avatar in top-right $\rightarrow$ select **Sign Out**.

---

## 3. Rural Offline Protocol (No Internet Connectivity)
If internet connectivity drops during an OPD session:
1. **Switch to Offline Paper Register**: Record patient name, symptoms, vitals, and medicine dispensed on physical PHC register.
2. **Emergency Cases**: For acute emergencies, call 108 directly via feature phone without waiting for digital record submission.
3. **Data Back-Entry**: When internet restores, back-enter physical register entries into JeevanSetu within 2 hours.
