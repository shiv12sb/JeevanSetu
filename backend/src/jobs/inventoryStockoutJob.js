const inventoryPredictionService = require("../services/forecasting/inventoryPrediction.service");

/**
 * Scheduled background worker: Recalculate medicine stockout predictions & generate deduplicated alerts
 */
const runInventoryStockoutSweep = async () => {
  try {
    const result = await inventoryPredictionService.runScheduledStockoutSweep();
    return result;
  } catch (err) {
    console.error("[BackgroundJobs] Inventory stockout sweep error:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  runInventoryStockoutSweep,
};
