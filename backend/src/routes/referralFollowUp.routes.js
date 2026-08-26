const express = require("express");
const {
  getFollowUpQueue,
  getFollowUpById,
  manualOverride,
  getAnalytics,
} = require("../controllers/referralFollowUp.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { validateManualOverride } = require("../validators/referralFollowUp.validator");

const router = express.Router();

// GET /api/referrals/follow-ups/analytics - Operational analytics (Admins, Doctors, Staff)
router.get(
  "/analytics",
  requireAuth,
  requireRole("district_admin", "doctor", "phc_staff", "hospital_staff"),
  getAnalytics
);

// GET /api/referrals/follow-ups - List follow-up items (Scoped by role)
router.get("/", requireAuth, getFollowUpQueue);

// GET /api/referrals/follow-ups/:id - Single follow-up detail with timeline
router.get("/:id", requireAuth, getFollowUpById);

// POST /api/referrals/follow-ups/:id/override - Manual override resolution (Authorized staff only)
router.post(
  "/:id/override",
  requireAuth,
  requireRole("phc_staff", "hospital_staff", "doctor", "district_admin"),
  validateManualOverride,
  manualOverride
);

module.exports = router;
