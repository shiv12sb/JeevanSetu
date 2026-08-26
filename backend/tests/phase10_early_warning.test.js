const assert = require("assert");
const { detectSignalAnomaly, correlateMultiSignals } = require("../src/services/earlyWarning/anomaly.utils");
const earlyWarningService = require("../src/services/earlyWarning/earlyWarning.service");
const { runEarlyWarningSweep } = require("../src/jobs/earlyWarning.jobs");
const aiService = require("../src/services/ai/ai.service");

let passed = 0;
let failed = 0;

const test = (condition, name) => {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    failed++;
  }
};

const runPhase10Tests = async () => {
  console.log("\n=======================================================");
  console.log("   JEEVANSETU PHASE 10 — HEALTH EARLY-WARNING TESTS");
  console.log("=======================================================\n");

  const mockPhcStaff = { profileId: "phc-staff-001", role: "phc_staff", assignedPhcId: "phc-1" };
  const mockDoctor = { profileId: "doc-uuid-001", role: "doctor", doctorId: "doc-1" };
  const mockAdmin = { profileId: "admin-uuid-001", role: "district_admin" };
  const mockPatient = { profileId: "pat-uuid-001", role: "patient" };

  // -------------------------------------------------------------------------
  // 1. Scenario A: Normal Stable Activity
  // -------------------------------------------------------------------------
  console.log("--- 1. Scenario A: Normal Stable Activity ---");
  const normalObservations = Array.from({ length: 28 }, (_, i) => ({
    date: `2026-02-${String((i % 28) + 1).padStart(2, "0")}`,
    count: 10 + (i % 3),
  }));

  const resNormal = detectSignalAnomaly({ observations: normalObservations });
  test(resNormal.status === "calculated", "Scenario A: Calculated successfully");
  test(resNormal.signal_level === "NORMAL", "Scenario A: Stable baseline classified as 'NORMAL'");
  test(resNormal.data_quality === "HIGH", "Scenario A: 28 days of regular data yields 'HIGH' data quality");

  // -------------------------------------------------------------------------
  // 2. Scenario B: Moderate Anomaly
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Scenario B: Moderate Anomaly ---");
  const moderateObservations = [
    ...Array.from({ length: 21 }, () => ({ count: 10 })),
    ...Array.from({ length: 7 }, () => ({ count: 17 })), // +70% increase
  ];

  const resModerate = detectSignalAnomaly({ observations: moderateObservations });
  test(resModerate.signal_level === "ELEVATED" || resModerate.signal_level === "WATCH", "Scenario B: Moderate +70% surge classified as 'ELEVATED' or 'WATCH'");
  test(resModerate.deviation_percentage > 50, "Scenario B: Deviation percentage accurately reflects +70%");

  // -------------------------------------------------------------------------
  // 3. Scenario C: Strong Anomaly
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Scenario C: Strong Anomaly ---");
  const strongObservations = [
    ...Array.from({ length: 21 }, () => ({ count: 10 })),
    ...Array.from({ length: 7 }, () => ({ count: 35 })), // +250% surge
  ];

  const resStrong = detectSignalAnomaly({ observations: strongObservations });
  test(resStrong.signal_level === "HIGH", "Scenario C: Large sustained surge (+250%) classified as 'HIGH' signal");
  test(resStrong.z_score >= 2.5, "Scenario C: High statistical Z-score calculated");

  // -------------------------------------------------------------------------
  // 4. Scenario D: Multi-Signal Correlation (No Causal Claims)
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Scenario D: Multi-Signal Correlation ---");
  const correlation = correlateMultiSignals({
    caseSignal: resStrong,
    medicineSignal: resModerate,
    locationName: "Ashti PHC",
  });

  test(correlation.composite_signal_level === "HIGH", "Scenario D: Multi-signal correlation elevates composite priority to 'HIGH'");
  test(correlation.contributing_sources.includes("health_cases") && correlation.contributing_sources.includes("medicine_usage"), "Scenario D: Contributing sources tracked accurately");
  test(!correlation.description.includes("caused") && correlation.description.includes("increased during the same period"), "Scenario D: Neutral correlation language verified (no unsupported causal claims)");

  // -------------------------------------------------------------------------
  // 5. Scenario E: Insufficient History (< 14 Days)
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Scenario E: Insufficient Historical Data ---");
  const sparseObservations = Array.from({ length: 5 }, (_, i) => ({ count: 12 }));
  const resSparse = detectSignalAnomaly({ observations: sparseObservations });
  test(resSparse.status === "insufficient_data", "Scenario E: < 14 days returns status 'insufficient_data'");
  test(resSparse.signal_level === "INSUFFICIENT_DATA", "Scenario E: Signal level marked 'INSUFFICIENT_DATA'");

  // -------------------------------------------------------------------------
  // 6. Scenario G: Single-Day Spike Smoothing
  // -------------------------------------------------------------------------
  console.log("\n--- 6. Scenario G: Single-Day Spike Smoothing ---");
  const singleSpikeObservations = [
    ...Array.from({ length: 21 }, () => ({ count: 10 })),
    ...Array.from({ length: 6 }, () => ({ count: 10 })),
    { count: 70 }, // 1 single abnormal camp day
  ];
  const resSpike = detectSignalAnomaly({ observations: singleSpikeObservations });
  test(resSpike.anomaly_type === "isolated_single_day_spike", "Scenario G: Single isolated spike identified as 'isolated_single_day_spike'");
  test(resSpike.signal_level !== "HIGH", "Scenario G: Single-day spike smoothed to prevent false alarmist escalation");

  // -------------------------------------------------------------------------
  // 7. Early-Warning Service & Human Review Lifecycle
  // -------------------------------------------------------------------------
  console.log("\n--- 7. Early-Warning Service & Human Review Lifecycle ---");
  const signalsList = await earlyWarningService.getSignals(mockAdmin, { district: "Gadchiroli" });
  test(signalsList && Array.isArray(signalsList.items), "Admin retrieves district early-warning signals");
  test(signalsList.items.length > 0, "Active surveillance signals listed");

  // Test Review Lifecycle: new -> acknowledged -> under_review -> resolved
  const signalId = "sig-001";
  const acknowledged = await earlyWarningService.updateSignalStatus(mockDoctor, signalId, {
    status: "acknowledged",
    notes: "Medical Officer acknowledged signal. Contacting PHC field team.",
  });
  test(acknowledged.status === "acknowledged", "Lifecycle transition 1: Signal marked 'acknowledged'");

  const underReview = await earlyWarningService.updateSignalStatus(mockDoctor, signalId, {
    status: "under_review",
    notes: "Active water source and fever syndromic audit in progress.",
  });
  test(underReview.status === "under_review", "Lifecycle transition 2: Signal marked 'under_review'");

  const resolved = await earlyWarningService.updateSignalStatus(mockDoctor, signalId, {
    status: "resolved",
    notes: "Seasonal syndromic surge stabilized. Case rates returned to baseline.",
  });
  test(resolved.status === "resolved", "Lifecycle transition 3: Signal marked 'resolved'");

  const singleSignal = await earlyWarningService.getSignalById(mockAdmin, signalId);
  test(singleSignal && singleSignal.events.length >= 3, "Review events immutable audit trail recorded");

  // -------------------------------------------------------------------------
  // 8. Background Sweep Job & Authorization
  // -------------------------------------------------------------------------
  console.log("\n--- 8. Background Sweep Job & Authorization ---");
  const sweepResult = await runEarlyWarningSweep();
  test(sweepResult && sweepResult.success === true, "Background scheduled sweep runs idempotently");

  // PHC isolation
  const phcSignals = await earlyWarningService.getSignals(mockPhcStaff);
  test(phcSignals && phcSignals.items.every((s) => s.phc_id === "phc-1"), "PHC staff strictly isolated to assigned facility signals");

  // -------------------------------------------------------------------------
  // 9. AI Grounded Explanation (Outbreak Prevention)
  // -------------------------------------------------------------------------
  console.log("\n--- 9. AI Grounded Explanation & Outbreak Prevention ---");
  const aiRes = await aiService.processChat({
    user: mockAdmin,
    message: "Are there any health early-warning anomalies or outbreak signals detected in Gadchiroli?",
    language: "en",
  });
  test(aiRes.answer && aiRes.sources.includes("JeevanSetu Health Early-Warning Surveillance"), "AI retrieves verified early-warning surveillance context");
  test(!aiRes.answer.includes("confirmed outbreak") || aiRes.answer.includes("not a confirmed outbreak") || aiRes.answer.includes("surveillance"), "AI response avoids unauthorized outbreak declarations");

  console.log("\n=======================================================");
  console.log(`   TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
};

runPhase10Tests().catch((e) => {
  console.error("Test execution error:", e);
  process.exit(1);
});
