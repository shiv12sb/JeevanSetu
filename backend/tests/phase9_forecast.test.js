const assert = require("assert");
const { calculateMedicineForecast } = require("../src/services/forecasting/forecast.utils");
const medicineForecastService = require("../src/services/forecasting/medicineForecast.service");
const { runForecastingSweep } = require("../src/jobs/forecast.jobs");
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

const runPhase9Tests = async () => {
  console.log("\n=======================================================");
  console.log("   JEEVANSETU PHASE 9 — MEDICINE FORECASTING TESTS");
  console.log("=======================================================\n");

  const mockPhcStaff = { profileId: "phc-staff-001", role: "phc_staff", assignedPhcId: "phc-1" };
  const mockDoctor = { profileId: "doc-uuid-001", role: "doctor", doctorId: "doc-1" };
  const mockAdmin = { profileId: "admin-uuid-001", role: "district_admin" };
  const mockPatient = { profileId: "pat-uuid-001", role: "patient" };

  const today = new Date();

  // -------------------------------------------------------------------------
  // 1. Synthetic Pattern A: Stable Daily Consumption
  // -------------------------------------------------------------------------
  console.log("--- 1. Synthetic Pattern A: Stable Daily Consumption ---");
  const stableUsage = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (14 - i));
    return { quantity_consumed: 30, recorded_date: d.toISOString().split("T")[0] };
  });

  const resPatternA = calculateMedicineForecast({
    currentQuantity: 300,
    minimumThreshold: 100,
    usageRecords: stableUsage,
    calculationDate: today,
  });

  test(resPatternA.status === "calculated", "Pattern A: Calculated successfully");
  test(resPatternA.estimated_daily_consumption === 30, "Pattern A: Exact daily consumption matches 30/day");
  test(resPatternA.estimated_days_remaining === 10, "Pattern A: 300 stock / 30 day = 10.0 days remaining");
  test(resPatternA.consumption_trend === "stable", "Pattern A: Trend identified as 'stable'");
  test(resPatternA.risk_level === "MEDIUM", "Pattern A: 10 days remaining categorized as 'MEDIUM' risk");
  test(resPatternA.data_quality === "HIGH", "Pattern A: 14 days of uniform data categorized as 'HIGH' data quality");

  // -------------------------------------------------------------------------
  // 2. Synthetic Pattern B: Increasing Consumption Trend
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Synthetic Pattern B: Increasing Consumption Trend ---");
  const increasingUsage = [
    // Prior 7 days: 10 units/day
    ...Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (14 - i));
      return { quantity_consumed: 10, recorded_date: d.toISOString().split("T")[0] };
    }),
    // Recent 7 days: 30 units/day (3x surge)
    ...Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (7 - i));
      return { quantity_consumed: 30, recorded_date: d.toISOString().split("T")[0] };
    }),
  ];

  const resPatternB = calculateMedicineForecast({
    currentQuantity: 100,
    minimumThreshold: 100,
    usageRecords: increasingUsage,
    calculationDate: today,
  });

  test(resPatternB.consumption_trend === "increasing", "Pattern B: Surge in recent usage detected as 'increasing' trend");
  test(resPatternB.estimated_daily_consumption > 20, "Pattern B: Weighted daily usage reflects recency bias (w=0.65)");
  test(resPatternB.risk_level === "CRITICAL", "Pattern B: High burn + low stock classified as 'CRITICAL' risk");

  // -------------------------------------------------------------------------
  // 3. Synthetic Pattern C: Decreasing Consumption Trend
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Synthetic Pattern C: Decreasing Consumption Trend ---");
  const decreasingUsage = [
    // Prior 7 days: 40 units/day
    ...Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (14 - i));
      return { quantity_consumed: 40, recorded_date: d.toISOString().split("T")[0] };
    }),
    // Recent 7 days: 10 units/day (Drop)
    ...Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (7 - i));
      return { quantity_consumed: 10, recorded_date: d.toISOString().split("T")[0] };
    }),
  ];

  const resPatternC = calculateMedicineForecast({
    currentQuantity: 200,
    minimumThreshold: 50,
    usageRecords: decreasingUsage,
    calculationDate: today,
  });

  test(resPatternC.consumption_trend === "decreasing", "Pattern C: Drop in recent usage detected as 'decreasing' trend");

  // -------------------------------------------------------------------------
  // 4. Synthetic Pattern D: Highly Variable Spikes
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Synthetic Pattern D: Highly Variable Spikes ---");
  const variableUsage = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (8 - i) * 2);
    return { quantity_consumed: i % 2 === 0 ? 100 : 2, recorded_date: d.toISOString().split("T")[0] };
  });

  const resPatternD = calculateMedicineForecast({
    currentQuantity: 250,
    minimumThreshold: 50,
    usageRecords: variableUsage,
    calculationDate: today,
  });

  test(resPatternD.consumption_trend === "highly_variable", "Pattern D: High variance detected as 'highly_variable'");
  test(resPatternD.data_quality === "LOW", "Pattern D: High volatility downgrades data quality to 'LOW'");

  // -------------------------------------------------------------------------
  // 5. Synthetic Pattern E: Insufficient Data (< 3 Records)
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Synthetic Pattern E: Insufficient Historical Data ---");
  const sparseUsage = [
    { quantity_consumed: 15, recorded_date: today.toISOString().split("T")[0] },
    { quantity_consumed: 20, recorded_date: new Date(today.getTime() - 86400000).toISOString().split("T")[0] },
  ];

  const resPatternE = calculateMedicineForecast({
    currentQuantity: 500,
    minimumThreshold: 100,
    usageRecords: sparseUsage,
    calculationDate: today,
  });

  test(resPatternE.status === "insufficient_data", "Pattern E: < 3 records returns status 'insufficient_data'");
  test(resPatternE.estimated_days_remaining === null, "Pattern E: Days remaining is safely null (no hallucinated numbers)");
  test(resPatternE.data_quality === "INSUFFICIENT_DATA", "Pattern E: Data quality marked 'INSUFFICIENT_DATA'");

  // -------------------------------------------------------------------------
  // 6. Zero Consumption & Edge Cases
  // -------------------------------------------------------------------------
  console.log("\n--- 6. Zero Consumption & Edge Cases ---");
  const zeroUsage = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (5 - i));
    return { quantity_consumed: 0, recorded_date: d.toISOString().split("T")[0] };
  });

  const resZero = calculateMedicineForecast({
    currentQuantity: 100,
    minimumThreshold: 50,
    usageRecords: zeroUsage,
    calculationDate: today,
  });
  test(resZero.status === "no_recent_consumption", "Zero consumption records handled safely without divide-by-zero");
  test(resZero.estimated_days_remaining === null, "Zero consumption returns null days remaining");

  // Current stock zero
  const resStockZero = calculateMedicineForecast({
    currentQuantity: 0,
    minimumThreshold: 100,
    usageRecords: stableUsage,
    calculationDate: today,
  });
  test((resStockZero.risk_level === "CRITICAL" || resStockZero.risk_level === "OUT_OF_STOCK") && resStockZero.estimated_days_remaining === 0, "Zero stock count immediately returns CRITICAL/OUT_OF_STOCK and 0 days remaining");

  // Invalid data filtering
  const badDataUsage = [
    { quantity_consumed: -50, recorded_date: "invalid-date" },
    ...stableUsage,
  ];
  const resBadData = calculateMedicineForecast({
    currentQuantity: 300,
    minimumThreshold: 100,
    usageRecords: badDataUsage,
    calculationDate: today,
  });
  test(resBadData.status === "calculated" && resBadData.estimated_daily_consumption === 30, "Invalid records (negative quantities, bad dates) filtered safely");

  // -------------------------------------------------------------------------
  // 7. Medicine Forecast Service & Background Jobs
  // -------------------------------------------------------------------------
  console.log("\n--- 7. Forecast Service & Background Jobs ---");
  const facilityForecasts = await medicineForecastService.getForecasts(mockPhcStaff, { phc_id: "phc-1" });
  test(facilityForecasts && Array.isArray(facilityForecasts.items), "Service retrieves facility forecasts");
  test(facilityForecasts.items.length >= 3, "Multiple essential medicines processed in facility forecast");

  const singleItem = await medicineForecastService.calculateItemForecast("phc-1", "med-1");
  test(singleItem && singleItem.medicine_id === "med-1", "Single item forecast calculated correctly");

  const jobResult = await runForecastingSweep();
  test(jobResult && jobResult.success === true, "Background scheduled sweep runs idempotently without error");

  // -------------------------------------------------------------------------
  // 8. AI Assistant Grounded Forecast Integration
  // -------------------------------------------------------------------------
  console.log("\n--- 8. AI Grounded Forecast Retrieval ---");
  const aiChatRes = await aiService.processChat({
    user: mockPhcStaff,
    message: "Will Paracetamol or Amlodipine run out soon at our PHC?",
    language: "en",
  });
  test(aiChatRes && aiChatRes.sources.includes("JeevanSetu Depletion Forecasting Engine") || aiChatRes.sources.includes("PHC Live Stock Surveillance"), "AI retrieves verified forecasting data for response grounding");
  test(aiChatRes.safetyLevel === "safe", "AI response remains safe and non-diagnostic");

  console.log("\n=======================================================");
  console.log(`   TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
};

runPhase9Tests().catch((e) => {
  console.error("Test execution error:", e);
  process.exit(1);
});
