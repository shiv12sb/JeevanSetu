/**
 * ==============================================================================
 * JEEVANSETU PHASE 47: OPENAI REALTIME VOICE AI TEST SUITE
 * ==============================================================================
 * Validates:
 * 1. Secure Ephemeral Session Initialization & Secret Protection
 * 2. Complete 17 Tool/Function Schemas conforming to OpenAI Realtime standard
 * 3. Verified Doctor Discovery & Real Availability Resolution
 * 4. Verified Hospital Directory & Emergency Casualty Contacts
 * 5. Live MEMS 108 Ambulance Status, Location, and ETA Calculations
 * 6. Closed-Loop Referral Milestone Status Resolution (Auth Enforced)
 * 7. DVDMS Medicine Stock Availability Inquiries
 * 8. Private Patient Health Records Isolation (Auth Enforced)
 * 9. PM-JAY / MJPJAY Government Scheme Guidelines Retrieval
 * 10. Deterministic 108 Emergency Preemption & Audit Logging
 * 11. Multilingual Support (Marathi, Hindi, English) & Natural Prompting
 * 12. Non-Diagnostic Healthcare Safety Boundaries
 */

const assert = require("assert");
const realtimeVoiceService = require("../src/services/ai/realtimeVoice.service");
const { REALTIME_TOOLS, REALTIME_SYSTEM_INSTRUCTION } = realtimeVoiceService;

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

