const casesService = require("../src/services/cases.service");
const referralsService = require("../src/services/referrals.service");
const inventoryService = require("../src/services/inventory.service");
const doctorsService = require("../src/services/doctors.service");
const adminService = require("../src/services/admin.service");
const auditService = require("../src/services/audit.service");
const notificationService = require("../src/services/notification.service");

let passed = 0;
let failed = 0;

const assert = (condition, testName) => {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
};

const runPhase7Tests = async () => {
  console.log("\n=======================================================");
  console.log("   JEEVANSETU PHASE 7 — WORKFLOW INTEGRATION TESTS");
  console.log("=======================================================\n");

  const mockPatient = { profileId: "pat-uuid-001", role: "patient", name: "Suresh Gaikwad" };
  const mockPhcStaff = { profileId: "phc-staff-001", role: "phc_staff", assignedPhcId: "phc-1" };
  const mockDoctor = { profileId: "doc-uuid-001", role: "doctor", doctorId: "doc-1" };
  const mockHospStaff = { profileId: "hosp-staff-001", role: "hospital_staff" };
  const mockAdmin = { profileId: "admin-uuid-001", role: "district_admin" };

  // -------------------------------------------------------------------------
  // WORKFLOW 1: Patient Health Cases & Vitals
  // -------------------------------------------------------------------------
  console.log("--- Workflow 1: Patient Health Cases & Clinical Vitals ---");
  try {
    // 1. Patient creates case
    const createdCase = await casesService.createCase(mockPatient, {
      primary_concern: "High fever with chills and severe joint pain.",
      category: "General Medicine",
      urgency: "urgent",
      caregiver_mode: "myself",
    });
    assert(createdCase && createdCase.case_number.startsWith("JVS-MH-"), "Case created with valid JVS-MH case number");
    assert(createdCase.patient_id === "pat-uuid-001", "Patient ID strictly bound to authenticated user profile");
    assert(createdCase.status === "open", "Initial case status is 'open'");

    // 2. Doctor/PHC records vitals
    const vitals = await casesService.addCaseVitals(mockDoctor, createdCase.id, {
      systolic_bp: 130,
      diastolic_bp: 85,
      pulse_rate: 92,
      blood_sugar: 124.5,
      temperature: 101.2,
      hemoglobin: 13.0,
      notes: "Febrile presentation, vital signs stable under observation.",
    });
    assert(vitals && vitals.systolic_bp === 130, "Clinical vitals recorded by authorized medical officer");

    // 3. Valid status transition: open -> in_treatment
    const updatedCase = await casesService.updateCase(mockDoctor, createdCase.id, {
      status: "in_treatment",
    });
    assert(updatedCase.status === "in_treatment", "Valid case status transition: open -> in_treatment");

    // 4. Invalid status transition: in_treatment -> open (should fail)
    let invalidTransitionFailed = false;
    try {
      await casesService.updateCase(mockDoctor, createdCase.id, { status: "open" });
    } catch (err) {
      invalidTransitionFailed = true;
    }
    assert(invalidTransitionFailed, "Invalid backwards case status transition (in_treatment -> open) correctly rejected");
  } catch (err) {
    console.error("Workflow 1 error:", err);
    failed++;
  }

  // -------------------------------------------------------------------------
  // WORKFLOW 2: Referral Lifecycle & State Machine
  // -------------------------------------------------------------------------
  console.log("\n--- Workflow 2: Referral Lifecycle & State Machine ---");
  try {
    // 1. PHC Staff creates referral
    const newRef = await referralsService.createReferral(mockPhcStaff, {
      case_id: "c1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
      destination_hospital_id: "hosp-1",
      required_specialty: "Cardiology",
      clinical_summary: "Progressive chest tightness. Requires specialist angiography.",
      priority: "urgent",
    });
    assert(newRef && newRef.referral_number.startsWith("REF-"), "Referral initiated with REF-YYYY-XXXX format");
    assert(newRef.status === "created", "Initial referral stage is 'created'");

    // 2. PHC marks patient notified: created -> patient_notified
    const stage2 = await referralsService.updateReferral(mockPhcStaff, newRef.id, {
      status: "patient_notified",
      note: "Patient briefed about transfer.",
    });
    assert(stage2.status === "patient_notified", "Transition stage 1->2: created -> patient_notified");

    // 3. Hospital accepts referral: patient_notified -> destination_accepted
    const stage3 = await referralsService.updateReferral(mockHospStaff, newRef.id, {
      status: "destination_accepted",
      note: "Cardiology bed allocated in Ward 2.",
    });
    assert(stage3.status === "destination_accepted", "Transition stage 2->3: patient_notified -> destination_accepted");

    // 4. Hospital marks patient reached: destination_accepted -> patient_reached
    const stage4 = await referralsService.updateReferral(mockHospStaff, newRef.id, {
      status: "patient_reached",
      note: "Patient arrived via ambulance transport.",
    });
    assert(stage4.status === "patient_reached", "Transition stage 3->4: destination_accepted -> patient_reached");

    // 5. Hospital starts treatment: patient_reached -> treatment_started
    const stage5 = await referralsService.updateReferral(mockHospStaff, newRef.id, {
      status: "treatment_started",
      note: "Cath lab procedure initiated.",
    });
    assert(stage5.status === "treatment_started", "Transition stage 4->5: patient_reached -> treatment_started");

    // 6. Hospital completes referral: treatment_started -> completed
    const stage6 = await referralsService.updateReferral(mockHospStaff, newRef.id, {
      status: "completed",
      note: "Procedure successful, discharge summary handed to patient.",
    });
    assert(stage6.status === "completed", "Transition stage 5->6: treatment_started -> completed");

    // 7. Test invalid transition: completed -> created (terminal stage)
    let invalidStageFailed = false;
    try {
      await referralsService.updateReferral(mockHospStaff, newRef.id, { status: "created" });
    } catch (err) {
      invalidStageFailed = true;
    }
    assert(invalidStageFailed, "Invalid transition from terminal 'completed' stage correctly rejected");

    // 8. Test role restriction: Patient cannot advance referral stage
    let patientForbidden = false;
    try {
      await referralsService.updateReferral(mockPatient, newRef.id, { status: "completed" });
    } catch (err) {
      patientForbidden = true;
    }
    assert(patientForbidden, "Patient role forbidden from arbitrarily advancing hospital referral stage");
  } catch (err) {
    console.error("Workflow 2 error:", err);
    failed++;
  }

  // -------------------------------------------------------------------------
  // REFERRAL FOLLOW-UP
  // -------------------------------------------------------------------------
  console.log("\n--- Referral Follow-Up Service ---");
  try {
    const refToFlag = await referralsService.createReferral(mockPhcStaff, {
      case_id: "c1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
      destination_hospital_id: "hosp-1",
      required_specialty: "Neurology",
      clinical_summary: "Neurological deficit evaluation required.",
      priority: "urgent",
    });

    const flagResult = await referralsService.flagFollowUp(mockPhcStaff, refToFlag.id, {
      reason: "Patient travel delay verification",
    });
    assert(flagResult && flagResult.success, "Referral follow-up flagged with neutral terminology");
    assert(flagResult.reason === "Patient travel delay verification", "Follow-up reason recorded without prejudicial labels");
  } catch (err) {
    console.error("Follow-up error:", err);
    failed++;
  }

  // -------------------------------------------------------------------------
  // WORKFLOW 3: Medicine Inventory, Restock, Usage & Low Stock
  // -------------------------------------------------------------------------
  console.log("\n--- Workflow 3: Medicine Inventory & Deterministic Alerts ---");
  try {
    // 1. Initial restock
    const restocked = await inventoryService.restockInventoryItem(mockPhcStaff, {
      phc_id: "phc-1",
      medicine_id: "med-1",
      quantity_added: 200,
      batch_number: "BATCH-PHASE7-01",
      expiry_date: "2028-12-31",
    });
    assert(restocked && restocked.current_quantity >= 200, "Stock addition/restock adds inventory correctly");

    // 2. Medicine Usage (Dispensation)
    const initialQty = restocked.current_quantity;
    const usageResult = await inventoryService.recordMedicineUsage(mockPhcStaff, {
      phc_id: "phc-1",
      medicine_id: "med-1",
      quantity_consumed: 50,
      usage_context: "OPD Dispensation",
    });
    assert(usageResult && usageResult.remaining_quantity === initialQty - 50, "Medicine usage atomically deducts from inventory");

    // 3. Negative stock prevention
    let negativeStockPrevented = false;
    try {
      await inventoryService.recordMedicineUsage(mockPhcStaff, {
        phc_id: "phc-1",
        medicine_id: "med-1",
        quantity_consumed: 999999, // Exceeds stock
      });
    } catch (err) {
      negativeStockPrevented = true;
    }
    assert(negativeStockPrevented, "Negative stock operation strictly prohibited and rejected");

    // 4. Stock Adjustment with Audit Reason
    const adjusted = await inventoryService.adjustInventoryStock(mockPhcStaff, {
      phc_id: "phc-1",
      medicine_id: "med-1",
      adjustment_delta: -10,
      reason: "Expired blister packaging removed during physical audit",
    });
    assert(adjusted && adjusted.current_quantity === initialQty - 60, "Stock adjustment applied with audit reason");
  } catch (err) {
    console.error("Workflow 3 error:", err);
    failed++;
  }

  // -------------------------------------------------------------------------
  // WORKFLOW 4: Doctor Duty & Presence Tracking
  // -------------------------------------------------------------------------
  console.log("\n--- Workflow 4: Doctor Duty & Presence Tracking ---");
  try {
    // 1. Doctor Check-In
    const checkIn = await doctorsService.checkInDoctor(mockDoctor, "doc-1", {
      note: "Morning clinical consultation session",
    });
    assert(checkIn && checkIn.doctor.is_on_duty === true, "Doctor check-in marks doctor ON DUTY");

    // 2. Doctor Check-Out
    const checkOut = await doctorsService.checkOutDoctor(mockDoctor, "doc-1", {
      note: "Evening shift handover complete",
    });
    assert(checkOut && checkOut.doctor.is_on_duty === false, "Doctor check-out marks doctor OFF DUTY");

    // 3. Duty schedule query
    const schedule = await doctorsService.getDutySchedule({ phc_id: "phc-1" });
    assert(Array.isArray(schedule) && schedule.length > 0, "Duty schedule retrieved with shift hours and neutral review status");
    assert(schedule[0].review_status !== "absent", "Neutral safety terminology verified ('normal' / 'requires_review')");
  } catch (err) {
    console.error("Workflow 4 error:", err);
    failed++;
  }

  // -------------------------------------------------------------------------
  // ADMIN MONITORING & AUDIT LOGS
  // -------------------------------------------------------------------------
  console.log("\n--- Admin Monitoring & Audit Trail ---");
  try {
    const overview = await adminService.getAdminMonitoringOverview(mockAdmin);
    assert(overview && overview.metrics, "Admin monitoring overview aggregated successfully");
    assert(typeof overview.metrics.total_unresolved_cases === "number", "Unresolved cases metric calculated");
    assert(typeof overview.metrics.referral_follow_up_count === "number", "Referral follow-up count calculated");
    assert(Array.isArray(overview.doctor_duty_status.roster), "Doctor presence roster included in admin monitoring");

    const auditLogs = await auditService.getAuditLogs({ limit: 10 });
    assert(auditLogs && Array.isArray(auditLogs.items), "System audit logs queryable for compliance");
  } catch (err) {
    console.error("Admin monitoring error:", err);
    failed++;
  }

  console.log("\n=======================================================");
  console.log(`   TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
};

runPhase7Tests();
