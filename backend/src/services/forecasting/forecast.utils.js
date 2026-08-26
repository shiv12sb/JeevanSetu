/**
 * Pure Deterministic Mathematical & Statistical Algorithms for Medicine Depletion Forecasting,
 * Stockout Prediction & Replenishment Intelligence
 */

const MIN_REQUIRED_OBSERVATIONS = 3;
const RECENT_WINDOW_DAYS = 7;
const MID_WINDOW_DAYS = 14;
const TOTAL_WINDOW_DAYS = 30;
const LONG_WINDOW_DAYS = 90;
const RECENT_WEIGHT = 0.65;
const PRIOR_WEIGHT = 0.35;
const DEFAULT_TARGET_COVERAGE_DAYS = 30; // 30 days buffer stock target
const DEFAULT_LEAD_TIME_DAYS = 5;
const DEFAULT_SAFETY_STOCK = 50;

/**
 * Model versions for forecast tracking
 */
const MODEL_VERSIONS = {
  DETERMINISTIC: "deterministic-v1",
  MOVING_AVERAGE: "moving-average-v1",
  AI_ASSISTED: "ai-assisted-v1",
};

/**
 * Calculate statistical standard deviation of an array of numbers
 */
const calculateStdDev = (values, mean) => {
  if (!values || values.length <= 1) return 0;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
};

/**
 * Format a Date object to YYYY-MM-DD
 */
const formatDateOnly = (d) => {
  return d.toISOString().split("T")[0];
};

/**
 * Calculate rolling averages for 7, 14, 30, and 90 day windows
 */
