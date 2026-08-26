const assert = require("assert");
const http = require("http");
const app = require("../src/app");
const notificationService = require("../src/services/notification.service");
const referralsService = require("../src/services/referrals.service");
const inventoryService = require("../src/services/inventory.service");
const { runSafeNotificationCleanup } = require("../src/jobs/cleanup.jobs");

async function runNotificationTests() {
  console.log("==================================================");
  console.log("Running JeevanSetu Phase 6 Notification & Job Tests");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  // Test 1: Direct notification creation with deduplication
  try {
    const notif1 = await notificationService.createNotification({
      recipient_id: "test-user-1",
      type: "referral_update",
      title: "Referral Confirmed",
      message: "Your referral has been confirmed.",
      metadata: { dedup_key: "ref_test_001" },
    });
    assert(notif1 !== null, "Notification should be created");
    assert.strictEqual(notif1.title, "Referral Confirmed");

    // Attempt to create exact duplicate
    const notif2 = await notificationService.createNotification({
      recipient_id: "test-user-1",
      type: "referral_update",
      title: "Referral Confirmed",
      message: "Your referral has been confirmed.",
      metadata: { dedup_key: "ref_test_001" },
    });
    assert.strictEqual(notif1.id, notif2.id, "Duplicate notification should return existing without creating a new record");
    console.log("✔ Test 1: Notification creation & deduplication protection passed");
    passed++;
  } catch (err) {
    console.error("✖ Test 1 Failed:", err.message);
    failed++;
  }

  // Test 2: Referral creation triggers notification
  try {
    const fakeUser = { profileId: "user-patient-abc", role: "phc_staff", assignedPhcId: "phc-1" };
    const newRef = await referralsService.createReferral(fakeUser, {
      patient_id: "user-patient-abc",
      required_specialty: "Cardiology",
      clinical_summary: "Patient referral test",
    });
    assert(newRef !== null, "Referral created");

    const notifs = await notificationService.getNotifications(
      { profileId: "user-patient-abc" },
      { limit: 10 }
    );
    assert(notifs.items.length > 0, "Patient should receive notification upon referral creation");
    console.log("✔ Test 2: Referral creation dispatches notification to patient");
    passed++;
  } catch (err) {
    console.error("✖ Test 2 Failed:", err.message);
    failed++;
  }

  // Test 3: Referral status update triggers notification
  try {
    const fakeHospitalUser = { profileId: "user-hosp-abc", role: "hospital_staff" };
    await referralsService.updateReferral(fakeHospitalUser, "r1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c", {
      status: "destination_accepted",
      note: "Accepted at civil hospital",
    });

    const notifs = await notificationService.getNotifications(
      { profileId: "p1" },
      { limit: 10 }
    );
    assert(
      notifs.items.some((n) => n.title.includes("DESTINATION ACCEPTED") || n.type === "referral_update"),
      "Notification list should contain referral status update"
    );
    console.log("✔ Test 3: Referral status change dispatches notification");
    passed++;
  } catch (err) {
    console.error("✖ Test 3 Failed:", err.message);
    failed++;
  }

  // Test 4: Low stock inventory triggers alert
  try {
    const alertResult = await notificationService.notifyMedicineLowStock({
      phc_id: "phc-1",
      medicine_id: "med-paracetamol",
      medicine_name: "Paracetamol 500mg",
      current_qty: 25,
      threshold: 100,
    });
    assert(Array.isArray(alertResult) && alertResult.length > 0, "Low stock notification dispatched to staff");
    console.log("✔ Test 4: Low medicine threshold generates stock alert");
    passed++;
  } catch (err) {
    console.error("✖ Test 4 Failed:", err.message);
    failed++;
  }

  // Test 5: Mark notification read & mark all read
  try {
    const fakeUser = { profileId: "test-user-1" };
    await notificationService.markAllRead(fakeUser);
    const unread = await notificationService.getNotifications(fakeUser, { unread_only: true });
    assert.strictEqual(unread.unread_count, 0, "Unread count should be 0 after markAllRead");
    console.log("✔ Test 5: Mark all notifications read works");
    passed++;
  } catch (err) {
    console.error("✖ Test 5 Failed:", err.message);
    failed++;
  }

  // Test 6: Non-destructive background job execution
  try {
    await runSafeNotificationCleanup();
    console.log("✔ Test 6: Safe non-destructive maintenance job runs without error");
    passed++;
  } catch (err) {
    console.error("✖ Test 6 Failed:", err.message);
    failed++;
  }

  console.log("==================================================");
  console.log(`Phase 6 Tests: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runNotificationTests().catch((e) => {
  console.error("Test execution error:", e);
  process.exit(1);
});
