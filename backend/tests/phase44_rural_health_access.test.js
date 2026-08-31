/**
 * ==============================================================================
 * JEEVANSETU PHASE 44 — RURAL HEALTH ACCESS & COMMUNITY CAMPAIGNS TEST SUITE
 * ==============================================================================
 * Validates doctor multiple-hospital availability, ASHA assisted request 
 * consent boundaries, IVR DTMF menu trees, and geographical campaign targeting.
 */

process.env.NODE_ENV = "test";
const assert = require("assert");
const doctorsService = require("../src/services/doctors.service");
const ruralAccessService = require("../src/services/ruralAccess.service");
const campaignsService = require("../src/services/campaigns.service");

console.log("=======================================================");
console.log("   JEEVANSETU PHASE 44: RURAL HEALTH ACCESS TEST SUITE");
console.log("=======================================================\n");

let passed = 0;
let failed = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function runAllTests() {
  console.log("--- SECTION 1: Doctor Multiple-Facility Mappings ---");

  await runTest("1. Doctors mapped to multiple PHCs or Hospitals are retrieved correctly", async () => {
    const facilities = await doctorsService.getDoctorFacilities("doc-1");
    assert.ok(Array.isArray(facilities));
    assert.strictEqual(facilities.length, 2, "Should return 2 mapped facilities");
    assert.strictEqual(facilities[0].facility_type, "phc");
    assert.strictEqual(facilities[1].facility_type, "hospital");
  });

  await runTest("2. Staff or Doctor can update status at a specific facility", async () => {
    const user = { role: "hospital_staff", profileId: "staff-1" };
    const res = await doctorsService.updateDoctorFacilityStatus(
      user,
      "doc-1",
      "hosp-1",
      { status: "IN_CONSULTATION", next_available_time: new Date().toISOString() }
    );
    assert.ok(res.success);
  });

  await runTest("3. Unauthorized roles cannot change doctor availability status", async () => {
    const user = { role: "patient", profileId: "patient-1" };
    await assert.rejects(
      async () => await doctorsService.updateDoctorFacilityStatus(
        user,
        "doc-1",
        "hosp-1",
        { status: "ON_DUTY" }
      ),
      /Unauthorized to update doctor status/
    );
  });

  console.log("\n--- SECTION 2: Feature-Phone IVR DTMF Schema ---");

  await runTest("4. IVR service resolves welcome prompts and DTMF menus for English, Hindi, Marathi", async () => {
    const mrIvr = await ruralAccessService.getIvrFlow("mr");
    assert.ok(mrIvr.welcome.includes("स्वागत"));
    assert.ok(mrIvr.mainMenu.options["9"].includes("रुग्णवाहिका"));

    const hiIvr = await ruralAccessService.getIvrFlow("hi");
    assert.ok(hiIvr.welcome.includes("स्वागत"));
    assert.ok(hiIvr.mainMenu.options["9"].includes("एम्बुलेंस"));
  });

  console.log("\n--- SECTION 3: ASHA Frontline Worker Assisted Actions ---");

  await runTest("5. Assisted request submission blocks requests without patient consent", async () => {
    const user = { role: "phc_staff", profileId: "asha-1" };
    await assert.rejects(
      async () => await ruralAccessService.submitAssistedRequest(user, {
        citizen_name: "Tukaram Patil",
        service_requested: "referral_status",
        citizen_consent_given: false
      }),
      /Explicit patient consent is mandatory for assisted access request/
    );
  });

  await runTest("6. Non-staff roles cannot submit assisted citizen requests", async () => {
    const user = { role: "patient", profileId: "patient-1" };
    await assert.rejects(
      async () => await ruralAccessService.submitAssistedRequest(user, {
        citizen_name: "Tukaram Patil",
        service_requested: "referral_status",
        citizen_consent_given: true
      }),
      /Unauthorized/
    );
  });

  await runTest("7. ASHA worker logs request correctly with explicit consent", async () => {
    const user = { role: "phc_staff", profileId: "asha-1" };
    const res = await ruralAccessService.submitAssistedRequest(user, {
      citizen_name: "Tukaram Patil",
      service_requested: "referral_status",
      citizen_consent_given: true,
      details: "Checking outgoing PHC Referral outcome"
    });
    assert.ok(res.id);
    assert.strictEqual(res.citizen_name, "Tukaram Patil");
  });

  console.log("\n--- SECTION 4: Geographically Targeted Campaigns ---");

  await runTest("8. Fetch campaigns returns active advisories matching language and district filters", async () => {
    const mrAdvisories = await campaignsService.getCampaigns({ language: "mr", district: "Nagpur" });
    assert.ok(mrAdvisories.length > 0);
    assert.strictEqual(mrAdvisories[0].language, "mr");
  });

  await runTest("9. Campaign creation requires title, message and official source", async () => {
    await assert.rejects(
      async () => await campaignsService.createCampaign({ title: "" }),
      /Title, Message, and Official Source are required/
    );
  });

  console.log("\n=======================================================");
  console.log(`   PHASE 44 RESULTS: ${passed} Passed | ${failed} Failed`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

// Only run standalone if directly executed
if (require.main === module) {
  runAllTests().catch((err) => {
    console.error("Test runner crashed:", err);
    process.exit(1);
  });
}

module.exports = { runAllTests };
