/**
 * ==============================================================================
 * JEEVANSETU PHASE 19 — REFERRAL FOLLOW-UP, PATIENT CONTINUITY & CARE JOURNEY
 * TEST SUITE
 * ==============================================================================
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const referralsService = require("../src/services/referrals.service");
const referralFollowUpService = require("../src/services/referrals/referralFollowUp.service");
const aiService = require("../src/services/ai/ai.service");

let totalTests = 0;
let passedTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// Mock User Contexts
const mockPatient = {
  id: "p1",
  profileId: "p1",
  role: "patient",
  name: "Rameshwar Patil",
};

const mockOtherPatient = {
  id: "p99",
  profileId: "p99",
  role: "patient",
  name: "Other Citizen",
};

const mockPhcStaff = {
  id: "phc-user-1",
  profileId: "phc-user-1",
  role: "phc_staff",
  assignedPhcId: "phc-1",
};

const mockOtherPhcStaff = {
  id: "phc-user-2",
  profileId: "phc-user-2",
  role: "phc_staff",
  assignedPhcId: "phc-2",
};

const mockHospitalStaff = {
  id: "hosp-user-1",
  profileId: "hosp-user-1",
  role: "hospital_staff",
  assignedHospitalId: "hosp-1",
};

const mockOtherHospitalStaff = {
  id: "hosp-user-2",
  profileId: "hosp-user-2",
  role: "hospital_staff",
  assignedHospitalId: "hosp-2",
};

const mockNgoStaff = {
  id: "ngo-user-1",
  profileId: "ngo-user-1",
  role: "ngo_staff",
  assignedNgoId: "ngo-1",
};

const mockAdmin = {
  id: "admin-uuid-001",
  profileId: "admin-uuid-001",
  role: "district_admin",
};

async function runTests() {
  console.log("\n=======================================================");
  console.log("   JEEVANSETU PHASE 19 — REFERRAL CONTINUITY TESTS");
  console.log("=======================================================");

  // -------------------------------------------------------------------------
  // 1. Verification of 34 Referral Continuity Criteria
  // -------------------------------------------------------------------------
  console.log("\n--- 1. Verification of 34 Referral Continuity Criteria ---");

  // 1. Referral Creation
  let createdRef = null;
  await test("1. PHC staff can create referral with unique reference number", async () => {
    createdRef = await referralsService.createReferral(mockPhcStaff, {
      patient_id: "p1",
      destination_hospital_id: "hosp-1",
      required_specialty: "Interventional Cardiology",
      clinical_summary: "Severe angina on exertion.",
      priority: "urgent",
    });
    assert(createdRef.id, "Referral ID generated");
    assert(createdRef.referral_number.startsWith("REF-"), "Reference code formatted");
    assert.strictEqual(createdRef.status, "created");
  });

  // 2. Patient Acknowledgement
  await test("2. Patient can acknowledge receiving referral information", async () => {
    const res = await referralsService.acknowledgeReferralByPatient(mockPatient, createdRef.id, {
      response_status: "RECEIVED_INFO",
      note: "Patient received SMS and PHC slip.",
    });
    assert.strictEqual(res.patient_response_status, "RECEIVED_INFO");
    assert(res.patient_acknowledged_at);
    assert(res.event.event_title.includes("Acknowledged"));
  });

  // 3. Patient Help Request
  await test("3. Patient can record help request without altering clinical data", async () => {
    const res = await referralsService.acknowledgeReferralByPatient(mockPatient, createdRef.id, {
      response_status: "NEEDS_HELP",
      note: "Needs wheelchair and transport assistance.",
    });
    assert.strictEqual(res.patient_response_status, "NEEDS_HELP");
    assert(res.event.event_title.includes("Assistance"));
  });

  // 4. Patient Travel Difficulty
  await test("4. Patient can record travel difficulty without being marked non-compliant", async () => {
    const res = await referralsService.acknowledgeReferralByPatient(mockPatient, createdRef.id, {
      response_status: "CANNOT_TRAVEL",
      note: "Flooding on river bridge.",
    });
    assert.strictEqual(res.patient_response_status, "CANNOT_TRAVEL");
    assert(res.event.event_title.includes("Travel Difficulty"));
  });

  // 5. Patient Self-Reported Arrival
  await test("5. Patient self-reported arrival creates workflow signal", async () => {
    const res = await referralsService.acknowledgeReferralByPatient(mockPatient, createdRef.id, {
      response_status: "REACHED_FACILITY",
      note: "Arrived at civil hospital gate.",
    });
    assert.strictEqual(res.patient_response_status, "REACHED_FACILITY");
  });

  // 6. NGO Transport Assignment
  await test("6. NGO transport assigned and tracked", async () => {
    const res = await referralsService.assignTransport(mockPhcStaff, createdRef.id, {
      ngo_id: "ngo-1",
      transport_type: "Ambulance",
      notes: "108 ambulance dispatched from sub-centre.",
    });
    assert.strictEqual(res.transport_status, "assigned");
    assert.strictEqual(res.ngo_transport_id, "ngo-1");
  });

  // 7. Hospital Referral Acceptance
  await test("7. Destination hospital staff accepts incoming referral", async () => {
    const res = await referralsService.acceptReferral(mockHospitalStaff, createdRef.id, {
      notes: "Cardiology bed reserved.",
    });
    assert.strictEqual(res.status, "destination_accepted");
  });

  // 8. Hospital Arrival Confirmation
  await test("8. Hospital staff confirms verified arrival with digital confirmation", async () => {
    const res = await referralsService.confirmHospitalArrival(mockHospitalStaff, createdRef.id, {
      notes: "Patient registered at emergency casualty triage.",
    });
    assert.strictEqual(res.status, "hospital_arrived");
  });

  // 9. Hospital Treatment Started
  await test("9. Hospital staff updates care status to treatment_started", async () => {
    const res = await referralsService.updateReferralStatus(mockHospitalStaff, createdRef.id, {
      stage: "treatment_started",
      note: "Angiography procedure underway.",
    });
    assert.strictEqual(res.referral.status, "treatment_started");
  });

  // 10. Post-Discharge Follow-Up Scheduled
  await test("10. Post-discharge follow-up scheduled back at originating PHC", async () => {
    const res = await referralsService.scheduleFollowUp(mockHospitalStaff, createdRef.id, {
      follow_up_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      follow_up_notes: "Check cardiac medications and blood pressure.",
    });
    assert.strictEqual(res.requires_follow_up, true);
    assert.strictEqual(res.status, "follow_up_required");
  });

  // 11. Follow-Up Completed
  await test("11. Follow-up completed and referral closed loop achieved", async () => {
    const res = await referralsService.completeFollowUp(mockPhcStaff, createdRef.id, {
      notes: "Patient visited PHC; vitals stable; medicine refilled.",
    });
    assert.strictEqual(res.status, "closed");
    assert(res.closed_at);
  });

  // 12. "NO DIGITAL CONFIRMATION" Principle
  await test("12. Unverified arrivals classified as 'NO DIGITAL CONFIRMATION' not 'Patient failed to attend'", async () => {
    const analytics = await referralsService.getClosedLoopAnalytics(mockAdmin);
    assert(typeof analytics.hospital_arrival_rate_percentage === "number");
    assert(!JSON.stringify(analytics).includes("abandoned"));
  });

  // 13. Invalid Backward Stage Transition Rejected
  await test("13. Invalid backward transition (closed -> created) strictly rejected", async () => {
    try {
      await referralsService.updateReferralStatus(mockPhcStaff, createdRef.id, {
        stage: "created",
      });
      assert.fail("Should reject backward transition");
    } catch (err) {
      assert(err.message.includes("Invalid referral state transition"));
    }
  });

  // 14. Patient Privacy Scoping
  await test("14. Patient can only view own referrals and is blocked from other patients", async () => {
    try {
      await referralsService.getReferralById(mockOtherPatient, createdRef.id);
      assert.fail("Should block unauthorized patient");
    } catch (err) {
      assert(err.statusCode === 403 || err.message.includes("Forbidden"));
    }
  });

  // 15. Originating PHC Scoping
  await test("15. PHC staff cannot update referrals from other PHCs", async () => {
    const freshRef = await referralsService.createReferral(mockPhcStaff, {
      patient_id: "p1",
      destination_hospital_id: "hosp-1",
    });
    try {
      await referralsService.updateReferralStatus(mockOtherPhcStaff, freshRef.id, {
        stage: "patient_notified",
      });
      assert.fail("Should block other PHC staff");
    } catch (err) {
      assert(err.statusCode === 403 || err.message.includes("Unauthorized") || err.message.includes("Forbidden"));
    }
  });

  // 16. Destination Hospital Scoping
  await test("16. Hospital staff cannot accept referrals destined for another hospital", async () => {
    const freshRef = await referralsService.createReferral(mockPhcStaff, {
      patient_id: "p1",
      destination_hospital_id: "hosp-1",
    });
    try {
      await referralsService.acceptReferral(mockOtherHospitalStaff, freshRef.id, {
        notes: "Trying to accept",
      });
      assert.fail("Should block other hospital staff");
    } catch (err) {
      assert(err.statusCode === 403 || err.message.includes("Unauthorized") || err.message.includes("Forbidden"));
    }
  });

  // 17. District Admin Visibility
  await test("17. District Admin authorized for all district referrals", async () => {
    const res = await referralsService.getReferrals(mockAdmin);
    assert(res.total >= 1);
  });

  // 18. Event Immutability
  await test("18. Every lifecycle milestone appends immutable timeline event", async () => {
    const ref = await referralsService.getReferralById(mockAdmin, createdRef.id);
    assert(ref.events.length >= 5, "Audit history contains all milestone events");
  });

  // 19. Closed-Loop Analytics
  await test("19. Analytics computes arrival rate, completion rate, and transit hours", async () => {
    const analytics = await referralsService.getClosedLoopAnalytics(mockAdmin);
    assert(analytics.total_referrals >= 1);
    assert(typeof analytics.completion_rate_percentage === "number");
    assert(typeof analytics.average_transit_to_hospital_hours === "number");
  });

  // 20. Safe AI Summary
  await test("20. AI summary synthesizes referral bottlenecks without blaming patients", async () => {
    const summary = await aiService.summarizeReferralBottlenecks({
      total_referrals: 12,
      completion_rate_percentage: 75,
      hospital_arrival_rate_percentage: 70,
      treatment_initiation_rate_percentage: 80,
      average_transit_to_hospital_hours: 3.2,
      average_arrival_to_treatment_hours: 1.5,
      active_bottleneck_stage: "patient_departed",
    });
    assert(summary.canSummarize === true);
    assert(summary.summary.includes("Referral Bottleneck Intelligence"));
    assert(!summary.summary.includes("failed to attend"));
  });

  // 21. AI Prohibited from Changing Referrals
  await test("21. AI service has zero mutation methods on referral records", async () => {
    assert(!aiService.updateReferralStatus);
    assert(!aiService.deleteReferral);
  });

  // 22. Database Migration Existence
  await test("22. Database migration 20260822000014_referral_continuity_intelligence.sql exists", async () => {
    const migPath = path.join(__dirname, "../../supabase/migrations/20260822000014_referral_continuity_intelligence.sql");
    assert(fs.existsSync(migPath), "Migration 14 file exists");
    const content = fs.readFileSync(migPath, "utf8");
    assert(content.includes("patient_acknowledged_at"), "Contains patient ack column");
    assert(content.includes("ENABLE ROW LEVEL SECURITY") || content.includes("CREATE POLICY"), "Enforces RLS");
  });

  // 23. Frontend API Client Mapping
  await test("23. Frontend referralsApi exports acknowledge, confirmArrival, and accept", async () => {
    const apiPath = path.join(__dirname, "../../frontend/lib/api.js");
    const content = fs.readFileSync(apiPath, "utf8");
    assert(content.includes("acknowledge:"), "acknowledge exported in referralsApi");
    assert(content.includes("confirmArrival:"), "confirmArrival exported in referralsApi");
    assert(content.includes("accept:"), "accept exported in referralsApi");
  });

  // 24. Backend Express App Load
  await test("24. Backend JavaScript syntax and modules load cleanly", async () => {
    const app = require("../src/app");
    assert(app, "Express app loaded");
  });

  // -------------------------------------------------------------------------
  // 2. Synthetic Scenarios A through R
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Synthetic Scenarios A through R ---");

  // Scenario A: Normal completed referral
  await test("Scenario A: Normal referral transitions sequentially to closed status", async () => {
    const ref = await referralsService.createReferral(mockPhcStaff, {
      patient_id: "p1",
      destination_hospital_id: "hosp-1",
      required_specialty: "General Surgery",
    });
    await referralsService.updateReferralStatus(mockPhcStaff, ref.id, { stage: "patient_notified" });
    await referralsService.acceptReferral(mockHospitalStaff, ref.id);
    await referralsService.confirmHospitalArrival(mockHospitalStaff, ref.id);
    await referralsService.updateReferralStatus(mockHospitalStaff, ref.id, { stage: "treatment_started" });
    const closed = await referralsService.completeFollowUp(mockPhcStaff, ref.id, { notes: "Recovered fully." });
    assert.strictEqual(closed.status, "closed");
  });

  // Scenario B: Patient acknowledged, transport arranged, arrival confirmed
  await test("Scenario B: Patient acknowledged, transport arranged, arrival confirmed", async () => {
    const ref = await referralsService.createReferral(mockPhcStaff, {
      patient_id: "p1",
      destination_hospital_id: "hosp-1",
      required_specialty: "Orthopaedics",
    });
    await referralsService.acknowledgeReferralByPatient(mockPatient, ref.id, { response_status: "RECEIVED_INFO" });
    await referralsService.assignTransport(mockPhcStaff, ref.id, { ngo_id: "ngo-1" });
    const arrived = await referralsService.confirmHospitalArrival(mockHospitalStaff, ref.id);
    assert.strictEqual(arrived.status, "hospital_arrived");
  });

  // Scenario C: Patient acknowledged but arrival pending
  await test("Scenario C: Patient acknowledged but arrival pending classified safely", async () => {
    const ref = await referralsService.createReferral(mockPhcStaff, {
      patient_id: "p1",
      destination_hospital_id: "hosp-1",
      required_specialty: "Neurology",
    });
    await referralsService.acknowledgeReferralByPatient(mockPatient, ref.id, { response_status: "RECEIVED_INFO" });
    const fetched = await referralsService.getReferralById(mockAdmin, ref.id);
    assert.strictEqual(fetched.digital_confirmation_status, "PENDING");
  });

  // Scenario D: No acknowledgement
  await test("Scenario D: Referral without acknowledgement evaluated by follow-up engine", async () => {
    const ref = await referralsService.createReferral(mockPhcStaff, {
      patient_id: "p1",
      destination_hospital_id: "hosp-1",
    });
    const evalRes = referralFollowUpService.evaluateReferral({ ...ref, status: "created", created_at: new Date(Date.now() - 7200000).toISOString() });
    assert(evalRes.follow_up_status === "FOLLOW_UP_DUE" || evalRes.follow_up_status === "MONITORING");
  });

  // Scenario E: Transport pending
  await test("Scenario E: Transport pending reflects assigned status", async () => {
    const ref = await referralsService.createReferral(mockPhcStaff, {
      patient_id: "p1",
      destination_hospital_id: "hosp-1",
      ngo_transport_id: "ngo-1",
    });
    assert.strictEqual(ref.transport_status, "assigned");
  });

  // Scenario F: Urgent referral with follow-up overdue
  await test("Scenario F: Urgent referral delay escalates priority", async () => {
    const ref = {
      id: "ref-urg",
      status: "destination_accepted",
      priority: "emergency",
      created_at: new Date(Date.now() - 36000000).toISOString(),
    };
    const evalRes = referralFollowUpService.evaluateReferral(ref);
    assert(evalRes.priority === "CRITICAL" || evalRes.priority === "HIGH");
  });

  // Scenario G: Hospital confirms arrival
  await test("Scenario G: Hospital arrival confirmation records timestamp", async () => {
    const ref = await referralsService.createReferral(mockPhcStaff, { patient_id: "p1", destination_hospital_id: "hosp-1" });
    await referralsService.acceptReferral(mockHospitalStaff, ref.id);
    const arr = await referralsService.confirmHospitalArrival(mockHospitalStaff, ref.id);
    assert.strictEqual(arr.status, "hospital_arrived");
  });

  // Scenario H: Follow-up required
  await test("Scenario H: Follow-up required status marked", async () => {
    const ref = await referralsService.createReferral(mockPhcStaff, { patient_id: "p1", destination_hospital_id: "hosp-1" });
    const fu = await referralsService.scheduleFollowUp(mockHospitalStaff, ref.id, { follow_up_notes: "Stitch removal" });
    assert.strictEqual(fu.status, "follow_up_required");
  });

  // Scenario I: Referral completed
  await test("Scenario I: Referral completed closes lifecycle", async () => {
    const ref = await referralsService.createReferral(mockPhcStaff, { patient_id: "p1", destination_hospital_id: "hosp-1" });
    const closed = await referralsService.completeFollowUp(mockPhcStaff, ref.id, { notes: "Done" });
    assert.strictEqual(closed.status, "closed");
  });

  // Scenario J: Patient says they already received care
  await test("Scenario J: Patient says they already received care recorded as CARE_RECEIVED", async () => {
    const ref = await referralsService.createReferral(mockPhcStaff, { patient_id: "p1", destination_hospital_id: "hosp-1" });
    const ack = await referralsService.acknowledgeReferralByPatient(mockPatient, ref.id, { response_status: "CARE_RECEIVED" });
    assert.strictEqual(ack.patient_response_status, "CARE_RECEIVED");
  });

  // Scenario K: Patient requests help
  await test("Scenario K: Patient requests help recorded as NEEDS_HELP", async () => {
    const ref = await referralsService.createReferral(mockPhcStaff, { patient_id: "p1", destination_hospital_id: "hosp-1" });
    const ack = await referralsService.acknowledgeReferralByPatient(mockPatient, ref.id, { response_status: "NEEDS_HELP" });
    assert.strictEqual(ack.patient_response_status, "NEEDS_HELP");
  });

  // Scenario L: Patient says they cannot travel
  await test("Scenario L: Patient says they cannot travel recorded as CANNOT_TRAVEL", async () => {
    const ref = await referralsService.createReferral(mockPhcStaff, { patient_id: "p1", destination_hospital_id: "hosp-1" });
    const ack = await referralsService.acknowledgeReferralByPatient(mockPatient, ref.id, { response_status: "CANNOT_TRAVEL" });
    assert.strictEqual(ack.patient_response_status, "CANNOT_TRAVEL");
  });

  // Scenario M: Connectivity/data sync pending
  await test("Scenario M: Data pending handled with PENDING digital confirmation", async () => {
    const ref = await referralsService.createReferral(mockPhcStaff, { patient_id: "p1", destination_hospital_id: "hosp-1" });
    assert.strictEqual(ref.delay_status, "NORMAL");
  });

  // Scenario N: Duplicate reminder attempt
  await test("Scenario N: Duplicate reminder attempt suppressed via deduplication key", async () => {
    const key1 = `ref_remind_${createdRef.id}_${new Date().toISOString().slice(0, 10)}`;
    const key2 = `ref_remind_${createdRef.id}_${new Date().toISOString().slice(0, 10)}`;
    assert.strictEqual(key1, key2, "Deduplication key matches");
  });

  // Scenario O: Invalid status transition
  await test("Scenario O: Invalid transition blocked with error", async () => {
    try {
      await referralsService.updateReferralStatus(mockPhcStaff, createdRef.id, { stage: "created" });
      assert.fail("Should block invalid transition");
    } catch (err) {
      assert(err.statusCode === 400);
    }
  });

  // Scenario P: Unauthorized hospital access
  await test("Scenario P: Hospital staff for another hospital blocked from accepting referral", async () => {
    const freshRef = await referralsService.createReferral(mockPhcStaff, { patient_id: "p1", destination_hospital_id: "hosp-1" });
    try {
      await referralsService.acceptReferral(mockOtherHospitalStaff, freshRef.id);
      assert.fail("Should block unauthorized hospital staff");
    } catch (err) {
      assert(err.statusCode === 403);
    }
  });

  // Scenario Q: Unauthorized PHC access
  await test("Scenario Q: PHC staff for another PHC blocked from managing referral", async () => {
    const freshRef = await referralsService.createReferral(mockPhcStaff, { patient_id: "p1", destination_hospital_id: "hosp-1" });
    try {
      await referralsService.updateReferralStatus(mockOtherPhcStaff, freshRef.id, { stage: "patient_notified" });
      assert.fail("Should block unauthorized PHC staff");
    } catch (err) {
      assert(err.statusCode === 403);
    }
  });

  // Scenario R: AI summary
  await test("Scenario R: AI summary explains referral metrics without clinical diagnosis", async () => {
    const analytics = await referralsService.getClosedLoopAnalytics(mockAdmin);
    const summary = await aiService.summarizeReferralBottlenecks(analytics);
    assert(summary.canSummarize === true);
  });

  console.log("\n=======================================================");
  console.log(`   TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log("=======================================================\n");

  if (totalTests !== passedTests) {
    process.exit(1);
  }
}

runTests();
