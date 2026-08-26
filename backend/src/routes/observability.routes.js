const express = require("express");
const {
  getOperationsOverview,
  getMetrics,
  getRecentErrors,
  getJobsStatus,
  getSecurityEvents,
  triggerTestAlert,
} = require("../controllers/observability.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = express.Router();

// District Admin Role Protected Endpoints
router.use(requireAuth);
router.use(requireRole("district_admin"));

// GET /api/operations/overview - Unified Operations Dashboard Snapshot
router.get("/overview", getOperationsOverview);

// GET /api/operations/metrics - Raw Observability Counters & Latency
router.get("/metrics", getMetrics);

// GET /api/operations/errors - Recent Sanitized Errors
router.get("/errors", getRecentErrors);

// GET /api/operations/jobs - Background Jobs Monitor & Stuck Detection
router.get("/jobs", getJobsStatus);

// GET /api/operations/security - Operational Security Events Log
router.get("/security", getSecurityEvents);

// POST /api/operations/alerts/test - Test Alert Deduplication
router.post("/alerts/test", triggerTestAlert);

module.exports = router;
