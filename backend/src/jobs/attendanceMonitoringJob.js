const attendanceService = require("../services/attendance.service");

/**
 * Scheduled background worker: Monitor today's doctor attendance, detect missing/late check-in, and correlate duty records
 */
const runAttendanceMonitoringSweep = async () => {
  try {
    const result = await attendanceService.runScheduledAttendanceSweep();
    return result;
  } catch (err) {
    console.error("[BackgroundJobs] Attendance monitoring sweep error:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  runAttendanceMonitoringSweep,
};
