const { supabase, isConfigured } = require("../../config/supabase");
const { detectSignalAnomaly, correlateMultiSignals, MIN_BASELINE_DAYS, MIN_OBSERVATION_COUNT } = require("./anomaly.utils");
const HealthCasesSignalProvider = require("./providers/healthCasesSignal.provider");
const MedicineUsageSignalProvider = require("./providers/medicineUsageSignal.provider");
const FeedbackSignalProvider = require("./providers/feedbackSignal.provider");
const WeatherEnvironmentSignalProvider = require("./providers/weatherSignal.provider");
const CommunitySignalProvider = require("./providers/communitySignal.provider");
const PharmacySignalProvider = require("./providers/pharmacySignal.provider");
const notificationService = require("../notification.service");
const auditService = require("../audit.service");

// In-Memory mock store for development and testing
const mockEarlyWarningsStore = new Map([
  [
    "ew-001",
    {
      id: "ew-001",
      geographic_scope: "phc",
      location_id: "phc-1",
      location_name: "Ashti Primary Health Centre",
      phc_id: "phc-1",
      phc_name: "Ashti Primary Health Centre",
      district: "Gadchiroli",
      taluka: "Chamorshi",
      village: "Ashti",
      signal_type: "MULTI_SOURCE_SIGNAL",
      category: "FEVER_RESPIRATORY",
      severity: "HIGH",
      confidence: "HIGH",
      status: "DETECTED",
      data_quality: "HIGH",
      observed_value: 32.5,
      baseline_value: 12.0,
      deviation_percentage: 170.8,
      z_score: 2.85,
      signal_score: 85.4,
      contributing_sources: ["CASE_TREND", "MEDICINE_USAGE", "ASHA_REPORT"],
      evidence: [
        {
          source: "CASE_TREND",
          metric: "Clinical Case Volume",
          baseline: 12.0,
          current: 32.5,
          deviation_percentage: 170.8,
          notes: "Clinical cases: recent 7d avg 32.5 vs baseline 12.0 (+170.8%).",
        },
        {
          source: "MEDICINE_USAGE",
          metric: "Medicine Dispensation Volume",
          baseline: 25.0,
          current: 65.0,
          deviation_percentage: 160.0,
          notes: "Medicine usage: recent 7d avg 65 units vs baseline 25 (+160.0%).",
        },
        {
          source: "ASHA_REPORT",
          metric: "Community Field Observations",
          baseline: 1.0,
          current: 6.0,
          deviation_percentage: 500.0,
          notes: "ASHA community reports: elevated cluster observations (6 reports/day).",
        },
      ],
      ai_summary:
        "Public-Health Early-Warning Intelligence: Statistical operational deviation detected in Ashti PHC, Gadchiroli. Contributing operational streams: case trend, medicine usage, ASHA report. Recent metrics are elevated relative to baseline moving averages. Potential anomaly detected. Human public-health review required. This analysis is an early operational signal, not an outbreak declaration or diagnostic claim.",
      notes: "Multiple health-related operational streams increased concurrently in Ashti PHC. Clinical cases (+170.8%) and antipyretic consumption (+160.0%) showed concurrent elevation.",
      algorithm_version: "v2.0-deterministic",
      reviewed_by_id: null,
      reviewed_at: null,
      resolution_category: null,
      resolution_notes: null,
      dedup_key: "dedup_phc-1_MULTI_SOURCE_SIGNAL",
      is_stale: false,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      events: [
        {
          id: "evt-001",
          warning_id: "ew-001",
          action: "SIGNAL_DETECTED",
          status: "DETECTED",
          actor_id: "system-early-warning",
          notes: "Statistical anomaly detected across clinical cases, medicine usage, and ASHA reports.",
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
      ],
    },
  ],
  [
    "ew-002",
    {
      id: "ew-002",
      geographic_scope: "phc",
      location_id: "phc-2",
      location_name: "Aheri Sub-District Health Centre",
      phc_id: "phc-2",
      phc_name: "Aheri Sub-District Health Centre",
      district: "Gadchiroli",
      taluka: "Aheri",
      village: "Aheri",
      signal_type: "CASE_TREND_ANOMALY",
      category: "GENERAL",
      severity: "MEDIUM",
      confidence: "MEDIUM",
      status: "UNDER_REVIEW",
      data_quality: "MEDIUM",
      observed_value: 18.0,
      baseline_value: 11.5,
      deviation_percentage: 56.5,
      z_score: 1.85,
      signal_score: 28.25,
      contributing_sources: ["CASE_TREND"],
      evidence: [
        {
          source: "CASE_TREND",
          metric: "Clinical Case Volume",
          baseline: 11.5,
          current: 18.0,
          deviation_percentage: 56.5,
          notes: "Clinical cases: recent 7d avg 18.0 vs baseline 11.5 (+56.5%).",
        },
      ],
      ai_summary:
        "Public-Health Early-Warning Intelligence: Statistical operational deviation detected in Aheri Sub-District Health Centre, Gadchiroli. Contributing operational streams: case trend. Recent metrics are elevated relative to baseline moving averages. Potential anomaly detected. Human public-health review required.",
      notes: "Elevated clinical case volume (+56.5%) detected in Aheri Sub-District Health Centre relative to baseline.",
      algorithm_version: "v2.0-deterministic",
      reviewed_by_id: "doc-1",
      reviewed_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      resolution_category: null,
      resolution_notes: "Field medical officer reviewing OPD registration records.",
      dedup_key: "dedup_phc-2_CASE_TREND_ANOMALY",
      is_stale: false,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      events: [
        {
          id: "evt-002",
          warning_id: "ew-002",
          action: "SIGNAL_DETECTED",
          status: "DETECTED",
          actor_id: "system-early-warning",
          notes: "Elevated case signal detected.",
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          id: "evt-003",
          warning_id: "ew-002",
          action: "REQUEST_INVESTIGATION",
          status: "UNDER_REVIEW",
          actor_id: "admin-uuid-001",
          notes: "Field medical officer reviewing OPD registration records.",
          created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
      ],
    },
  ],
]);

const VALID_STATUSES = ["DETECTED", "UNDER_REVIEW", "VERIFIED", "DISMISSED", "RESOLVED", "new", "acknowledged", "under_review", "resolved", "escalated"];
const VALID_REVIEW_ACTIONS = ["ACKNOWLEDGE", "REQUEST_INVESTIGATION", "VERIFY", "DISMISS", "RESOLVE", "ADD_NOTE"];
const VALID_RESOLUTIONS = [
  "SEASONAL_VARIATION",
  "SEASONAL_PATTERN",
  "DATA_ENTRY_CHANGE",
  "DATA_ISSUE",
  "REPORTING_INCREASE",
  "MEDICINE_REDISTRIBUTION",
  "OUTREACH_CAMP",
  "KNOWN_EVENT",
  "TEMPORARY_EVENT",
  "NO_ANOMALY",
  "REQUIRES_MONITORING",
  "ESCALATED",
  "OTHER",
];

class EarlyWarningService {
  constructor() {
    this.caseProvider = new HealthCasesSignalProvider();
    this.medicineProvider = new MedicineUsageSignalProvider();
    this.feedbackProvider = new FeedbackSignalProvider();
    this.weatherProvider = new WeatherEnvironmentSignalProvider();
    this.communityProvider = new CommunitySignalProvider();
    this.pharmacyProvider = new PharmacySignalProvider();
  }

  /**
   * Run full multi-source anomaly evaluation for a specific PHC or district
   */
  async evaluateFacility(phcId, district = "Gadchiroli", options = {}) {
    // 1. Fetch signal streams across available providers
    const [caseObs, medObs, feedObs, weatherRes, commRes, pharmRes] = await Promise.all([
      this.caseProvider.fetchAggregatedSignal({ phcId, district, days: 28, mockObservations: options.mockCaseObs }),
      this.medicineProvider.fetchAggregatedSignal({ phcId, days: 28, mockObservations: options.mockMedObs }),
      this.feedbackProvider.fetchAggregatedSignal({ phcId, district, days: 28, mockObservations: options.mockFeedObs }),
      this.weatherProvider.fetchAggregatedSignal({ phcId, district, days: 28, simulateSpike: options.simulateWeatherSpike, mockObservations: options.mockWeatherObs }),
      this.communityProvider.fetchAggregatedSignal({ phcId, district, days: 28, simulateSpike: options.simulateCommunitySpike, mockObservations: options.mockCommObs }),
      this.pharmacyProvider.fetchAggregatedSignal({ phcId, district, days: 28, simulateSpike: options.simulatePharmacySpike, mockObservations: options.mockPharmObs }),
    ]);

    const isStale = options.isStale === true;
    const lastSynced = isStale ? new Date(Date.now() - 3600000 * 50) : new Date();

    // 2. Compute individual statistical anomalies
    const caseAnomaly = detectSignalAnomaly({ observations: Array.isArray(caseObs) ? caseObs : caseObs?.observations || [], lastSyncedAt: lastSynced });
    const medAnomaly = detectSignalAnomaly({ observations: Array.isArray(medObs) ? medObs : medObs?.observations || [], lastSyncedAt: lastSynced });
    const feedAnomaly = detectSignalAnomaly({ observations: Array.isArray(feedObs) ? feedObs : feedObs?.observations || [], lastSyncedAt: lastSynced });

    const weatherAnomaly = weatherRes.is_available
      ? detectSignalAnomaly({ observations: weatherRes.observations || [], lastSyncedAt: lastSynced })
      : { status: "WEATHER_DATA_UNAVAILABLE", is_available: false, data_quality: "UNAVAILABLE", deviation_percentage: 0, severity: "INFO" };

    const commAnomaly = commRes.is_available
      ? detectSignalAnomaly({ observations: commRes.observations || [], lastSyncedAt: lastSynced })
      : { status: "NOT_AVAILABLE", is_available: false, data_quality: "UNAVAILABLE", deviation_percentage: 0, severity: "INFO" };

    const pharmAnomaly = pharmRes.is_available
      ? detectSignalAnomaly({ observations: pharmRes.observations || [], lastSyncedAt: lastSynced })
      : { status: "NOT_AVAILABLE", is_available: false, data_quality: "UNAVAILABLE", deviation_percentage: 0, severity: "INFO" };

    // 3. Correlate multi-source signals
    const locationName = phcId === "phc-1" ? "Ashti Primary Health Centre" : phcId === "phc-2" ? "Aheri Sub-District Health Centre" : `Facility (${phcId || district})`;
    const correlation = correlateMultiSignals({
      caseSignal: caseAnomaly,
      medicineSignal: medAnomaly,
      feedbackSignal: feedAnomaly,
      communitySignal: commAnomaly,
      weatherSignal: weatherAnomaly,
      pharmacySignal: pharmAnomaly,
      locationName,
      isStale,
    });

    const isMultiSource = correlation.contributing_sources.length >= 2;
    const signalType = isMultiSource
      ? "MULTI_SOURCE_SIGNAL"
      : correlation.contributing_sources[0] === "MEDICINE_USAGE"
      ? "MEDICINE_USAGE_ANOMALY"
      : correlation.contributing_sources[0] === "COMMUNITY_FEEDBACK"
      ? "COMMUNITY_FEEDBACK_ANOMALY"
      : correlation.contributing_sources[0] === "ASHA_REPORT"
      ? "ASHA_OBSERVATION_ANOMALY"
      : "CASE_TREND_ANOMALY";

    return {
      geographic_scope: phcId ? "phc" : "district",
      location_id: phcId || district,
      location_name: locationName,
      phc_id: phcId,
      district,
      signal_type: signalType,
      case_signal: caseAnomaly,
      medicine_signal: medAnomaly,
      feedback_signal: feedAnomaly,
      weather_signal: weatherAnomaly,
      community_signal: commAnomaly,
      pharmacy_signal: pharmAnomaly,
      correlation,
      severity: correlation.composite_severity,
      signal_level: correlation.composite_signal_level,
      confidence: correlation.composite_confidence,
      data_quality: correlation.data_quality,
      signal_score: correlation.signal_score,
      evidence: correlation.evidence,
      contributing_sources: correlation.contributing_sources,
      is_stale: isStale,
      evaluated_at: new Date().toISOString(),
    };
  }

  /**
   * List public-health early warnings with strict role scoping and de-identification
   */
  async getSignals(user, { phc_id, district, severity, signal_level, status } = {}) {
    if (!user || user.role === "patient") {
      const err = new Error("Access forbidden: Patients cannot access internal public-health early-warning surveillance data.");
      err.statusCode = 403;
      throw err;
    }

    let targetPhcId = phc_id;
    if (user.role === "phc_staff") {
      targetPhcId = user.assignedPhcId || "phc-1";
    }

    let results = Array.from(mockEarlyWarningsStore.values());

    if (targetPhcId) {
      results = results.filter((s) => s.phc_id === targetPhcId || s.location_id === targetPhcId);
    }
    if (district) {
      results = results.filter((s) => s.district.toLowerCase().includes(district.toLowerCase()));
    }
    if (severity) {
      const sevNorm = severity.toUpperCase();
      results = results.filter((s) => (s.severity || s.signal_level) === sevNorm);
    } else if (signal_level) {
      const sigNorm = signal_level.toUpperCase();
      results = results.filter((s) => s.signal_level === sigNorm || s.severity === sigNorm);
    }
    if (status) {
      const statNorm = status.toUpperCase();
      results = results.filter((s) => s.status.toUpperCase() === statNorm || s.status.toLowerCase() === status.toLowerCase());
    }

    // De-identification guarantee: Ensure no patient PII is attached
    const deidentified = results.map((item) => {
      const { patient_id, patient_name, abha_id, phone, address, ...safeRecord } = item;
      return safeRecord;
    });

    return {
      total: deidentified.length,
      items: deidentified,
    };
  }

  /**
   * Retrieve single early warning by ID
   */
  async getSignalById(user, warningId) {
    if (!user || user.role === "patient") {
      const err = new Error("Access forbidden: Patients cannot access internal surveillance data.");
      err.statusCode = 403;
      throw err;
    }

    const warning = mockEarlyWarningsStore.get(warningId);
    if (!warning) {
      const err = new Error(`Early-warning record not found with ID: ${warningId}`);
      err.statusCode = 404;
      throw err;
    }

    if (user.role === "phc_staff" && warning.phc_id !== user.assignedPhcId && warning.location_id !== user.assignedPhcId) {
      const err = new Error("Access forbidden: You may only view early-warning records for your assigned PHC.");
      err.statusCode = 403;
      throw err;
    }

    const { patient_id, patient_name, abha_id, phone, address, ...safeRecord } = warning;
    return safeRecord;
  }

  /**
   * Ingest or create early warning with duplicate protection
   */
  async createEarlyWarning(warningData) {
    const dedupKey = warningData.dedup_key || `dedup_${warningData.location_id || warningData.phc_id}_${warningData.signal_type}_${new Date().toISOString().slice(0, 10)}`;

    // Duplicate check
    for (const existing of mockEarlyWarningsStore.values()) {
      if (existing.dedup_key === dedupKey) {
        return { isDuplicate: true, warning: existing };
      }
    }

    const id = `ew-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const payload = {
      id,
      geographic_scope: warningData.geographic_scope || "phc",
      location_id: warningData.location_id || warningData.phc_id || "phc-1",
      location_name: warningData.location_name || warningData.phc_name || "Facility",
      phc_id: warningData.phc_id || warningData.location_id || "phc-1",
      phc_name: warningData.phc_name || warningData.location_name || "Facility",
      district: warningData.district || "Gadchiroli",
      taluka: warningData.taluka || "Chamorshi",
      village: warningData.village || null,
      signal_type: warningData.signal_type || "MULTI_SOURCE_SIGNAL",
      category: warningData.category || "GENERAL",
      severity: warningData.severity || "INFO",
      confidence: warningData.confidence || "MEDIUM",
      status: warningData.status || "DETECTED",
      data_quality: warningData.data_quality || "HIGH",
      observed_value: warningData.observed_value || 0,
      baseline_value: warningData.baseline_value || 0,
      deviation_percentage: warningData.deviation_percentage || 0,
      z_score: warningData.z_score || 0,
      signal_score: warningData.signal_score || 0,
      evidence: warningData.evidence || [],
      contributing_sources: warningData.contributing_sources || ["CASE_TREND"],
      ai_summary: warningData.ai_summary || null,
      ai_explanations: warningData.ai_explanations || [],
      ai_limitations: warningData.ai_limitations || [],
      recommended_review_questions: warningData.recommended_review_questions || [],
      notes: warningData.notes || "Early warning anomaly recorded for public-health investigation.",
      algorithm_version: warningData.algorithm_version || "v2.0-deterministic",
      reviewed_by_id: null,
      reviewed_at: null,
      resolution_category: null,
      resolution_notes: null,
      dedup_key: dedupKey,
      is_stale: Boolean(warningData.is_stale),
      created_at: now,
      updated_at: now,
      events: [
        {
          id: `evt-${Date.now()}`,
          warning_id: id,
          action: "SIGNAL_DETECTED",
          status: warningData.status || "DETECTED",
          actor_id: "system-early-warning",
          notes: "Statistical anomaly detected.",
          created_at: now,
        },
      ],
    };

    mockEarlyWarningsStore.set(id, payload);

    if (isConfigured) {
      await Promise.resolve(supabase.from("public_health_early_warnings").insert(payload)).catch((err) => {
        console.warn("Supabase early warning insert notice:", err.message);
      });
    }

    return { isDuplicate: false, warning: payload };
  }

  /**
   * Human Administrative Review & Verification Workflow
   * Actions: ACKNOWLEDGE, REQUEST_INVESTIGATION, VERIFY, DISMISS, RESOLVE, ADD_NOTE
   */
  async updateSignalStatus(user, warningId, { action, status, resolution_category, notes } = {}) {
    if (!user || !["district_admin", "doctor", "phc_staff"].includes(user.role)) {
      const err = new Error("Unauthorized: Only health administrators and medical officers can review early-warning records.");
      err.statusCode = 403;
      throw err;
    }

    const warning = mockEarlyWarningsStore.get(warningId);
    if (!warning) {
      const err = new Error(`Early-warning record not found: ${warningId}`);
      err.statusCode = 404;
      throw err;
    }

    if (user.role === "phc_staff" && warning.phc_id !== user.assignedPhcId && warning.location_id !== user.assignedPhcId) {
      const err = new Error("Access forbidden: You cannot review early-warning records for another PHC.");
      err.statusCode = 403;
      throw err;
    }

    const rawAction = action || status || "UNDER_REVIEW";
    const reviewAction = String(rawAction).toUpperCase();

    // Map Action to Target Status
    let nextStatus = warning.status;
    if (reviewAction === "ACKNOWLEDGE" || reviewAction === "REQUEST_INVESTIGATION") nextStatus = "UNDER_REVIEW";
    else if (reviewAction === "VERIFY" || reviewAction === "VERIFIED") nextStatus = "VERIFIED";
    else if (reviewAction === "DISMISS" || reviewAction === "DISMISSED") nextStatus = "DISMISSED";
    else if (reviewAction === "RESOLVE" || reviewAction === "RESOLVED") nextStatus = "RESOLVED";
    else if (reviewAction === "ADD_NOTE") nextStatus = warning.status;
    else if (VALID_STATUSES.includes(reviewAction)) nextStatus = reviewAction;
    else {
      const err = new Error(`Invalid review action or status '${rawAction}'. Must be one of [${VALID_REVIEW_ACTIONS.join(", ")}].`);
      err.statusCode = 400;
      throw err;
    }

    if (resolution_category && !VALID_RESOLUTIONS.includes(resolution_category.toUpperCase())) {
      const err = new Error(`Invalid resolution category '${resolution_category}'. Must be one of [${VALID_RESOLUTIONS.join(", ")}].`);
      err.statusCode = 400;
      throw err;
    }

    const now = new Date().toISOString();
    warning.status = nextStatus;
    if (resolution_category) warning.resolution_category = resolution_category.toUpperCase();
    warning.reviewed_by_id = user.profileId || user.id || "admin-uuid-001";
    warning.reviewed_at = now;
    warning.updated_at = now;
    if (notes) {
      warning.resolution_notes = notes;
      warning.notes = `${warning.notes || ""}\n[${now}] ${notes}`.trim();
    }

    const newEvent = {
      id: `evt-${Date.now()}`,
      warning_id: warningId,
      action: reviewAction,
      status: nextStatus,
      actor_id: user.profileId || user.id,
      notes: notes ? `${notes} (Category: ${resolution_category || "N/A"})` : `Action ${reviewAction} applied`,
      created_at: now,
    };

    warning.events = warning.events || [];
    warning.events.push(newEvent);
    mockEarlyWarningsStore.set(warningId, warning);

    await auditService.logAuditEvent({
      actor_id: user.profileId || user.id,
      action: `EARLY_WARNING_${reviewAction}`,
      entity_type: "public_health_early_warnings",
      entity_id: warningId,
      metadata: {
        action: reviewAction,
        new_status: nextStatus,
        resolution_category: resolution_category || null,
        phc_id: warning.phc_id || warning.location_id,
        severity: warning.severity,
      },
    });

    return warning;
  }

  /**
   * Submit structured ASHA / community observation report
   */
  async submitCommunityReport(user, reportData) {
    if (!user || user.role === "patient") {
      const err = new Error("Access forbidden: Only health workers and authorized staff can submit community observations.");
      err.statusCode = 403;
      throw err;
    }
    return this.communityProvider.submitCommunityReport(reportData);
  }

  /**
   * Retrieve community reports
   */
  async getCommunityReports(user, filter = {}) {
    if (!user || user.role === "patient") {
      const err = new Error("Access forbidden: Patients cannot view internal community surveillance logs.");
      err.statusCode = 403;
      throw err;
    }
    return this.communityProvider.getCommunityReports(filter);
  }

  /**
   * Get Aggregate Public-Health Surveillance Analytics
   */
  async getAnalytics(user, { district = "Gadchiroli" } = {}) {
    if (!user || user.role === "patient") {
      const err = new Error("Access forbidden: Patients cannot access early-warning surveillance analytics.");
      err.statusCode = 403;
      throw err;
    }

    const { items: allWarnings } = await this.getSignals(user, { district });

    const activeWarnings = allWarnings.filter((w) => w.status !== "RESOLVED" && w.status !== "DISMISSED" && w.status !== "resolved");
    const highSeverityCount = activeWarnings.filter((w) => w.severity === "HIGH").length;
    const mediumCount = activeWarnings.filter((w) => w.severity === "MEDIUM" || w.severity === "WARNING" || w.signal_level === "ELEVATED").length;
    const lowCount = activeWarnings.filter((w) => w.severity === "LOW" || w.severity === "WATCH").length;
    const multiSourceCount = activeWarnings.filter((w) => w.signal_type === "MULTI_SOURCE_SIGNAL" || (w.contributing_sources && w.contributing_sources.length >= 2)).length;

    // Geographic Facility Breakdown
    const facilityMap = new Map();
    for (const w of activeWarnings) {
      const name = w.location_name || w.phc_name || `PHC ${w.location_id}`;
      const existing = facilityMap.get(name) || { name, phc_id: w.location_id || w.phc_id, signals_count: 0, highest_severity: "INFO" };
      existing.signals_count++;
      if (w.severity === "HIGH") existing.highest_severity = "HIGH";
      else if (w.severity === "MEDIUM" && existing.highest_severity !== "HIGH") existing.highest_severity = "MEDIUM";
      else if (w.severity === "LOW" && existing.highest_severity === "INFO") existing.highest_severity = "LOW";
      facilityMap.set(name, existing);
    }

    return {
      district,
      total_active_signals: activeWarnings.length,
      total_active_warnings: activeWarnings.length,
      high_severity_count: highSeverityCount,
      warning_count: mediumCount,
      medium_severity_count: mediumCount,
      watch_count: lowCount,
      low_severity_count: lowCount,
      multi_source_signals_count: multiSourceCount,
      resolved_signals_count: allWarnings.filter((w) => w.status === "RESOLVED" || w.status === "resolved").length,
      dismissed_signals_count: allWarnings.filter((w) => w.status === "DISMISSED" || w.status === "dismissed").length,
      facilities_with_active_signals: Array.from(facilityMap.values()),
      data_providers: [
        { name: "PHC Clinical Cases", status: "ONLINE", type: "CASE_TREND", isLive: true },
        { name: "Medicine Dispensation", status: "ONLINE", type: "MEDICINE_USAGE", isLive: true },
        { name: "Citizen Service Feedback", status: "ONLINE", type: "COMMUNITY_FEEDBACK", isLive: true },
        { name: "Community & ASHA Reports", status: "ONLINE", type: "ASHA_REPORT", isLive: true },
        {
          name: "Weather & Environment",
          status: this.weatherProvider.isConfigured() ? "ONLINE" : "WEATHER_DATA_UNAVAILABLE",
          type: "WEATHER",
          isLive: this.weatherProvider.isConfigured(),
        },
        {
          name: "Retail Pharmacy Feeds",
          status: this.pharmacyProvider.isConfigured() ? "ONLINE" : "NOT_AVAILABLE",
          type: "PHARMACY",
          isLive: this.pharmacyProvider.isConfigured(),
        },
      ],
      disclaimers: [
        "JeevanSetu provides early-warning signals for human public-health investigation. It does not autonomously diagnose disease or declare outbreaks.",
        "Absence of a signal does not prove absence of disease.",
      ],
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Scheduled Background Sweep: Recalculate signals across facilities and trigger deduplicated notifications
   */
  async runPeriodicEarlyWarningSweep() {
    const startTime = Date.now();
    let evaluatedCount = 0;
    let alertsCreated = 0;

    const facilities = [
      { id: "phc-1", district: "Gadchiroli", taluka: "Chamorshi", name: "Ashti Primary Health Centre" },
      { id: "phc-2", district: "Gadchiroli", taluka: "Aheri", name: "Aheri Sub-District Health Centre" },
    ];

    for (const fac of facilities) {
      try {
        const evaluation = await this.evaluateFacility(fac.id, fac.district);
        evaluatedCount++;

        if (["HIGH", "MEDIUM", "LOW"].includes(evaluation.severity)) {
          const todayStr = new Date().toISOString().split("T")[0];
          const dedupKey = `ew_${fac.id}_${evaluation.signal_type}_${todayStr}`;

          const { isDuplicate, warning } = await this.createEarlyWarning({
            location_id: fac.id,
            location_name: fac.name,
            phc_id: fac.id,
            phc_name: fac.name,
            district: fac.district,
            taluka: fac.taluka,
            signal_type: evaluation.signal_type,
            severity: evaluation.severity,
            confidence: evaluation.confidence,
            data_quality: evaluation.data_quality,
            observed_value: evaluation.case_signal?.observed_value || 0,
            baseline_value: evaluation.case_signal?.baseline_value || 0,
            deviation_percentage: evaluation.case_signal?.deviation_percentage || 0,
            z_score: evaluation.case_signal?.z_score || 0,
            evidence: evaluation.evidence,
            contributing_sources: evaluation.contributing_sources,
            dedup_key: dedupKey,
          });

          if (!isDuplicate && (evaluation.severity === "HIGH" || evaluation.severity === "MEDIUM")) {
            await notificationService.notifyAdminAlert({
              type: "early_warning_signal",
              title: `Public Health Early Warning Signal: ${fac.name}`,
              message: evaluation.correlation?.description || "Statistical operational deviation detected.",
              facility: fac.name,
              severity: evaluation.severity === "HIGH" ? "critical" : "warning",
              metadata: {
                phc_id: fac.id,
                severity: evaluation.severity,
                dedup_key: dedupKey,
              },
            });
            alertsCreated++;
          }
        }
      } catch (err) {
        console.warn(`Early warning sweep notice for ${fac.id}:`, err.message);
      }
    }

    const durationMs = Date.now() - startTime;

    await auditService.logAuditEvent({
      actor_id: "system-job-early-warning",
      action: "EARLY_WARNING_SWEEP_EXECUTED",
      entity_type: "public_health_early_warnings",
      metadata: {
        facilities_evaluated: evaluatedCount,
        alerts_created: alertsCreated,
        duration_ms: durationMs,
      },
    });

    return {
      success: true,
      facilities_evaluated: evaluatedCount,
      alerts_created: alertsCreated,
      duration_ms: durationMs,
    };
  }
}

module.exports = new EarlyWarningService();
