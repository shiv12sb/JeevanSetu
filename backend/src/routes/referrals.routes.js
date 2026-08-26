/**
 * Closed-Loop Referral Intelligence Routes
 */

const express = require("express");
const {
  getReferrals,
  getReferralById,
  createReferral,
  updateReferralStatus,
  assignTransport,
  scheduleFollowUp,
  completeFollowUp,
  getClosedLoopAnalytics,
  acknowledgeReferral,
  confirmArrival,
  acceptReferral,
  recordTreatment,
  transferReferral,
  cancelReferral,
} = require("../controllers/referrals.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { validateUuidParam, validatePagination } = require("../validators/common.validator");
const {
  validateReferralCreate,
  validateReferralUpdate,
  validateTransportAssign,
  validateFollowUpSchedule,
} = require("../validators/referrals.validator");
const followUpRoutes = require("./referralFollowUp.routes");

const router = express.Router();

// 1. Mount Referral Follow-Up Intelligence Sub-Router (/api/referrals/follow-ups)
router.use("/follow-ups", followUpRoutes);

// 2. Closed-Loop Referral Analytics
router.get(
  "/analytics",
  requireAuth,
  requireRole("district_admin", "phc_staff", "hospital_staff", "doctor"),
  getClosedLoopAnalytics
);

// 3. List Referrals (Role scoped)
router.get("/", requireAuth, validatePagination, getReferrals);

// 4. Create Referral (PHC staff & admin)
router.post(
  "/",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  validateReferralCreate,
  createReferral
);

// 5. Update Status (Closed Loop Transitions)
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("phc_staff", "doctor", "hospital_staff", "ngo_staff", "district_admin"),
  validateReferralUpdate,
  updateReferralStatus
);

// Also accept PATCH /:id for backwards compatibility
router.patch(
  "/:id",
  requireAuth,
  requireRole("phc_staff", "doctor", "hospital_staff", "ngo_staff", "district_admin"),
  validateReferralUpdate,
  updateReferralStatus
);

// 6. Assign NGO Transport
router.post(
  "/:id/transport",
  requireAuth,
  requireRole("phc_staff", "doctor", "ngo_staff", "district_admin"),
  validateTransportAssign,
  assignTransport
);

// 7. Schedule Post-Discharge Follow-Up
router.post(
  "/:id/follow-up",
  requireAuth,
  requireRole("phc_staff", "doctor", "hospital_staff", "district_admin"),
  validateFollowUpSchedule,
  scheduleFollowUp
);

// 8. Complete Follow-Up and Close Referral
router.post(
  "/:id/follow-up/complete",
  requireAuth,
  requireRole("phc_staff", "doctor", "hospital_staff", "district_admin"),
  completeFollowUp
);

// 9. Patient Referral Acknowledgement
router.post(
  "/:id/acknowledge",
  requireAuth,
  acknowledgeReferral
);

// 10. Hospital Arrival Confirmation
router.post(
  "/:id/arrival",
  requireAuth,
  requireRole("hospital_staff", "doctor", "district_admin"),
  confirmArrival
);

// 11. Hospital Referral Acceptance
router.post(
  "/:id/accept",
  requireAuth,
  requireRole("hospital_staff", "doctor", "district_admin"),
  acceptReferral
);

// 12. Hospital Treatment Recording (Phase 22)
router.post(
  "/:id/treatment",
  requireAuth,
  requireRole("hospital_staff", "doctor", "district_admin"),
  recordTreatment
);

// 13. Transfer Destination Hospital (Phase 22)
router.post(
  "/:id/transfer",
  requireAuth,
  requireRole("phc_staff", "hospital_staff", "doctor", "district_admin"),
  transferReferral
);

// 14. Cancel Referral (Phase 22)
router.post(
  "/:id/cancel",
  requireAuth,
  requireRole("phc_staff", "hospital_staff", "doctor", "district_admin"),
  cancelReferral
);

// 15. Retrieve Single Referral Details
router.get("/:id", requireAuth, getReferralById);

module.exports = router;
