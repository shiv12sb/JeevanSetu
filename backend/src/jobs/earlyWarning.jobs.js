const earlyWarningService = require("../services/earlyWarning/earlyWarning.service");

/**
 * Scheduled background worker: Run periodic anomaly surveillance sweep
 */
const runEarlyWarningSweep = async () => {
  try {
    const result = await earlyWarningService.runPeriodicEarlyWarningSweep();
    return result;
  } catch (err) {
    console.error("[BackgroundJobs] Early warning sweep worker error:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  runEarlyWarningSweep,
};
