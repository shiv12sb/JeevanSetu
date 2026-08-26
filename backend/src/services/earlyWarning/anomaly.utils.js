/**
 * ==============================================================================
 * JEEVANSETU PHASE 27 — DETERMINISTIC EARLY-WARNING ANOMALY UTILITIES
 * ==============================================================================
 * Pure deterministic statistics for public health operational surveillance.
 * Strict principle: SIGNAL DETECTION != OUTBREAK CONFIRMATION.
 * Invariants:
 * 1. "JeevanSetu provides early-warning signals for human public-health investigation. It does not autonomously diagnose disease or declare outbreaks."
 * 2. "Absence of a signal does not prove absence of disease."
 * 3. "If insufficient historical data: return INSUFFICIENT_DATA. Do not fabricate confidence."
 */

const MIN_BASELINE_DAYS = 14;
const MIN_OBSERVATION_COUNT = 3;
const RECENT_WINDOW_DAYS = 7;
const MAX_STALENESS_HOURS = 48;

/**
 * Calculate statistical standard deviation
 */
const calculateStdDev = (values, mean) => {
  if (values.length <= 1) return 0;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
};

/**
 * Calculate moving baseline, Z-score deviation, severity, and confidence for a time series
 * @param {Object} params
 * @param {Array<{date: string, count: number}>} params.observations - Chronological daily observation series
 * @param {number} [params.recentDays] - Length of recent evaluation window (default 7)
 * @param {number} [params.baselineDays] - Length of total baseline window (14, 28)
 * @param {string|Date} [params.lastSyncedAt] - Timestamp of latest sync
 * @returns {Object} Structured anomaly analysis
 */
