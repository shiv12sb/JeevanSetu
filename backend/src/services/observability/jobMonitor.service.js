const metricsService = require("./metrics.service");
const logger = require("../../utils/logger");

class JobMonitorService {
  constructor() {
    this.activeJobs = new Map(); // jobName -> { started_at, run_id, status }
    this.recentJobRuns = []; // Circular buffer of last 50 runs
    this.stuckThresholdMs = parseInt(process.env.JOB_STUCK_THRESHOLD_MS || "300000", 10); // 5 minutes default
  }

  /**
   * Wrap and monitor any background job execution
   * @param {string} jobName - Unique job identifier
   * @param {Function} jobFn - Async job function
   */
  async executeJob(jobName, jobFn) {
    const runId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const startTime = Date.now();

    const activeRecord = {
      run_id: runId,
      job_name: jobName,
      started_at: new Date(startTime).toISOString(),
      started_at_ms: startTime,
      status: "RUNNING",
    };

    this.activeJobs.set(jobName, activeRecord);

    try {
      const result = await jobFn();
      const durationMs = Date.now() - startTime;

      const completionRecord = {
        run_id: runId,
        job_name: jobName,
        started_at: activeRecord.started_at,
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
        status: "COMPLETED",
        error: null,
      };

      this.activeJobs.delete(jobName);
      this.recordJobHistory(completionRecord);
      metricsService.recordJobOutcome({ job_name: jobName, status: "COMPLETED", duration_ms: durationMs });

      return result;
    } catch (err) {
      const durationMs = Date.now() - startTime;

      const failureRecord = {
        run_id: runId,
        job_name: jobName,
        started_at: activeRecord.started_at,
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
        status: "FAILED",
        error: err.message,
      };

      this.activeJobs.delete(jobName);
      this.recordJobHistory(failureRecord);
      metricsService.recordJobOutcome({ job_name: jobName, status: "FAILED", duration_ms: durationMs });

      logger.error(`BACKGROUND_JOB_FAILURE [${jobName}]: ${err.message}`, {
        job_name: jobName,
        run_id: runId,
        duration_ms: durationMs,
      });

      // Dispatch deduplicated alert
      metricsService.sendOperationalAlert({
        fingerprint: `job_failure_${jobName}`,
        level: "ERROR",
        title: `Background Job Failed: ${jobName}`,
        message: err.message,
        metadata: { job_name: jobName, run_id: runId },
      });

      throw err;
    }
  }

  /**
   * Check for stuck background jobs exceeding the threshold
   */
  checkStuckJobs(thresholdMs = null) {
    const limitMs = thresholdMs || this.stuckThresholdMs;
    const now = Date.now();
    const stuckList = [];

    for (const [name, job] of this.activeJobs.entries()) {
      const runningTime = now - job.started_at_ms;
      if (runningTime > limitMs) {
        job.status = "STUCK";
        job.running_time_ms = runningTime;
        stuckList.push({ ...job });

        metricsService.recordJobOutcome({ job_name: name, status: "STUCK", duration_ms: runningTime });

        logger.warn(`BACKGROUND_JOB_STUCK: Job '${name}' has been running for ${Math.round(runningTime / 1000)}s exceeding threshold.`, {
          job_name: name,
          run_id: job.run_id,
          running_time_ms: runningTime,
        });

        metricsService.sendOperationalAlert({
          fingerprint: `job_stuck_${name}`,
          level: "WARN",
          title: `Background Job Stuck: ${name}`,
          message: `Job '${name}' exceeded runtime threshold (${Math.round(runningTime / 1000)}s).`,
        });
      }
    }

    return stuckList;
  }

  recordJobHistory(record) {
    this.recentJobRuns.unshift(record);
    if (this.recentJobRuns.length > 50) {
      this.recentJobRuns.pop();
    }
  }

  getJobStatusList() {
    const now = Date.now();
    const active = Array.from(this.activeJobs.values()).map((j) => ({
      ...j,
      running_duration_ms: now - j.started_at_ms,
    }));

    return {
      active_jobs: active,
      recent_runs: this.recentJobRuns.slice(0, 20),
      total_active: active.length,
      stuck_threshold_ms: this.stuckThresholdMs,
    };
  }
}

module.exports = new JobMonitorService();
