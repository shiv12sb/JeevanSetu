const doctorPresenceService = require("../services/doctorPresence.service");

/**
 * Background Job: Evaluate doctor presence, missing check-ins, and service activity anomalies
 */
const runDoctorPresenceSweep = async () => {
  try {
    const result = await doctorPresenceService.evaluatePresenceSignals();
    return result;
  } catch (err) {
    console.error("[DoctorPresenceJob] Error running presence evaluation sweep:", err.message);
    return { evaluated_sessions_count: 0, new_signals_generated: 0, error: err.message };
  }
};

module.exports = {
  runDoctorPresenceSweep,
};