const detectSignalAnomaly = ({
  observations = [],
  recentDays = RECENT_WINDOW_DAYS,
  baselineDays = 28,
  lastSyncedAt = null,
}) => {
  // Check Staleness
  let isStale = false;
  if (lastSyncedAt) {
    const syncTime = new Date(lastSyncedAt).getTime();
    if (!isNaN(syncTime)) {
      const elapsedHours = (Date.now() - syncTime) / 3600000;
      if (elapsedHours > MAX_STALENESS_HOURS) {
        isStale = true;
      }
    }
  }

  // Small sample protection & Insufficient data handling
  if (!Array.isArray(observations) || observations.length < MIN_BASELINE_DAYS) {
    return {
      status: "insufficient_data",
      severity: "INFO",
      signal_level: "INSUFFICIENT_DATA",
      confidence: "LOW",
      data_quality: isStale ? "DATA_STALE" : "INSUFFICIENT_DATA",
      observed_value: 0,
      baseline_value: 0,
      deviation_percentage: 0,
      z_score: 0,
      is_stale: isStale,
      observation_count: observations ? observations.length : 0,
      notes: "Insufficient historical observations for reliable baseline calculation (< 14 days).",
    };
  }

  const totalCount = observations.length;
  const baselineSeries = observations.slice(0, totalCount - recentDays).map((o) => Math.max(0, o.count || 0));
  const recentSeries = observations.slice(totalCount - recentDays).map((o) => Math.max(0, o.count || 0));

  if (baselineSeries.length < 7 || recentSeries.length === 0) {
    return {
      status: "insufficient_data",
      severity: "INFO",
      signal_level: "INSUFFICIENT_DATA",
      confidence: "LOW",
      data_quality: isStale ? "DATA_STALE" : "INSUFFICIENT_DATA",
      observed_value: 0,
      baseline_value: 0,
      deviation_percentage: 0,
      z_score: 0,
      is_stale: isStale,
      observation_count: totalCount,
      notes: "Observation window partitioned insufficiently.",
    };
  }

  // 1. Baseline Mean & Standard Deviation
  const baselineSum = baselineSeries.reduce((sum, v) => sum + v, 0);
  const baselineMean = baselineSum / baselineSeries.length;
  const sampleStdDev = calculateStdDev(baselineSeries, baselineMean);

  // Epidemiological variance stabilization for count series (Poisson dispersion bound)
  const effectiveStdDev = Math.max(1.0, sampleStdDev, Math.sqrt(Math.max(1.0, baselineMean)));

  // 2. Recent Mean
  const recentSum = recentSeries.reduce((sum, v) => sum + v, 0);
  const recentMean = recentSum / recentSeries.length;

  // 3. Small-sample protection (e.g. Village with 1-2 cases total)
  if (baselineSum < MIN_OBSERVATION_COUNT && recentSum < MIN_OBSERVATION_COUNT) {
    return {
      status: "insufficient_data",
      severity: "INFO",
      signal_level: "NORMAL",
      confidence: "LOW",
      data_quality: isStale ? "DATA_STALE" : "LOW",
      observed_value: Number(recentMean.toFixed(2)),
      baseline_value: Number(baselineMean.toFixed(2)),
      deviation_percentage: 0,
      z_score: 0,
      is_stale: isStale,
      observation_count: totalCount,
      notes: "Small sample threshold: Aggregate patient volume below minimum observation threshold for public health surveillance.",
    };
  }

  // 4. Single-Day Spike Smoothing vs Sustained Multi-Day Trend
  const spikeThreshold = baselineMean + 1.5 * effectiveStdDev;
  const daysAboveSpike = recentSeries.filter((v) => v > spikeThreshold).length;
  const isSingleDaySpike = daysAboveSpike === 1 && recentSeries.length >= 5;

  // 5. Statistical Metrics
  const denom = Math.max(1.0, baselineMean);
  let deviationPercentage = Number((((recentMean - baselineMean) / denom) * 100).toFixed(2));
  let zScore = Number(((recentMean - baselineMean) / effectiveStdDev).toFixed(2));

  let anomalyType = "sustained_trend";
  if (isSingleDaySpike) {
    anomalyType = "isolated_single_day_spike";
    deviationPercentage = Number((deviationPercentage * 0.6).toFixed(2));
    zScore = Number((zScore * 0.6).toFixed(2));
  }

  // 6. Severity Level (Separated from Confidence)
  let severity = "INFO";
  let signalLevel = "NORMAL";

  if (isSingleDaySpike) {
    if (deviationPercentage >= 50 || zScore >= 1.75) {
      severity = "LOW";
      signalLevel = "LOW";
    } else {
      severity = "INFO";
      signalLevel = "NORMAL";
    }
  } else {
    if (zScore >= 2.5 || deviationPercentage >= 100) {
      severity = "HIGH";
      signalLevel = "HIGH";
    } else if (zScore >= 1.75 || deviationPercentage >= 50) {
      severity = "MEDIUM";
      signalLevel = "MEDIUM";
    } else if (zScore >= 1.2 || deviationPercentage >= 25) {
      severity = "LOW";
      signalLevel = "LOW";
    } else {
      severity = "INFO";
      signalLevel = "NORMAL";
    }
  }

  // 7. Confidence Metric (Based on sample volume and observation duration)
  let confidence = "LOW";
  if (isStale) {
    confidence = "LOW";
  } else if (totalCount >= 21 && baselineSum >= 15 && !isSingleDaySpike) {
    confidence = "HIGH";
  } else if (totalCount >= 14 && baselineSum >= 6) {
    confidence = "MEDIUM";
  } else {
    confidence = "LOW";
  }

  const dataQuality = isStale ? "DATA_STALE" : confidence;

  return {
    status: "calculated",
    severity,
    signal_level: signalLevel,
    confidence,
    data_quality: dataQuality,
    observed_value: Number(recentMean.toFixed(2)),
    baseline_value: Number(baselineMean.toFixed(2)),
    deviation_percentage: deviationPercentage,
    z_score: zScore,
    anomaly_type: anomalyType,
    is_stale: isStale,
    observation_count: totalCount,
    recent_days_evaluated: recentDays,
    notes: isStale
      ? "Current data may be incomplete due to delayed synchronization (> 48 hours)."
      : isSingleDaySpike
      ? "Single-day activity spike observed; smoothed across 7-day evaluation window."
      : "Baseline moving average evaluated across surveillance window.",
  };
};

/**
 * Correlate multi-source signals (Cases, Medicine, Feedback, Community, Weather, Pharmacy)
 */