async function runPhase47Suite() {
  console.log("\n=======================================================");
  console.log("   JEEVANSETU PHASE 47: OPENAI REALTIME VOICE SUITE");
  console.log("=======================================================\n");

  console.log("--- SECTION 1: Session Security & Secret Hygiene ---");

  // Test 1: Realtime session initialization
  await runAsyncTest("1. Create realtime session returns structured session or safe dev simulation", async () => {
    const session = await realtimeVoiceService.createRealtimeSession({
      user: { profileId: "prof-1", fullName: "Citizen Ramesh", role: "patient" },
      language: "mr",
    });

    assert.ok(session, "Session object must be defined");
    assert.strictEqual(session.success, true);
    assert.strictEqual(typeof session.model, "string");
    assert.strictEqual(typeof session.voice, "string");
    assert.ok(Array.isArray(session.tools));
    assert.ok(session.tools.length >= 21, `Expected at least 21 tools, found ${session.tools.length}`);
    // CRITICAL: Ensure permanent API key is NEVER exposed
    assert.strictEqual(session.OPENAI_API_KEY, undefined);
    assert.strictEqual(session.apiKey, undefined);
  });

  // Test 2: System prompt contains non-diagnostic and emergency rules
  runTest("2. Centralized system instruction enforces non-diagnostic and emergency rules", () => {
    assert.ok(REALTIME_SYSTEM_INSTRUCTION.includes("NOT A DOCTOR") || REALTIME_SYSTEM_INSTRUCTION.includes("NOT a doctor") || REALTIME_SYSTEM_INSTRUCTION.includes("DO NOT diagnose"));
    assert.ok(REALTIME_SYSTEM_INSTRUCTION.includes("NEVER prescribe") || REALTIME_SYSTEM_INSTRUCTION.includes("prescribe"));
    assert.ok(REALTIME_SYSTEM_INSTRUCTION.includes("emergency_108"));
    assert.ok(REALTIME_SYSTEM_INSTRUCTION.includes("Marathi") || REALTIME_SYSTEM_INSTRUCTION.includes("मराठी"));
    assert.ok(REALTIME_SYSTEM_INSTRUCTION.includes("Hindi") || REALTIME_SYSTEM_INSTRUCTION.includes("हिन्दी"));
    assert.ok(REALTIME_SYSTEM_INSTRUCTION.includes("English"));
  });

  console.log("\n--- SECTION 2: 21 Tool/Function Schemas Compliance ---");

  // Test 3: Tool schema validation
  runTest("3. All 21 tools are defined with valid function types and properties", () => {
    const requiredTools = [
      "search_doctor",
      "get_doctor_details",
      "get_doctor_availability",
      "search_hospital",
      "get_hospital_details",
      "get_hospital_contact",
      "find_nearby_facilities",
      "find_nearby_ambulances",
      "get_ambulance_status",
      "get_ambulance_location",
      "get_ambulance_eta",
      "contact_ambulance",
      "get_referral_status",
      "get_medicine_availability",
      "get_patient_health_records",
      "get_government_scheme_information",
      "emergency_108",
      "navigate_to_page",
      "get_health_awareness_topic",
      "request_asha_support",
      "book_ambulance",
    ];

    assert.ok(REALTIME_TOOLS.length >= 21, `Expected at least 21 tools, found ${REALTIME_TOOLS.length}`);
    for (const toolName of requiredTools) {
      const match = REALTIME_TOOLS.find((t) => t.name === toolName);
      assert.ok(match, `Tool ${toolName} must be defined in REALTIME_TOOLS`);
      assert.strictEqual(match.type, "function");
      assert.ok(match.description && match.description.length > 10);
      assert.strictEqual(match.parameters.type, "object");
    }
  });

  console.log("\n--- SECTION 3: Doctor Discovery & Availability Grounding ---");

  // Test 4: search_doctor tool
  await runAsyncTest("4. search_doctor tool returns verified doctors in Nagpur/Maharashtra", async () => {
    const res = await realtimeVoiceService.executeRealtimeTool("search_doctor", {
      district: "Nagpur",
      specialization: "Cardiology",
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.data.doctors.length > 0);
    const doc = res.data.doctors[0];
    assert.ok(doc.name);
    assert.ok(doc.specialization);
    assert.ok(doc.reception_phone);
    assert.ok(doc.duty_status);
  });

  // Test 5: get_doctor_availability tool
  await runAsyncTest("5. get_doctor_availability returns verified live duty roster", async () => {
    const res = await realtimeVoiceService.executeRealtimeTool("get_doctor_availability", {
      doctor_id: "doc-ngp-arneja-jaspal",
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.verified, true);
    assert.ok(res.data.doctor_name);
    assert.strictEqual(typeof res.data.is_on_duty, "boolean");
    assert.ok(res.data.status_label);
  });

  console.log("\n--- SECTION 4: Hospital & Rural Facilities Grounding ---");

  // Test 6: search_hospital tool
  await runAsyncTest("6. search_hospital returns verified hospital records and casualty contact", async () => {
    const res = await realtimeVoiceService.executeRealtimeTool("search_hospital", {
      district: "Nagpur",
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.data.hospitals.length > 0);
    const hosp = res.data.hospitals[0];
    assert.ok(hosp.name);
    assert.ok(hosp.address);
    assert.ok(hosp.reception_phone);
  });

  // Test 7: find_nearby_facilities tool
  await runAsyncTest("7. find_nearby_facilities discovers rural PHCs and delivery depots", async () => {
    const res = await realtimeVoiceService.executeRealtimeTool("find_nearby_facilities", {
      district: "Gadchiroli",
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.data.facilities.length > 0);
    assert.ok(res.data.facilities.some((f) => f.name.includes("Ashti")));
  });

  console.log("\n--- SECTION 5: Live MEMS 108 Ambulance Telematics ---");

  // Test 8: find_nearby_ambulances & ETA
  await runAsyncTest("8. find_nearby_ambulances & get_ambulance_eta return authentic response", async () => {
    const ambRes = await realtimeVoiceService.executeRealtimeTool("find_nearby_ambulances", {
      district: "Nagpur",
      type: "ALL",
    });

    assert.strictEqual(ambRes.success, true);
    assert.strictEqual(ambRes.data.primary_helpline, "108");
    assert.ok(ambRes.data.ambulances.length > 0);

    const etaRes = await realtimeVoiceService.executeRealtimeTool("get_ambulance_eta", {
      ambulance_id: ambRes.data.ambulances[0].id,
      pickup_district: "Nagpur",
    });

    assert.strictEqual(etaRes.success, true);
    assert.ok(etaRes.data.estimated_arrival_minutes > 0);
    assert.strictEqual(etaRes.data.emergency_helpline, "108");
  });

  console.log("\n--- SECTION 6: Auth-Guarded Referral & Patient Records ---");

  // Test 9: get_referral_status blocks unauthenticated access
  await runAsyncTest("9. get_referral_status blocks guest/unauthenticated user", async () => {
    const guestRes = await realtimeVoiceService.executeRealtimeTool("get_referral_status", {}, null);
    assert.strictEqual(guestRes.success, true);
    assert.strictEqual(guestRes.data.authenticated, false);
    assert.ok(guestRes.data.message.includes("log in"));
  });

  // Test 10: get_referral_status returns patient's verified milestone for authenticated user
  await runAsyncTest("10. get_referral_status returns patient milestone when authenticated", async () => {
    const authUser = {
      id: "usr-patient-101",
      profileId: "prof-patient-101",
      fullName: "Sushila Gaikwad",
      role: "patient",
    };

    const authRes = await realtimeVoiceService.executeRealtimeTool("get_referral_status", {}, authUser);
    assert.strictEqual(authRes.success, true);
    assert.strictEqual(authRes.data.authenticated, true);
    assert.ok(authRes.data.referral_id);
    assert.ok(authRes.data.destination_hospital);
    assert.ok(authRes.data.current_status);
  });

  console.log("\n--- SECTION 7: Medicine Inventory & Government Schemes ---");

  // Test 11: get_medicine_availability for ASV (Snakebite)
  await runAsyncTest("11. get_medicine_availability checks live Anti-Snake Venom stock", async () => {
    const res = await realtimeVoiceService.executeRealtimeTool("get_medicine_availability", {
      medicine_name: "Anti-Snake Venom (ASV)",
      district: "Nagpur",
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.available, true);
    assert.ok(res.data.facilities_with_stock.length > 0);
  });

  // Test 12: get_government_scheme_information returns PM-JAY / MJPJAY ₹5L facts
  await runAsyncTest("12. get_government_scheme_information returns ₹5 Lakh coverage guidelines", async () => {
    const res = await realtimeVoiceService.executeRealtimeTool("get_government_scheme_information", {
      scheme_name: "PMJAY",
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.data.coverage_amount.includes("5,00,000"));
    assert.ok(res.data.required_documents.includes("Aadhaar Card"));
    assert.ok(res.data.toll_free_helpline);
  });

  console.log("\n--- SECTION 8: Emergency 108 Deterministic Preemption ---");

  // Test 13: emergency_108 escalation
  await runAsyncTest("13. emergency_108 tool triggers immediate deterministic 108 dispatch response", async () => {
    const res = await realtimeVoiceService.executeRealtimeTool("emergency_108", {
      emergency_type: "Acute severe chest pain and breathlessness",
      location: "Sitabuldi, Nagpur",
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.is_emergency, true);
    assert.strictEqual(res.data.emergency_helpline, "108");
    assert.strictEqual(res.data.immediate_action, "DIAL_108");
  });

  console.log("\n--- SECTION 9: App Navigation, Health Awareness & ASHA Queue ---");

  // Test 14: navigate_to_page
  await runAsyncTest("14. navigate_to_page returns exact route path and step-by-step UI instructions", async () => {
    const res = await realtimeVoiceService.executeRealtimeTool("navigate_to_page", {
      target_page: "/ambulance",
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.target_page, "/ambulance");
    assert.ok(res.data.instructions.includes("Book Ambulance"));
    assert.strictEqual(res.data.navigation_action, "TRIGGER_CLIENT_NAVIGATION");
  });

  // Test 15: get_health_awareness_topic
  await runAsyncTest("15. get_health_awareness_topic returns verified clinical guidelines for blood pressure & anemia", async () => {
    const resBp = await realtimeVoiceService.executeRealtimeTool("get_health_awareness_topic", {
      topic: "blood_pressure",
    });

    assert.strictEqual(resBp.success, true);
    assert.ok(resBp.data.title.includes("Blood Pressure"));
    assert.ok(resBp.data.guidance.length >= 4);

    const resAnemia = await realtimeVoiceService.executeRealtimeTool("get_health_awareness_topic", {
      topic: "anemia",
    });
    assert.strictEqual(resAnemia.success, true);
    assert.ok(resAnemia.data.title.includes("Anemia"));
  });

  // Test 16: request_asha_support
  await runAsyncTest("16. request_asha_support queues citizen visit request with coordinator", async () => {
    const res = await realtimeVoiceService.executeRealtimeTool("request_asha_support", {
      citizen_name: "Anita Jadhav",
      phone: "+91 98230 11223",
      district: "Wardha",
      topic: "Maternal ANC Checkup & Iron tablets",
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.status, "REGISTERED_IN_ASHA_QUEUE");
    assert.ok(res.data.ticket_id);
    assert.ok(res.data.assigned_coordinator);
  });

  // Test 17: book_ambulance
  await runAsyncTest("17. book_ambulance initiates verified 108 ambulance dispatch with ETA", async () => {
    const res = await realtimeVoiceService.executeRealtimeTool("book_ambulance", {
      pickup_location: "Medical Square, Nagpur",
      district: "Nagpur",
      ambulance_type: "ADVANCED_LIFE_SUPPORT",
      contact_phone: "+91 98230 44556",
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.booking_status, "DISPATCH_REQUEST_QUEUED");
    assert.strictEqual(res.data.assigned_vehicle, "MH-31-EM-1081");
    assert.ok(res.data.estimated_eta_minutes > 0);
    assert.strictEqual(res.data.toll_free_helpline, "108");
  });

  console.log("\n=======================================================");
  console.log(`   PHASE 47 RESULTS: ${passed} Passed | ${failed} Failed`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runPhase47Suite();
}

module.exports = runPhase47Suite;
