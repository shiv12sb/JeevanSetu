const express = require("express");
const {
  getMonitoringOverview,
  getAuditLogs,
} = require("../controllers/admin.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { validatePagination } = require("../validators/common.validator");

const router = express.Router();

// GET /api/admin/monitoring - District clinical and operational surveillance
router.get(
  "/monitoring",
  requireAuth,
  requireRole("district_admin", "phc_staff", "hospital_staff"),
  getMonitoringOverview
);

// GET /api/admin/audit-logs - System-wide immutable audit trail (Admin only)
router.get(
  "/audit-logs",
  requireAuth,
  requireRole("district_admin"),
  validatePagination,
  getAuditLogs
);

module.exports = router;
