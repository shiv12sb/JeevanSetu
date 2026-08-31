/**
 * Unified Test Suite Runner for JeevanSetu Backend
 */

const { execSync } = require("child_process");
const path = require("path");

const testSuites = [
  "tests/phase26_citizen_feedback.test.js",
  "tests/phase27_early_warning.test.js",
  "tests/phase28_automation_n8n.test.js",
  "tests/phase29_observability_reliability.test.js",
  "tests/phase30_security_hardening.test.js",
  "tests/phase31_deployment_release.test.js",
  "tests/phase32_final_qa_uat.test.js",
  "tests/phase33_release_candidate.test.js",
  "tests/phase34_operations_readiness.test.js",
  "tests/phase35_launch_rehearsal.test.js",
  "tests/phase36_production_hardening.test.js",
  "tests/phase37_governance_handover.test.js",
  "tests/phase38_field_readiness_uat.test.js",
  "tests/phase39_pilot_deployment_release.test.js",
  "tests/phase40_scale_reliability.test.js",
  "tests/phase41_security_compliance.test.js",
  "tests/phase42_observability_sre.test.js",
  "tests/phase43_ambulance_tracking.test.js",
  "tests/phase44_rural_health_access.test.js",
  "tests/phase45_maharashtra_doctor_directory.test.js",
  "tests/phase46_abdm_statewide_registry_sync.test.js",
  "tests/ai_assistant_voice.test.js",
  "tests/theme_consistency.test.js",
];

console.log("=======================================================");
console.log("   RUNNING JEEVANSETU UNIFIED AUTOMATED TEST SUITE");
console.log("=======================================================\n");

let passedSuites = 0;
let failedSuites = 0;

for (const suite of testSuites) {
  const fullPath = path.resolve(__dirname, "..", suite);
  console.log(`\n▶ Running Suite: ${suite}...`);
  try {
    execSync(`node "${fullPath}"`, {
      stdio: "inherit",
      cwd: path.resolve(__dirname, ".."),
      env: {
        ...process.env,
        NODE_ENV: "test",
        MOCK_PROVIDERS: "true",
        SUPABASE_URL: "https://placeholder-project.supabase.co",
      },
    });
    passedSuites++;
  } catch (err) {
    console.error(`\n✖ Suite Failed: ${suite}`);
    failedSuites++;
  }
}

console.log("\n=======================================================");
console.log(`   SUITES SUMMARY: ${passedSuites} Passed | ${failedSuites} Failed`);
console.log("=======================================================\n");

if (failedSuites > 0) {
  process.exit(1);
}
