const { logger } = require("../../utils/logger");

class ObservabilityMetricsService {
  constructor() {
    this.reset();
  }

  reset() {
    this.startTime = Date.now();
    this.metrics = {
      requests_total: 0,
      requests_error_total: 0,
      requests_slow_total: 0,
      status_codes: {},
      latencies: [], // Rolling window of last 200 request durations
      jobs_total: 0,
      jobs_success_total: 0,
      jobs_failed_total: 0,
      jobs_stuck_total: 0,
      notifications_total: 0,
      notifications_failed_total: 0,
      ai_requests_total: 0,
      ai_fallbacks_total: 0,
      ivr_calls_total: 0,
      ivr_errors_total: 0,
      security_events_total: 0,
      security_events_by_type: {},
    };

    this.recentErrors = []; // Circular buffer of max 50 recent errors
    this.recentAlerts = new Map(); // Alert fingerprint -> last sent timestamp (cooldown)
    this.securityEventsLog = []; // Max 100 recent security events
  }

  /**
   * Record incoming HTTP request completion
   */
  recordHttpRequest({ method, route, statusCode, durationMs, isSlow = false }) {
    this.metrics.requests_total += 1;
    if (statusCode >= 400) {
      this.metrics.requests_error_total += 1;
    }
    if (isSlow) {
      this.metrics.requests_slow_total += 1;
    }

    const codeGroup = `${Math.floor(statusCode / 100)}xx`;
    this.metrics.status_codes[codeGroup] = (this.metrics.status_codes[codeGroup] || 0) + 1;

    this.metrics.latencies.push(durationMs);
    if (this.metrics.latencies.length > 200) {
      this.metrics.latencies.shift();
    }
  }

  /**
   * Record structured error in circular buffer
   */
  recordError({ request_id, error_code, status_code, route, method, message }) {
    const errorRecord = {
      id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      request_id: request_id || "unknown-req",
      error_code: error_code || "INTERNAL_ERROR",
      status_code: status_code || 500,
      route: route || "/",
      method: method || "GET",
      // Safe sanitized message without leaking internal database passwords
      message: (message || "Internal error").replace(/(password|token|key|secret)=([^\s&]+)/gi, "$1=[REDACTED]").slice(0, 150),
    };

    this.recentErrors.unshift(errorRecord);
    if (this.recentErrors.length > 50) {
      this.recentErrors.pop();
    }
  }

  /**
   * Record background job outcome
   */
  recordJobOutcome({ job_name, status, duration_ms }) {
    this.metrics.jobs_total += 1;
    if (status === "COMPLETED") {
      this.metrics.jobs_success_total += 1;
    } else if (status === "FAILED") {
      this.metrics.jobs_failed_total += 1;
    } else if (status === "STUCK") {
      this.metrics.jobs_stuck_total += 1;
    }
  }

  /**
   * Record AI request / fallback
   */
  recordAiCall({ isFallback = false }) {
    this.metrics.ai_requests_total += 1;
    if (isFallback) {
      this.metrics.ai_fallbacks_total += 1;
    }
  }

  /**
   * Record IVR Call / Error
   */
  recordIvrCall({ isError = false }) {
    this.metrics.ivr_calls_total += 1;
    if (isError) {
      this.metrics.ivr_errors_total += 1;
    }
  }

  /**
   * Record Operational Security Event (auth failures, replay attacks, rate limit breaches)
   */
  recordSecurityEvent({ type, sourceIp = "0.0.0.0", details = "" }) {
    this.metrics.security_events_total += 1;
    this.metrics.security_events_by_type[type] = (this.metrics.security_events_by_type[type] || 0) + 1;

    const eventRecord = {
      id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      type,
      source_ip: sourceIp,
      details: String(details).replace(/(password|secret|key)=([^\s&]+)/gi, "$1=[REDACTED]").slice(0, 120),
    };

    this.securityEventsLog.unshift(eventRecord);
    if (this.securityEventsLog.length > 100) {
      this.securityEventsLog.pop();
    }
  }

  /**
   * Deduplicated Alert Dispatcher
   * Prevents spamming alerts with identical fingerprints within cooldown window
   */
  sendOperationalAlert({ fingerprint, level = "WARN", title, message, metadata = {}, cooldownMs = 60000 }) {
    const now = Date.now();
    const lastSent = this.recentAlerts.get(fingerprint);

    if (lastSent && now - lastSent < cooldownMs) {
      return {
        dispatched: false,
        fingerprint,
        reason: "COOLDOWN_ACTIVE",
        cooldownRemainingMs: cooldownMs - (now - lastSent),
      };
    }

    this.recentAlerts.set(fingerprint, now);

    // Clean up old fingerprints
    for (const [fp, time] of this.recentAlerts.entries()) {
      if (now - time > cooldownMs * 3) {
        this.recentAlerts.delete(fp);
      }
    }

    return {
      dispatched: true,
      fingerprint,
      level,
      title,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate current summary metrics snapshot
   */
  getSnapshot() {
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
    const latencies = this.metrics.latencies;
    const avgLatency = latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0;

    // p95 latency
    let p95Latency = 0;
    if (latencies.length > 0) {
      const sorted = [...latencies].sort((a, b) => a - b);
      const idx = Math.floor(sorted.length * 0.95);
      p95Latency = sorted[idx] || sorted[sorted.length - 1];
    }

    const errorRatePct = this.metrics.requests_total > 0
      ? Number(((this.metrics.requests_error_total / this.metrics.requests_total) * 100).toFixed(1))
      : 0.0;

    return {
      uptime_seconds: uptimeSec,
      requests_total: this.metrics.requests_total,
      requests_error_total: this.metrics.requests_error_total,
      requests_slow_total: this.metrics.requests_slow_total,
      error_rate_pct: errorRatePct,
      latency_ms: {
        average: avgLatency,
        p95: p95Latency,
      },
      status_codes: this.metrics.status_codes,
      jobs: {
        total: this.metrics.jobs_total,
        success: this.metrics.jobs_success_total,
        failed: this.metrics.jobs_failed_total,
        stuck: this.metrics.jobs_stuck_total,
      },
      ai: {
        total_calls: this.metrics.ai_requests_total,
        fallbacks: this.metrics.ai_fallbacks_total,
      },
      ivr: {
        total_calls: this.metrics.ivr_calls_total,
        errors: this.metrics.ivr_errors_total,
      },
      security: {
        events_total: this.metrics.security_events_total,
        by_type: this.metrics.security_events_by_type,
      },
      generated_at: new Date().toISOString(),
    };
  }

  getRecentErrors(limit = 20) {
    return this.recentErrors.slice(0, limit);
  }

  getRecentSecurityEvents(limit = 20) {
    return this.securityEventsLog.slice(0, limit);
  }
}

module.exports = new ObservabilityMetricsService();