const correlateMultiSignals = ({
  caseSignal,
  medicineSignal,
  feedbackSignal = null,
  communitySignal = null,
  weatherSignal = null,
  pharmacySignal = null,
  locationName = "Ashti PHC",
  isStale = false,
}) => {
  const contributingSources = [];
  const evidenceList = [];
  let weightedDeviationSum = 0;
  let totalWeights = 0;

  // Case volume weight: 0.40
  if (caseSignal && caseSignal.status === "calculated") {
    const isElevated = ["HIGH", "MEDIUM", "LOW", "WARNING", "WATCH", "ELEVATED"].includes(caseSignal.severity || caseSignal.signal_level);
    if (isElevated && (caseSignal.deviation_percentage > 15 || caseSignal.z_score >= 1.0)) {
      contributingSources.push("CASE_TREND");
      evidenceList.push({
        source: "CASE_TREND",
        metric: "Clinical Case Volume",
        baseline: caseSignal.baseline_value,
        current: caseSignal.observed_value,
        deviation_percentage: caseSignal.deviation_percentage,
        notes: `Clinical cases: recent 7d avg ${caseSignal.observed_value} vs baseline ${caseSignal.baseline_value} (+${caseSignal.deviation_percentage}%).`,
      });
    }
    const dev = Math.max(0, caseSignal.deviation_percentage || 0);
    weightedDeviationSum += dev * 0.40;
    totalWeights += 0.40;
  }

  // Medicine consumption weight: 0.25
  if (medicineSignal && medicineSignal.status === "calculated") {
    const isElevated = ["HIGH", "MEDIUM", "LOW", "WARNING", "WATCH", "ELEVATED"].includes(medicineSignal.severity || medicineSignal.signal_level);
    if (isElevated && (medicineSignal.deviation_percentage > 15 || medicineSignal.z_score >= 1.0)) {
      contributingSources.push("MEDICINE_USAGE");
      evidenceList.push({
        source: "MEDICINE_USAGE",
        metric: "Medicine Dispensation Volume",
        baseline: medicineSignal.baseline_value,
        current: medicineSignal.observed_value,
        deviation_percentage: medicineSignal.deviation_percentage,
        notes: `Medicine usage: recent 7d avg ${medicineSignal.observed_value} units vs baseline ${medicineSignal.baseline_value} (+${medicineSignal.deviation_percentage}%).`,
      });
    }
    const dev = Math.max(0, medicineSignal.deviation_percentage || 0);
    weightedDeviationSum += dev * 0.25;
    totalWeights += 0.25;
  }

  // Community / ASHA reports weight: 0.15
  if (communitySignal && communitySignal.status === "calculated") {
    const isElevated = ["HIGH", "MEDIUM", "LOW", "WARNING", "WATCH", "ELEVATED"].includes(communitySignal.severity || communitySignal.signal_level);
    if (isElevated && (communitySignal.deviation_percentage > 20 || communitySignal.observed_value > 2)) {
      contributingSources.push("ASHA_REPORT");
      evidenceList.push({
        source: "ASHA_REPORT",
        metric: "Community Field Observations",
        baseline: communitySignal.baseline_value,
        current: communitySignal.observed_value,
        deviation_percentage: communitySignal.deviation_percentage,
        notes: `ASHA community reports: elevated cluster observations (${communitySignal.observed_value} reports/day).`,
      });
    }
    const dev = Math.max(0, communitySignal.deviation_percentage || 0);
    weightedDeviationSum += dev * 0.15;
    totalWeights += 0.15;
  }

  // Citizen Feedback weight: 0.10
  if (feedbackSignal && feedbackSignal.status === "calculated") {
    const isElevated = ["HIGH", "MEDIUM", "LOW", "WARNING", "WATCH", "ELEVATED"].includes(feedbackSignal.severity || feedbackSignal.signal_level);
    if (isElevated && (feedbackSignal.deviation_percentage > 20 || feedbackSignal.observed_value > 2)) {
      contributingSources.push("COMMUNITY_FEEDBACK");
      evidenceList.push({
        source: "COMMUNITY_FEEDBACK",
        metric: "Citizen Service Feedback",
        baseline: feedbackSignal.baseline_value,
        current: feedbackSignal.observed_value,
        deviation_percentage: feedbackSignal.deviation_percentage,
        notes: `Citizen feedback: increased volume of service complaints/inquiries (+${feedbackSignal.deviation_percentage}%).`,
      });
    }
    const dev = Math.max(0, feedbackSignal.deviation_percentage || 0);
    weightedDeviationSum += dev * 0.10;
    totalWeights += 0.10;
  }

  // Weather / Environmental weight: 0.05
  if (weatherSignal && weatherSignal.status === "calculated" && weatherSignal.is_available) {
    const isElevated = ["HIGH", "MEDIUM", "LOW", "WARNING", "WATCH", "ELEVATED"].includes(weatherSignal.severity || weatherSignal.signal_level);
    if (isElevated && weatherSignal.deviation_percentage > 25) {
      contributingSources.push("WEATHER");
      evidenceList.push({
        source: "WEATHER",
        metric: "Meteorological / Rainfall Index",
        baseline: weatherSignal.baseline_value,
        current: weatherSignal.observed_value,
        deviation_percentage: weatherSignal.deviation_percentage,
        notes: `Weather signal: elevated heat or precipitation indicator (+${weatherSignal.deviation_percentage}%).`,
      });
    }
    const dev = Math.max(0, weatherSignal.deviation_percentage || 0);
    weightedDeviationSum += dev * 0.05;
    totalWeights += 0.05;
  }

  // Pharmacy weight: 0.05
  if (pharmacySignal && pharmacySignal.status === "calculated" && pharmacySignal.is_available) {
    const isElevated = ["HIGH", "MEDIUM", "LOW", "WARNING", "WATCH", "ELEVATED"].includes(pharmacySignal.severity || pharmacySignal.signal_level);
    if (isElevated && pharmacySignal.deviation_percentage > 25) {
      contributingSources.push("PHARMACY");
      evidenceList.push({
        source: "PHARMACY",
        metric: "Retail Pharmacy OTC Consumption",
        baseline: pharmacySignal.baseline_value,
        current: pharmacySignal.observed_value,
        deviation_percentage: pharmacySignal.deviation_percentage,
        notes: `Pharmacy signal: elevated OTC antipyretic sales (+${pharmacySignal.deviation_percentage}%).`,
      });
    }
    const dev = Math.max(0, pharmacySignal.deviation_percentage || 0);
    weightedDeviationSum += dev * 0.05;
    totalWeights += 0.05;
  }

  // Composite Score
  const normalizedDeviation = totalWeights > 0 ? weightedDeviationSum / totalWeights : 0;
  const compositeScore = Number(Math.min(100.0, Math.max(0.0, normalizedDeviation * 0.5)).toFixed(2));

  // Determine Severity: INFO, LOW, MEDIUM, HIGH
  let compositeSeverity = "INFO";
  let compositeSignalLevel = "NORMAL";

  if (
    (contributingSources.length >= 3 && compositeScore >= 35) ||
    (contributingSources.length >= 2 && compositeScore >= 45) ||
    (caseSignal?.severity === "HIGH" && medicineSignal?.severity === "HIGH") ||
    (caseSignal?.severity === "HIGH" && contributingSources.length >= 2)
  ) {
    compositeSeverity = "HIGH";
    compositeSignalLevel = "HIGH";
  } else if (
    (contributingSources.length >= 2 && compositeScore >= 20) ||
    caseSignal?.severity === "HIGH" ||
    medicineSignal?.severity === "HIGH" ||
    caseSignal?.severity === "MEDIUM"
  ) {
    compositeSeverity = "MEDIUM";
    compositeSignalLevel = "MEDIUM";
  } else if (contributingSources.length >= 1 && compositeScore >= 10) {
    compositeSeverity = "LOW";
    compositeSignalLevel = "LOW";
  }

  // Composite Confidence
  let compositeConfidence = "LOW";
  if (isStale) {
    compositeConfidence = "LOW";
  } else if (contributingSources.length >= 3 || (contributingSources.length >= 2 && (caseSignal?.confidence === "HIGH" || compositeScore >= 40))) {
    compositeConfidence = "HIGH";
  } else if (contributingSources.length >= 1 || caseSignal?.confidence === "MEDIUM") {
    compositeConfidence = "MEDIUM";
  }

  const dataQuality = isStale ? "DATA_STALE" : compositeConfidence;

  // Grounded Non-Alarmist Description
  let description = "Health and service activity within expected statistical baseline.";
  if (contributingSources.length >= 2) {
    const sourcesStr = contributingSources.map((s) => s.replace(/_/g, " ").toLowerCase()).join(", ");
    description = `Multiple health-related operational signals (${sourcesStr}) increased concurrently during the same period in ${locationName}. Potential anomaly detected. Human public-health review required.`;
  } else if (caseSignal && ["HIGH", "MEDIUM", "LOW", "WARNING", "WATCH", "ELEVATED"].includes(caseSignal.severity || caseSignal.signal_level)) {
    description = `Elevated clinical case volume (+${caseSignal.deviation_percentage}%) detected in ${locationName} relative to baseline. Potential anomaly detected. Human public-health review required.`;
  } else if (medicineSignal && ["HIGH", "MEDIUM", "LOW", "WARNING", "WATCH", "ELEVATED"].includes(medicineSignal.severity || medicineSignal.signal_level)) {
    description = `Elevated medicine consumption (+${medicineSignal.deviation_percentage}%) detected in ${locationName} relative to baseline. Potential anomaly detected. Human public-health review required.`;
  }

  return {
    composite_severity: compositeSeverity,
    composite_signal_level: compositeSignalLevel,
    composite_confidence: compositeConfidence,
    data_quality: dataQuality,
    signal_score: compositeScore,
    contributing_sources: contributingSources,
    evidence: evidenceList,
    description,
    is_stale: isStale,
    requires_human_review: ["HIGH", "MEDIUM"].includes(compositeSeverity),
  };
};

module.exports = {
  detectSignalAnomaly,
  correlateMultiSignals,
  MIN_BASELINE_DAYS,
  MIN_OBSERVATION_COUNT,
  RECENT_WINDOW_DAYS,
  MAX_STALENESS_HOURS,
};
