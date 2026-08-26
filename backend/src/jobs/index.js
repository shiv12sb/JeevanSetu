const { runInventoryAlertSweep } = require("./notification.jobs");
const { runSafeNotificationCleanup } = require("./cleanup.jobs");
const { runForecastingSweep } = require("./forecast.jobs");
const { runEarlyWarningSweep } = require("./earlyWarning.jobs");
const { runReferralFollowUpSweep } = require("./referralFollowUp.jobs");
const { runDoctorPresenceSweep } = require("./doctorPresence.jobs");
const { runInventoryStockoutSweep } = require("./inventoryStockoutJob");
const { runAttendanceMonitoringSweep } = require("./attendanceMonitoringJob");
const { runReferralContinuitySweep } = require("./referralContinuityJob");
const { runOutboxWorkerSweep } = require("./outboxWorkerJob");
const jobMonitor = require("../services/observability/jobMonitor.service");

let jobsInterval = null;

/**
 * Initialize background jobs runner
 */
const initBackgroundJobs = () => {
  // Run sweep every 15 minutes in production (or 5 minutes in dev)
  const SWEEP_INTERVAL = process.env.NODE_ENV === "production" ? 15 * 60 * 1000 : 5 * 60 * 1000;

  jobsInterval = setInterval(async () => {
    try {
      await jobMonitor.executeJob("OutboxWorkerSweep", runOutboxWorkerSweep).catch(() => {});
      await jobMonitor.executeJob("InventoryAlertSweep", runInventoryAlertSweep).catch(() => {});
      await jobMonitor.executeJob("ForecastingSweep", runForecastingSweep).catch(() => {});
      await jobMonitor.executeJob("InventoryStockoutSweep", runInventoryStockoutSweep).catch(() => {});
      await jobMonitor.executeJob("EarlyWarningSweep", runEarlyWarningSweep).catch(() => {});
      await jobMonitor.executeJob("ReferralFollowUpSweep", runReferralFollowUpSweep).catch(() => {});
      await jobMonitor.executeJob("ReferralContinuitySweep", runReferralContinuitySweep).catch(() => {});
      await jobMonitor.executeJob("DoctorPresenceSweep", runDoctorPresenceSweep).catch(() => {});
      await jobMonitor.executeJob("AttendanceMonitoringSweep", runAttendanceMonitoringSweep).catch(() => {});

      // Run cleanup periodically
      if (Math.random() < 0.05) {
        await jobMonitor.executeJob("NotificationCleanup", runSafeNotificationCleanup).catch(() => {});
      }
    } catch (err) {
      console.error("[BackgroundJobs] Worker cycle error:", err.message);
    }
  }, SWEEP_INTERVAL);

  // Unref so that background jobs do not block test suites or process termination
  if (jobsInterval && typeof jobsInterval.unref === "function") {
    jobsInterval.unref();
  }

  console.log("[BackgroundJobs] Notification, Outbox Worker, Forecasting, Inventory, Attendance, Referral Continuity, Early-Warning, Follow-Up, Doctor Presence & Maintenance workers initialized.");
};

const stopBackgroundJobs = () => {
  if (jobsInterval) {
    clearInterval(jobsInterval);
    jobsInterval = null;
  }
};

module.exports = {
  initBackgroundJobs,
  stopBackgroundJobs,
  runOutboxWorkerSweep: (fn) => jobMonitor.executeJob("OutboxWorkerSweep", runOutboxWorkerSweep),
  runForecastingSweep: (fn) => jobMonitor.executeJob("ForecastingSweep", runForecastingSweep),
  runInventoryStockoutSweep: (fn) => jobMonitor.executeJob("InventoryStockoutSweep", runInventoryStockoutSweep),
  runEarlyWarningSweep: (fn) => jobMonitor.executeJob("EarlyWarningSweep", runEarlyWarningSweep),
  runReferralFollowUpSweep: (fn) => jobMonitor.executeJob("ReferralFollowUpSweep", runReferralFollowUpSweep),
  runReferralContinuitySweep: (fn) => jobMonitor.executeJob("ReferralContinuitySweep", runReferralContinuitySweep),
  runDoctorPresenceSweep: (fn) => jobMonitor.executeJob("DoctorPresenceSweep", runDoctorPresenceSweep),
  runAttendanceMonitoringSweep: (fn) => jobMonitor.executeJob("AttendanceMonitoringSweep", runAttendanceMonitoringSweep),
};
