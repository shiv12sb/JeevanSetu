const express = require("express");
const {
  getSignals,
  getSignalById,
  updateSignalStatus,
  evaluateFacility,
  getAnalytics,
  getAiSummary,
  explainAlertWithAi,
  submitCommunityReport,
  getCommunityReports,
  triggerSweep,
} = require("../controllers/earlyWarning.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { validateSignalStatusUpdate, validateCommunityReport } = require("../validators/earlyWarning.validator");

const router = express.Router();

// GET /api/early-warning - List early-warning signals (PHC staff, Doctors, Admins)
router.get(
  "/",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  getSignals
);

// GET /api/early-warning/signals - Alias for signals list
router.get(
  "/signals",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  getSignals
);

// GET /api/early-warning/analytics - District early-warning summary metrics
router.get(
  "/analytics",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  getAnalytics
);

// GET /api/early-warning/ai-summary - Safe, grounded non-alarmist AI operational summary
router.get(
  "/ai-summary",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  getAiSummary
);

// POST /api/early-warning/ai-explain - Structured AI explanation for specific alert
router.post(
  "/ai-explain",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  explainAlertWithAi
);

// POST /api/early-warning/community-reports - Submit ASHA / Community observation
router.post(
  "/community-reports",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  validateCommunityReport,
  submitCommunityReport
);

// GET /api/early-warning/community-reports - List community observations
router.get(
  "/community-reports",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  getCommunityReports
);

// POST /api/early-warning/trigger-sweep - Execute background sweep
router.post(
  "/trigger-sweep",
  requireAuth,
  requireRole("district_admin"),
  triggerSweep
);

// GET /api/early-warning/evaluate/:phcId - Real-time facility signal anomaly evaluation
router.get(
  "/evaluate/:phcId",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  evaluateFacility
);

// GET /api/early-warning/:id - Single signal with review events history
router.get(
  "/:id",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  getSignalById
);

// PATCH /api/early-warning/:id/status - Update review status
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  validateSignalStatusUpdate,
  updateSignalStatus
);

// POST /api/early-warning/:id/review - Submit administrative review
router.post(
  "/:id/review",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  validateSignalStatusUpdate,
  updateSignalStatus
);

// POST /api/early-warning/signals/:id/review - Alias for review
router.post(
  "/signals/:id/review",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  validateSignalStatusUpdate,
  updateSignalStatus
);

module.exports = router;
