const assert = require("assert");
const abdmHprService = require("../src/services/abdmHprIngestion.service");
const doctorsService = require("../src/services/doctors.service");

async function runTests() {
  console.log("=======================================================");
  console.log("   JEEVANSETU PHASE 46: STATEWIDE ABDM & COUNCILS SYNC");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error("    Error:", err.message);
      failed++;
    }
  }

  console.log("--- SECTION 1: Statutory Council Capacities & Benchmarks ---");
  await test("1. Statutory benchmarks define MMC (1.5L+), MCIM (85K+), MHC (60K+)", async () => {
    const benchmarks = abdmHprService.MAHARASHTRA_COUNCIL_BENCHMARKS;
    assert.ok(benchmarks.MMC_ALLOPATHIC.total_registered >= 150000);
    assert.ok(benchmarks.MCIM_AYUSH.total_registered >= 85000);
    assert.ok(benchmarks.MHC_HOMEOPATHY.total_registered >= 60000);
  });

  await test("2. Registry sync status returns live council distribution metrics", async () => {
    const res = await abdmHprService.getRegistrySyncStatus();
    assert.strictEqual(res.success, true);
    assert.ok(res.data.total_ingested_records >= 250000);
    assert.strictEqual(res.data.districts_covered, 36);
  });

  console.log("\n--- SECTION 2: BAMS, MBBS & Qualification Filtering ---");
  await test("3. Doctor search filters BAMS practitioners correctly", async () => {
    const bamsDoctors = await doctorsService.getDoctors({ degree_type: "BAMS" });
    assert.ok(bamsDoctors.length > 0);
    assert.ok(bamsDoctors.some((d) => d.degree.includes("BAMS")));
  });

  await test("4. Doctor search filters MBBS/MD specialists correctly", async () => {
    const mbbsDoctors = await doctorsService.getDoctors({ degree_type: "MBBS" });
    assert.ok(mbbsDoctors.length > 0);
    assert.ok(mbbsDoctors.some((d) => d.degree.includes("MBBS")));
  });

  console.log("\n--- SECTION 3: ABDM HPR Connector Verification ---");
  await test("5. ABDM HPR lookup returns valid HPID and Council Verification", async () => {
    const hprRecord = await abdmHprService.searchAbdmHpr({
      council_id: "MMC-2004-01982",
      name: "Dr. Khan Shamim",
      district: "Nagpur",
    });
    assert.strictEqual(hprRecord.verified, true);
    assert.ok(hprRecord.hpid.includes("@hpr.abdm"));
    assert.strictEqual(hprRecord.council_registration, "MMC-2004-01982");
  });

  console.log("\n--- SECTION 4: Ingestion Job Access Control ---");
  await test("6. Non-admin users cannot trigger statewide ingestion", async () => {
    const patientUser = { id: "u-patient", role: "patient" };
    await assert.rejects(
      async () => {
        await abdmHprService.triggerStatewideIngestion(patientUser);
      },
      /Unauthorized/
    );
  });

  await test("7. District Admin can initiate statewide sync successfully", async () => {
    const adminUser = { id: "u-admin", role: "district_admin" };
    const res = await abdmHprService.triggerStatewideIngestion(adminUser);
    assert.strictEqual(res.success, true);
    assert.ok(res.batch_id.startsWith("BATCH-MAHA-"));
  });

  console.log("\n=======================================================");
  console.log(`   PHASE 46 RESULTS: ${passed} Passed | ${failed} Failed`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