const calculateRollingAverages = (dailyUsageMap, calcDate) => {
  const date7Ago = new Date(calcDate.getTime() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const date14Ago = new Date(calcDate.getTime() - MID_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const date30Ago = new Date(calcDate.getTime() - TOTAL_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const date90Ago = new Date(calcDate.getTime() - LONG_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  let sum7 = 0;
  let count7 = 0;
  let sum14 = 0;
  let count14 = 0;
  let sum30 = 0;
  let count30 = 0;
  let sum90 = 0;
  let count90 = 0;

  for (const [dateStr, qty] of dailyUsageMap.entries()) {
    const d = new Date(dateStr);
    if (d >= date7Ago && d <= calcDate) {
      sum7 += qty;
      count7 += 1;
    }
    if (d >= date14Ago && d <= calcDate) {
      sum14 += qty;
      count14 += 1;
    }
    if (d >= date30Ago && d <= calcDate) {
      sum30 += qty;
      count30 += 1;
    }
    if (d >= date90Ago && d <= calcDate) {
      sum90 += qty;
      count90 += 1;
    }
  }

  // 90-day data sufficiency: requires at least 30 observations across the 90-day window
  const is90dDataSufficient = count90 >= 30;

  return {
    avg7d: Number((sum7 / RECENT_WINDOW_DAYS).toFixed(2)),
    avg14d: Number((sum14 / MID_WINDOW_DAYS).toFixed(2)),
    avg30d: Number((sum30 / TOTAL_WINDOW_DAYS).toFixed(2)),
    avg90d: is90dDataSufficient ? Number((sum90 / LONG_WINDOW_DAYS).toFixed(2)) : null,
    is90dSufficient: is90dDataSufficient,
    activeDays7: count7,
    activeDays14: count14,
    activeDays30: count30,
    activeDays90: count90,
  };
};

/**
 * Calculate Forecast Accuracy Metrics (MAE, MAPE, Forecast Bias)
 * Evaluates performance between projected daily usage and verified actual daily consumption
 */
const calculateForecastAccuracy = (evaluationPairs = []) => {
  if (!evaluationPairs || evaluationPairs.length === 0) {
    return {
      mae: null,
      mape: null,
      bias: null,
      evaluated_count: 0,
      accuracy_status: "INSUFFICIENT_EVALUATION_DATA",
    };
  }

  let totalAbsoluteError = 0;
  let totalPercentageError = 0;
  let validMapeCount = 0;
  let totalSignedError = 0;

  for (const pair of evaluationPairs) {
    const pred = Number(pair.predicted || pair.predicted_daily_usage || 0);
    const act = Number(pair.actual || pair.quantity_consumed || 0);

    const error = pred - act;
    totalAbsoluteError += Math.abs(error);
    totalSignedError += error;

    if (act > 0) {
      totalPercentageError += (Math.abs(error) / act) * 100;
      validMapeCount++;
    }
  }

  const n = evaluationPairs.length;
  const mae = Number((totalAbsoluteError / n).toFixed(2));
  const mape = validMapeCount > 0 ? Number((totalPercentageError / validMapeCount).toFixed(2)) : null;
  const bias = Number((totalSignedError / n).toFixed(2));

  return {
    mae,
    mape,
    bias,
    evaluated_count: n,
    accuracy_status: mae <= 5 ? "HIGH_ACCURACY" : mae <= 15 ? "MODERATE_ACCURACY" : "LOW_ACCURACY",
  };
};

/**
 * Calculate depletion forecast, stockout prediction and suggested replenishment quantity
 * @param {Object} params
 * @param {number} params.currentQuantity - Current stock count
 * @param {number} params.minimumThreshold - Minimum safety threshold
 * @param {Array<{quantity_consumed: number, recorded_date: string}>} params.usageRecords - Usage observations
 * @param {Date|string} [params.calculationDate] - Baseline calculation date
 * @param {number} [params.targetCoverageDays] - Buffer stock target coverage in days (default 30)
 * @param {number} [params.replenishmentLeadTimeDays] - Configurable lead time in days (default 5)
 * @param {number} [params.safetyStockQuantity] - Configurable safety stock quantity (default 50)
 * @returns {Object} Structured forecast and prediction result
 */
const calculateMedicineForecast = ({
  currentQuantity = 0,
  minimumThreshold = 100,
  usageRecords = [],
  calculationDate = new Date(),
  targetCoverageDays = DEFAULT_TARGET_COVERAGE_DAYS,
  replenishmentLeadTimeDays = DEFAULT_LEAD_TIME_DAYS,
  safetyStockQuantity = DEFAULT_SAFETY_STOCK,
}) => {
  const currentStock = Math.max(0, parseInt(currentQuantity, 10) || 0);
  const minThreshold = Math.max(0, parseInt(minimumThreshold, 10) || 100);
  const leadTimeDays = Math.max(0, parseInt(replenishmentLeadTimeDays, 10) || DEFAULT_LEAD_TIME_DAYS);
  const safetyStock = Math.max(0, parseInt(safetyStockQuantity, 10) || DEFAULT_SAFETY_STOCK);
  const calcDate = typeof calculationDate === "string" ? new Date(calculationDate) : calculationDate;

  // 1. Current stock is ZERO -> Immediate OUT_OF_STOCK / CRITICAL
  if (currentStock === 0) {
    const suggestedQty = Math.max(minThreshold, 200);
    return {
      status: "out_of_stock",
      current_quantity: 0,
      minimum_threshold: minThreshold,
      safety_stock_quantity: safetyStock,
      replenishment_lead_time_days: leadTimeDays,
      estimated_daily_consumption: 0,
      estimated_days_remaining: 0,
      days_of_stock: 0,
      projected_depletion_date: formatDateOnly(calcDate),
      estimated_stockout_date: formatDateOnly(calcDate),
      estimated_threshold_date: formatDateOnly(calcDate),
      recommended_reorder_date: formatDateOnly(calcDate),
      reorder_recommended: true,
      consumption_trend: "stable",
      risk_level: "OUT_OF_STOCK",
      data_quality: usageRecords.length >= MIN_REQUIRED_OBSERVATIONS ? "HIGH" : "INSUFFICIENT_DATA",
      data_sufficiency: usageRecords.length >= 14 ? "SUFFICIENT_DATA" : usageRecords.length >= 3 ? "LIMITED_DATA" : "INSUFFICIENT_DATA",
      observation_count: usageRecords.length,
      suggested_replenishment_quantity: suggestedQty,
      is_anomaly: false,
      anomaly_description: null,
      algorithm_version: "stockout-v1",
    };
  }

  // 2. Filter and normalize usage records within observation window (Past 30 days)
  const windowStart = new Date(calcDate.getTime() - TOTAL_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const recentSplitDate = new Date(calcDate.getTime() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  // Group consumption by distinct date
  const dailyUsageMap = new Map();

  for (const record of usageRecords) {
    if (!record.recorded_date || record.quantity_consumed === undefined) continue;
    const qty = parseInt(record.quantity_consumed, 10);
    if (isNaN(qty) || qty < 0) continue;

    const recDate = new Date(record.recorded_date);
    if (isNaN(recDate.getTime()) || recDate > calcDate || recDate < windowStart) continue;

    const dateKey = formatDateOnly(recDate);
    const existing = dailyUsageMap.get(dateKey) || 0;
    dailyUsageMap.set(dateKey, existing + qty);
  }

  const distinctObservationDays = dailyUsageMap.size;
  const rollingAvgs = calculateRollingAverages(dailyUsageMap, calcDate);

  // 3. Data Sufficiency Classification
  let dataSufficiency = "INSUFFICIENT_DATA";
  if (distinctObservationDays >= 14) {
    dataSufficiency = "SUFFICIENT_DATA";
  } else if (distinctObservationDays >= MIN_REQUIRED_OBSERVATIONS) {
    dataSufficiency = "LIMITED_DATA";
  } else {
    dataSufficiency = "INSUFFICIENT_DATA";
  }

  // If distinct observation days < MIN_REQUIRED_OBSERVATIONS -> Insufficient Data handling
  if (distinctObservationDays < MIN_REQUIRED_OBSERVATIONS) {
    const suggestedQty = Math.max(0, minThreshold * 2 - currentStock);
    return {
      status: "insufficient_data",
      current_quantity: currentStock,
      minimum_threshold: minThreshold,
      safety_stock_quantity: safetyStock,
      replenishment_lead_time_days: leadTimeDays,
      estimated_daily_consumption: 0,
      estimated_days_remaining: currentStock === 0 ? 0 : null,
      days_of_stock: currentStock === 0 ? 0 : null,
      projected_depletion_date: null,
      estimated_stockout_date: null,
      estimated_threshold_date: null,
      recommended_reorder_date: null,
      reorder_recommended: currentStock <= minThreshold,
      consumption_trend: "insufficient_data",
      risk_level: currentStock === 0 ? "OUT_OF_STOCK" : "INSUFFICIENT_DATA",
      data_quality: "INSUFFICIENT_DATA",
      data_sufficiency: "INSUFFICIENT_DATA",
      observation_count: distinctObservationDays,
      message: "Not enough historical usage data for a reliable prediction.",
      suggested_replenishment_quantity: suggestedQty,
      is_anomaly: false,
      anomaly_description: null,
      rolling_avg_7d: rollingAvgs.avg7d,
      rolling_avg_14d: rollingAvgs.avg14d,
      rolling_avg_30d: rollingAvgs.avg30d,
      algorithm_version: "stockout-v1",
    };
  }

  // 4. Partition into Recent (0-7 days) vs Prior (8-30 days)
  const recentDailyValues = [];
  const priorDailyValues = [];
  const allDailyValues = [];

  for (const [dateStr, dailyTotal] of dailyUsageMap.entries()) {
    const d = new Date(dateStr);
    allDailyValues.push(dailyTotal);
    if (d >= recentSplitDate) {
      recentDailyValues.push(dailyTotal);
    } else {
      priorDailyValues.push(dailyTotal);
    }
  }

  const recentAvg =
    recentDailyValues.length > 0
      ? recentDailyValues.reduce((sum, v) => sum + v, 0) / recentDailyValues.length
      : 0;

  const priorAvg =
    priorDailyValues.length > 0
      ? priorDailyValues.reduce((sum, v) => sum + v, 0) / priorDailyValues.length
      : 0;

  // 5. Baseline Weighted Daily Consumption
  let estimatedDailyConsumption = 0;
  if (priorDailyValues.length > 0 && recentDailyValues.length > 0) {
    estimatedDailyConsumption = RECENT_WEIGHT * recentAvg + PRIOR_WEIGHT * priorAvg;
  } else if (recentDailyValues.length > 0) {
    estimatedDailyConsumption = recentAvg;
  } else {
    estimatedDailyConsumption = priorAvg;
  }

  estimatedDailyConsumption = Number(estimatedDailyConsumption.toFixed(2));

  // 6. Zero Consumption Check
  if (estimatedDailyConsumption === 0) {
    return {
      status: "no_recent_consumption",
      current_quantity: currentStock,
      minimum_threshold: minThreshold,
      safety_stock_quantity: safetyStock,
      replenishment_lead_time_days: leadTimeDays,
      estimated_daily_consumption: 0,
      estimated_days_remaining: null,
      days_of_stock: null,
      projected_depletion_date: null,
      estimated_stockout_date: null,
      estimated_threshold_date: null,
      recommended_reorder_date: null,
      reorder_recommended: currentStock <= minThreshold,
      consumption_trend: "stable",
      risk_level: currentStock <= minThreshold ? "MEDIUM" : "LOW",
      data_quality: "LOW",
      data_sufficiency: dataSufficiency,
      observation_count: distinctObservationDays,
      message: "No recent consumption detected.",
      suggested_replenishment_quantity: 0,
      is_anomaly: false,
      anomaly_description: null,
      rolling_avg_7d: rollingAvgs.avg7d,
      rolling_avg_14d: rollingAvgs.avg14d,
      rolling_avg_30d: rollingAvgs.avg30d,
      algorithm_version: "stockout-v1",
    };
  }

  // 7. Trend & Volatility Analysis
  let trend = "stable";
  const overallMean = allDailyValues.reduce((sum, v) => sum + v, 0) / allDailyValues.length;
  const stdDev = calculateStdDev(allDailyValues, overallMean);
  const coefficientOfVariation = overallMean > 0 ? stdDev / overallMean : 0;

  if (coefficientOfVariation > 0.8) {
    trend = "highly_variable";
  } else if (priorAvg > 0 && recentAvg > 0) {
    const ratio = recentAvg / priorAvg;
    if (ratio >= 1.25) {
      trend = "increasing";
    } else if (ratio <= 0.75) {
      trend = "decreasing";
    }
  }

  // 8. Anomaly Spike Detection (Consumption Surge)
  let isAnomaly = false;
  let anomalyDescription = null;
  if (priorAvg > 0 && recentAvg >= priorAvg * 2.0 && recentDailyValues.length >= 3) {
    isAnomaly = true;
    anomalyDescription = "Consumption rate is significantly higher than recent 30-day baseline.";
  }

  // 9. Days of Stock & Projected Stockout Date (Estimated)
  const rawDaysRemaining = currentStock / estimatedDailyConsumption;
  const estimatedDaysRemaining = Number(rawDaysRemaining.toFixed(1));

  const daysToStockout = Math.max(1, Math.ceil(rawDaysRemaining));
  const stockoutDateObj = new Date(calcDate.getTime() + daysToStockout * 24 * 60 * 60 * 1000);
  const estimatedStockoutDate = formatDateOnly(stockoutDateObj);

  // 10. Estimated Threshold Date (Date when stock reaches minimum_threshold)
  let estimatedThresholdDate = null;
  if (currentStock <= minThreshold) {
    estimatedThresholdDate = formatDateOnly(calcDate);
  } else {
    const unitsToThreshold = currentStock - minThreshold;
    const daysToThreshold = Math.max(1, Math.ceil(unitsToThreshold / estimatedDailyConsumption));
    const thresholdDateObj = new Date(calcDate.getTime() + daysToThreshold * 24 * 60 * 60 * 1000);
    estimatedThresholdDate = formatDateOnly(thresholdDateObj);
  }

  // 11. Reorder Recommendation & Recommended Reorder Date
  // Reorder is recommended if current stock <= (minThreshold + daily_consumption * leadTimeDays)
  const reorderPoint = minThreshold + Math.ceil(estimatedDailyConsumption * leadTimeDays);
  const reorderRecommended = currentStock <= reorderPoint;

  let recommendedReorderDate = null;
  if (estimatedThresholdDate) {
    const threshObj = new Date(estimatedThresholdDate);
    const reorderObj = new Date(threshObj.getTime() - leadTimeDays * 24 * 60 * 60 * 1000);
    recommendedReorderDate = formatDateOnly(reorderObj > calcDate ? reorderObj : calcDate);
  }

  // 12. Deterministic Risk Classification Matrix
  let riskLevel = "LOW";
  if (currentStock === 0) {
    riskLevel = "OUT_OF_STOCK";
  } else if (
    estimatedDaysRemaining <= 3 ||
    (currentStock <= minThreshold && (trend === "increasing" || trend === "stable"))
  ) {
    riskLevel = "CRITICAL";
  } else if (estimatedDaysRemaining <= 7 || reorderRecommended) {
    riskLevel = "HIGH";
  } else if (estimatedDaysRemaining <= 14) {
    riskLevel = "MEDIUM";
  } else {
    riskLevel = "LOW";
  }

  // 13. Data Confidence Metric
  let dataQuality = "LOW";
  if (distinctObservationDays >= 14 && trend !== "highly_variable") {
    dataQuality = "HIGH";
  } else if (distinctObservationDays >= 7 && trend !== "highly_variable") {
    dataQuality = "MEDIUM";
  } else {
    dataQuality = "LOW";
  }

  // 14. Transparent Suggested Replenishment Quantity Formula
  const targetStock = targetCoverageDays * estimatedDailyConsumption + minThreshold + safetyStock;
  const rawSuggestedQty = Math.max(0, Math.ceil(targetStock - currentStock));

  return {
    status: "calculated",
    current_quantity: currentStock,
    minimum_threshold: minThreshold,
    safety_stock_quantity: safetyStock,
    replenishment_lead_time_days: leadTimeDays,
    estimated_daily_consumption: estimatedDailyConsumption,
    estimated_days_remaining: estimatedDaysRemaining,
    days_of_stock: estimatedDaysRemaining,
    projected_depletion_date: estimatedStockoutDate, // Backwards compatible alias
    estimated_stockout_date: estimatedStockoutDate,
    estimated_threshold_date: estimatedThresholdDate,
    recommended_reorder_date: recommendedReorderDate,
    reorder_recommended: reorderRecommended,
    consumption_trend: trend,
    risk_level: riskLevel,
    data_quality: dataQuality,
    data_sufficiency: dataSufficiency,
    observation_count: distinctObservationDays,
    suggested_replenishment_quantity: rawSuggestedQty,
    is_anomaly: isAnomaly,
    anomaly_description: anomalyDescription,
    rolling_avg_7d: rollingAvgs.avg7d,
    rolling_avg_14d: rollingAvgs.avg14d,
    rolling_avg_30d: rollingAvgs.avg30d,
    rolling_avg_90d: rollingAvgs.avg90d,
    is_90d_sufficient: rollingAvgs.is90dSufficient,
    algorithm_version: "stockout-v1",
  };
};

module.exports = {
  calculateMedicineForecast,
  calculateRollingAverages,
  calculateForecastAccuracy,
  MODEL_VERSIONS,
  MIN_REQUIRED_OBSERVATIONS,
  TOTAL_WINDOW_DAYS,
  RECENT_WINDOW_DAYS,
  MID_WINDOW_DAYS,
  LONG_WINDOW_DAYS,
  DEFAULT_LEAD_TIME_DAYS,
  DEFAULT_SAFETY_STOCK,
};
