const medicineForecastService = require("../services/forecasting/medicineForecast.service");

/**
 * Scheduled background worker: Recalculate medicine depletion forecasts & evaluate depletion risks
 */
const runForecastingSweep = async () => {
  try {
    const result = await medicineForecastService.runPeriodicForecastingSweep();
    return result;
  } catch (err) {
    console.error("[BackgroundJobs] Forecasting sweep worker error:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  runForecastingSweep,
};
