/**
 * ==============================================================================
 * JEEVANSETU PHASE 43 — REAL-TIME AMBULANCE ACCESS & TRACKING TEST SUITE
 * ==============================================================================
 * Validates ambulance discovery, dispatch lifecycle, real-time tracking,
 * staleness timers, provider abstraction, and strict real-data guarantees.
 */

const assert = require("assert");
const ambulanceService = require("../src/services/ambulance.service");
const {
  BaseAmbulanceProvider,
  Maharashtra108DispatchAdapter,
  MockAmbulanceProvider,
} = require("../src/services/providers/ambulance.provider");

console.log("=======================================================");
console.log("   JEEVANSETU PHASE 43: AMBULANCE MODULE TEST SUITE");
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
  console.log("--- SECTION 1: Provider Architecture & Real-Data Invariants ---");

  await runTest("1. BaseAmbulanceProvider defines required adapter methods", () => {
    const base = new BaseAmbulanceProvider();
    assert.strictEqual(base.category, "AMBULANCE");
    assert.rejects(async () => await base.searchNearby({}));
    assert.rejects(async () => await base.requestDispatch({}));
    assert.rejects(async () => await base.cancelDispatch("id", "reason"));
    assert.rejects(async () => await base.getLiveLocation("trip-1"));
    assert.rejects(async () => await base.getFareEstimate({}));
  });

  await runTest("2. Maharashtra108DispatchAdapter reports unconfigured when credentials missing", () => {
    const adapter = new Maharashtra108DispatchAdapter();
    assert.strictEqual(adapter.name, "Maharashtra108DispatchAdapter");
    // Without env vars, isConfigured returns false
    assert.strictEqual(adapter.isConfigured(), Boolean(process.env.MAHARASHTRA_108_API_KEY && process.env.MAHARASHTRA_108_API_URL));
  });

  await runTest("3. MockAmbulanceProvider strictly rejected in NODE_ENV=production", async () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const mock = new MockAmbulanceProvider();

    await assert.rejects(
      async () => await mock.searchNearby({}),
      /Development simulation is strictly disabled in production/
    );
    await assert.rejects(
      async () => await mock.requestDispatch({}),
      /Development simulation is strictly disabled in production/
    );
    await assert.rejects(
      async () => await mock.getLiveLocation("trip-1"),
      /Development simulation is strictly disabled in production/
    );

    process.env.NODE_ENV = origEnv;
  });

  console.log("\n--- SECTION 2: Discovery & Geolocation Resolution ---");

  await runTest("4. Nearby ambulance search returns verified units in dev/simulation", async () => {
    const res = await ambulanceService.searchNearbyAmbulances({
      lat: 21.1458,
      lng: 79.0882,
      district: "Nagpur",
      radiusKm: 20,
    });

    assert.ok(res.configured, "Provider is configured");
    assert.ok(Array.isArray(res.ambulances), "Returns ambulances array");
    assert.ok(res.ambulances.length > 0, "Finds nearby units");

    const first = res.ambulances[0];
    assert.ok(first.vehicleNumber, "Has vehicle registration");
    assert.ok(first.ambulanceType, "Has ambulance type");
    assert.ok(first.distanceKm > 0, "Calculates distance");
    assert.ok(first.etaMinutes > 0, "Calculates ETA");
    assert.strictEqual(first.maskedContact, "108", "Masks contact via 108 dispatch");
  });

  await runTest("5. Ambulance type filter returns specific ALS / BLS units", async () => {
    const res = await ambulanceService.searchNearbyAmbulances({
      lat: 21.1458,
      lng: 79.0882,
      district: "Nagpur",
      type: "ADVANCED_LIFE_SUPPORT",
    });

    assert.ok(res.ambulances.length > 0);
  });

  console.log("\n--- SECTION 3: Booking & Dispatch Lifecycle ---");

  await runTest("6. Create dispatch request validates required pickup and phone", async () => {
    await assert.rejects(
      async () => await ambulanceService.createRequest("user-1", { patientPhone: "" }),
      /Pickup address and contact phone number are required/
    );
  });

  await runTest("7. Create dispatch request successfully assigns ambulance in dev", async () => {
    const booking = await ambulanceService.createRequest("user-1", {
      patientName: "Ramesh Pawar",
      patientPhone: "+91 98220 11111",
      requestedType: "ADVANCED_LIFE_SUPPORT",
      pickupAddress: "Ramtek Gram Panchayat, Nagpur",
      pickupDistrict: "Nagpur",
      pickupLat: 21.3965,
      pickupLng: 79.3321,
      destinationFacilityName: "GMC Trauma Care Nagpur",
      emergencySeverity: "CRITICAL_EMERGENCY",
    });

    assert.ok(booking.success, "Booking accepted");
    assert.ok(booking.requestId, "Generates request ID");
    assert.ok(booking.tripId, "Generates trip ID");
    assert.strictEqual(booking.status, "EN_ROUTE", "Transitions to EN_ROUTE");
    assert.strictEqual(booking.maskedContact, "108", "Preserves masked 108 contact");
  });

  await runTest("8. Cancel dispatch request transitions status to CANCELLED", async () => {
    const cancelRes = await ambulanceService.cancelRequest("req-123", "Patient arranged private vehicle", "user-1");
    assert.ok(cancelRes.success);
    assert.strictEqual(cancelRes.status, "CANCELLED");
  });

  console.log("\n--- SECTION 4: Real-Time Telematics & Staleness Detection ---");

  await runTest("9. Real-time trip location returns active GPS coordinates and ETA", async () => {
    const loc = await ambulanceService.getTripLocation("trip-999");
    assert.ok(loc.currentLat, "Has latitude");
    assert.ok(loc.currentLng, "Has longitude");
    assert.ok(loc.etaMinutes > 0, "Has remaining ETA");
    assert.strictEqual(loc.isStale, false, "Fresh signal is not stale");
  });

  await runTest("10. Stale signal detector flags delayed telematics (> 60s)", async () => {
    const origGetProvider = ambulanceService.getProvider.bind(ambulanceService);
    const mock = new MockAmbulanceProvider();
    // Simulate stale timestamp 120 seconds ago
    const staleTime = new Date(Date.now() - 120000).toISOString();
    mock.getLiveLocation = async () => ({
      tripId: "trip-stale",
      currentLat: 21.1458,
      currentLng: 79.0882,
      lastLocationUpdate: staleTime,
    });

    ambulanceService.getProvider = () => mock;
    const loc = await ambulanceService.getTripLocation("trip-stale");

    assert.strictEqual(loc.isStale, true, "Flags signal as stale");
    assert.ok(loc.lastUpdatedSecondsAgo >= 100, "Calculates elapsed seconds");
    ambulanceService.getProvider = origGetProvider;
  });

  console.log("\n--- SECTION 5: Tariff & Cost Policy Invariants ---");

  await runTest("11. Emergency Life Support ambulances are 100% Free under NHM", async () => {
    const fare = await ambulanceService.getFareEstimate({ type: "ADVANCED_LIFE_SUPPORT" });
    assert.strictEqual(fare.isFreeGovtService, true);
    assert.ok(fare.estimatedFare.includes("100% Free"));
  });

  await runTest("12. Non-emergency transport indicates reimbursement under PM-JAY / MJPJAY", async () => {
    const fare = await ambulanceService.getFareEstimate({ type: "PATIENT_TRANSPORT" });
    assert.strictEqual(fare.isFreeGovtService, false);
    assert.ok(fare.fareNote.includes("MJPJAY") || fare.fareNote.includes("PM-JAY"));
  });

  console.log("\n=======================================================");
  console.log(`   PHASE 43 RESULTS: ${passed} Passed | ${failed} Failed`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
