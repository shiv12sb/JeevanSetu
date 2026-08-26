const metricsService = require("../services/observability/metrics.service");
const jobMonitor = require("../services/observability/jobMonitor.service");
const { getAllProvidersHealth } = require("../services/providers");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * Complete Operations & Reliability Overview (District Admin only)
 */
const getOperationsOverview = async (req, res, next) => {
  try {
    const metrics = metricsService.getSnapshot();
    const providers = getAllProvidersHealth();
    const jobState = jobMonitor.getJobStatusList();
    const recentErrors = metricsService.getRecentErrors(10);
    const recentSecurity = metricsService.getRecentSecurityEvents(10);

    return sendSuccess(res, {
      statusCode: 200,
      data: {
        system: {
          status: "HEALTHY",
          environment: process.env.NODE_ENV || "development",
          uptime_seconds: metrics.uptime_seconds,
          timestamp: new Date().toISOString(),
        },
        metrics,
        providers,
        jobs: jobState,
        recent_errors: recentErrors,
        security_events: recentSecurity,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Metrics Snapshot (District Admin only)
 */
const getMetrics = async (req, res, next) => {
  try {
    const snapshot = metricsService.getSnapshot();
    return sendSuccess(res, {
      statusCode: 200,
      data: snapshot,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Recent Sanitized Errors (District Admin only)
 */
const getRecentErrors = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || "50", 10);
    const errors = metricsService.getRecentErrors(limit);
    return sendSuccess(res, {
      statusCode: 200,
      data: errors,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Background Jobs Execution History & Stuck Status (District Admin only)
 */
const getJobsStatus = async (req, res, next) => {
  try {
    const jobState = jobMonitor.getJobStatusList();
    const stuckJobs = jobMonitor.checkStuckJobs();

    return sendSuccess(res, {
      statusCode: 200,
      data: {
        ...jobState,
        stuck_jobs: stuckJobs,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Operational Security Events (District Admin only)
 */
const getSecurityEvents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || "50", 10);
    const events = metricsService.getRecentSecurityEvents(limit);
    return sendSuccess(res, {
      statusCode: 200,
      data: events,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Dispatch Test Operational Alert (with Deduplication)
 */
const triggerTestAlert = async (req, res, next) => {
  try {
    const { fingerprint, title, message, level = "WARN" } = req.body || {};
    const result = metricsService.sendOperationalAlert({
      fingerprint: fingerprint || "test_alert_manual",
      title: title || "Manual Operational Test Alert",
      message: message || "This is a test notification from the observability monitoring engine.",
      level,
      cooldownMs: 30000,
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: result.dispatched ? "Operational alert dispatched." : "Alert suppressed by deduplication cooldown.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOperationsOverview,
  getMetrics,
  getRecentErrors,
  getJobsStatus,
  getSecurityEvents,
  triggerTestAlert,
};
