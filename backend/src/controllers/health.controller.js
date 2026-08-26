const { supabase, isConfigured } = require("../config/supabase");
const env = require("../config/env");
const { getAllProvidersHealth } = require("../services/providers");
const metricsService = require("../services/observability/metrics.service");
const jobMonitor = require("../services/observability/jobMonitor.service");

/**
 * Basic / Comprehensive Health Overview
 */
async function getHealth(req, res) {
  const providers = getAllProvidersHealth();
  const metrics = metricsService.getSnapshot();

  return res.status(200).json({
    success: true,
    message: "JeevanSetu API is operational",
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
    uptime_seconds: metrics.uptime_seconds,
    environment: env.NODE_ENV,
    service: "jeevansetu-api",
    version: env.APP_VERSION,
    commit_sha: env.GIT_COMMIT_SHA,
  });
}

/**
 * Liveness Probe: "Is the process alive?"
 */
function getLiveness(req, res) {
  return res.status(200).json({
    status: "HEALTHY",
    probe: "liveness",
    process: "alive",
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Readiness Probe: "Can this instance safely serve requests?"
 * Evaluates core database, authentication, and job runner readiness
 */
async function getReadiness(req, res) {
  let dbStatus = "HEALTHY";
  let dbLatencyMs = 0;

  // Check Database Connectivity
  const dbStart = Date.now();
  if (isConfigured) {
    try {
      const { data, error } = await supabase.from("phcs").select("id").limit(1);
      dbLatencyMs = Date.now() - dbStart;
      if (error) {
        dbStatus = "DEGRADED";
      }
    } catch (err) {
      dbStatus = "UNAVAILABLE";
      dbLatencyMs = Date.now() - dbStart;
    }
  } else {
    // In local development / mock mode, mock database is always ready
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = "MOCK_READY";
  }

  const providers = getAllProvidersHealth();
  const jobState = jobMonitor.getJobStatusList();
  const stuckJobs = jobMonitor.checkStuckJobs();

  const isReady = dbStatus !== "UNAVAILABLE";
  const statusCode = isReady ? 200 : 503;

  const degradedFeatures = [];
  if (!providers.sms?.configured) degradedFeatures.push("SMS_NOTIFICATIONS");
  if (!providers.weather?.configured) degradedFeatures.push("WEATHER_SURVEILLANCE");
  if (!providers.pharmacy?.configured) degradedFeatures.push("EXTERNAL_PHARMACY_FEEDS");
  if (!providers.n8n?.configured) degradedFeatures.push("N8N_WORKFLOW_ORCHESTRATION");

  return res.status(statusCode).json({
    status: isReady ? (degradedFeatures.length > 0 ? "DEGRADED" : "HEALTHY") : "UNHEALTHY",
    probe: "readiness",
    ready_to_serve: isReady,
    dependencies: {
      database: {
        status: dbStatus,
        latency_ms: dbLatencyMs,
        is_live_configured: isConfigured,
      },
      jobs_runner: {
        status: stuckJobs.length > 0 ? "DEGRADED" : "HEALTHY",
        active_jobs_count: jobState.total_active,
        stuck_jobs_count: stuckJobs.length,
      },
      n8n: providers.n8n,
      providers: {
        sms: providers.sms,
        email: providers.email,
        telephony: providers.telephony,
        weather: providers.weather,
        pharmacy: providers.pharmacy,
      },
    },
    degraded_features: degradedFeatures,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getHealth,
  getLiveness,
  getReadiness,
};
