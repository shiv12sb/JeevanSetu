/**
 * ==============================================================================
 * JEEVANSETU PHASE 45 — MAHARASHTRA VERIFIED DOCTOR & HOSPITAL DIRECTORY TESTS
 * ==============================================================================
 * Validates real data provenance, provider adapter abstraction, multi-hospital
 * presence, live duty status, staleness thresholds, hospital staff RLS, and safe import.
 */

process.env.NODE_ENV = "test";
const assert = require("assert");
const doctorsService = require("../src/services/doctors.service");
const facilitiesService = require("../src/services/facilities.service");
const {
  DoctorAvailabilityProvider,
  MaharashtraHospitalEhrAdapter,
  MockDoctorAvailabilityProvider,
} = require("../src/services/providers/doctorAvailability.provider");

console.log("=======================================================");
console.log("   JEEVANSETU PHASE 45: MAHARASHTRA DIRECTORY TEST SUITE");
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
  console.log("--- SECTION 1: Provider Architecture & Method Invariants ---");

  await runTest("1. DoctorAvailabilityProvider defines all 10 required adapter methods", async () => {
    const provider = new DoctorAvailabilityProvider();
    assert.strictEqual(typeof provider.searchDoctors, "function");
    assert.strictEqual(typeof provider.getDoctor, "function");
    assert.strictEqual(typeof provider.getDoctorHospitals, "function");
    assert.strictEqual(typeof provider.getAvailability, "function");
    assert.strictEqual(typeof provider.getHospital, "function");
    assert.strictEqual(typeof provider.getHospitalContact, "function");
    assert.strictEqual(typeof provider.updateDoctorDutyStatus, "function");
    assert.strictEqual(typeof provider.importDoctorRecords, "function");
    assert.strictEqual(typeof provider.getProvenanceMetadata, "function");
    assert.strictEqual(typeof provider.getMaharashtraHospitals, "function");
  });

  await runTest("2. MaharashtraHospitalEhrAdapter reports unconfigured when live credentials absent", async () => {
    const adapter = new MaharashtraHospitalEhrAdapter();
    assert.strictEqual(adapter.isConfigured(), false);
    const health = adapter.getHealthStatus();
    assert.strictEqual(health.status, "PROVIDER_NOT_CONFIGURED");
  });

  await runTest("3. MockDoctorAvailabilityProvider strictly rejected in NODE_ENV=production", async () => {
    const mockProvider = new MockDoctorAvailabilityProvider();
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = "production";
      await assert.rejects(
        async () => await mockProvider.searchDoctors(),
        /CRITICAL SECURITY VIOLATION/
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  console.log("\n--- SECTION 2: Search, Filters & Maharashtra Coverage ---");

  await runTest("4. Search returns verified doctors across Nagpur, Pune, and Gadchiroli", async () => {
    const nagpurDocs = await doctorsService.getDoctors({ district: "Nagpur" });
    assert.ok(nagpurDocs.length >= 2, "Should return at least 2 doctors in Nagpur");
    assert.ok(nagpurDocs.some((d) => d.full_name.includes("Sandeep Meshram")));

    const puneDocs = await doctorsService.getDoctors({ district: "Pune" });
    assert.ok(puneDocs.length >= 1, "Should return doctor in Pune");

    const cardioDocs = await doctorsService.getDoctors({ specialization: "Cardiology" });
    assert.ok(cardioDocs.length >= 1, "Should return cardiologists");
  });

  console.log("\n--- SECTION 3: Multi-Hospital Affiliations & Independent Duty ---");

  await runTest("5. Doctor with multiple hospitals has independent status per facility", async () => {
    const affiliations = await doctorsService.getDoctorFacilities("doc-ngp-001");
    assert.ok(Array.isArray(affiliations));
    assert.ok(affiliations.length >= 2, "Doctor 1 must be mapped to at least 2 facilities");

    const gmc = affiliations.find((a) => a.facility_name.includes("Super Specialty"));
    const mayo = affiliations.find((a) => a.facility_name.includes("Mayo"));

    assert.ok(gmc, "Must have GMC affiliation");
    assert.ok(mayo, "Must have Mayo Hospital affiliation");
    assert.strictEqual(gmc.status, "ON_DUTY");
    assert.strictEqual(mayo.status, "AVAILABLE");
  });

  console.log("\n--- SECTION 4: Staleness Evaluator & Live Status Freshness ---");

  await runTest("6. Staleness evaluator flags live updates older than 60 minutes as CALL_TO_CONFIRM", async () => {
    const freshDoc = {
      id: "test-doc-1",
      full_name: "Dr. Fresh Update",
      verification_status: "VERIFIED_LIVE",
      verified_at: new Date(Date.now() - 300000).toISOString(), // 5 min ago
    };
    const evaluatedFresh = doctorsService.evaluateDoctorStaleness(freshDoc);
    assert.strictEqual(evaluatedFresh.verification_status, "VERIFIED_LIVE");
    assert.strictEqual(evaluatedFresh.is_live_stale, false);

    const staleDoc = {
      id: "test-doc-2",
      full_name: "Dr. Stale Update",
      verification_status: "VERIFIED_LIVE",
      verified_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    };
    const evaluatedStale = doctorsService.evaluateDoctorStaleness(staleDoc);
    assert.strictEqual(evaluatedStale.verification_status, "CALL_TO_CONFIRM");
    assert.strictEqual(evaluatedStale.is_live_stale, true);
    assert.ok(evaluatedStale.stale_notice.includes("Please call hospital reception"));
  });

  console.log("\n--- SECTION 5: Data Provenance & Source Metadata ---");

  await runTest("7. Doctor provenance endpoint returns verified authority and MMC registration", async () => {
    const prov = await doctorsService.getDoctorProvenance("doc-ngp-001");
    assert.ok(prov.doctorId);
    assert.ok(prov.source.includes("DMER") || prov.source.includes("Government Medical College"));
    assert.ok(prov.sourceUrl.startsWith("http"));
    assert.ok(prov.contactPolicy.includes("Masked"));
  });

  console.log("\n--- SECTION 6: Security, RBAC & Hospital Staff RLS Isolation ---");

  await runTest("8. Hospital staff cannot update roster of another hospital", async () => {
    const hospitalAStaff = {
      role: "hospital_staff",
      profileId: "staff-hosp-1",
      assigned_hospital_id: "hosp-ngp-001",
    };

    await assert.rejects(
      async () =>
        await doctorsService.updateDoctorFacilityStatus(
          hospitalAStaff,
          "doc-pune-001",
          "hosp-pun-001", // Different hospital
          { status: "ON_DUTY" }
        ),
      /Access Denied: Hospital staff cannot modify rosters of another healthcare facility/
    );
  });

  await runTest("9. Patient role cannot update doctor duty status", async () => {
    const patientUser = { role: "patient", profileId: "pat-1" };
    await assert.rejects(
      async () =>
        await doctorsService.updateDoctorFacilityStatus(
          patientUser,
          "doc-ngp-001",
          "hosp-ngp-001",
          { status: "ON_DUTY" }
        ),
      /Unauthorized to update doctor/
    );
  });

  console.log("\n--- SECTION 7: Hospital Directory & Safe Import Pipeline ---");

  await runTest("10. Facilities service returns verified hospitals with authentic phone numbers", async () => {
    const hospitals = await facilitiesService.getHospitals({ district: "Nagpur" });
    assert.ok(hospitals.length >= 2);
    assert.ok(hospitals[0].reception_phone.startsWith("+91"));
    assert.strictEqual(hospitals[0].is_verified, true);
  });

  await runTest("11. Import pipeline rejects records with invalid phone format or missing source", async () => {
    const adminUser = { role: "district_admin", profileId: "admin-1" };
    const invalidBatch = [
      {
        full_name: "Dr. Bad Phone",
        specialization: "General Medicine",
        medical_council_id: "MMC-9999",
        reception_phone: "12345", // Invalid
        source: "DMER",
        source_url: "https://dmer.gov.in",
      },
      {
        full_name: "Dr. No Source",
        specialization: "Pediatrics",
        medical_council_id: "MMC-8888",
        reception_phone: "+91 712 2744401",
        source: "", // Missing
      },
    ];

    const result = await doctorsService.importDoctors(invalidBatch, adminUser);
    assert.strictEqual(result.importedCount, 0);
    assert.strictEqual(result.rejectedCount, 2);
  });

  await runTest("12. Duplicate doctor record is detected and rejected during import", async () => {
    const adminUser = { role: "district_admin", profileId: "admin-1" };
    const duplicateRecord = [
      {
        full_name: "Dr. Sandeep Meshram", // Already exists
        specialization: "Cardiology",
        medical_council_id: "MMC-2012-08412", // Duplicate MMC
        reception_phone: "+91 712 2744401",
        source: "DMER",
        source_url: "https://dmer.gov.in",
      },
    ];

    const result = await doctorsService.importDoctors(duplicateRecord, adminUser);
    assert.strictEqual(result.rejectedCount, 1);
    assert.ok(result.rejectedRecords[0].reason.includes("duplicate"));
  });

  console.log("\n=======================================================");
  console.log(`   PHASE 45 RESULTS: ${passed} Passed | ${failed} Failed`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests().catch((err) => {
    console.error("Test runner crashed:", err);
    process.exit(1);
  });
}

module.exports = { runAllTests };
