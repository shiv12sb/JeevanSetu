/**
 * ==============================================================================
 * JEEVANSETU PHASE 26 — CITIZEN FEEDBACK & MISSED-CALL ROUTES
 * ==============================================================================
 */

const express = require("express");
const {
  submitFeedback,
  submitAnonymousFeedback,
  trackFeedback,
  handleMissedCall,
  processIvrFeedback,
  getFeedback,
  getFeedbackById,
  reviewFeedback,
  getFeedbackAnalytics,
  getFeedbackTrends,
  getQualitySignals,
  updateQualitySignal,
  aiAssistFeedback,
} = require("../controllers/feedback.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { feedbackLimiter } = require("../middleware/rateLimit.middleware");
const { validatePagination } = require("../validators/common.validator");
const {
  validateFeedbackCreate,
  validateFeedbackReview,
  validateMissedCall,
  validateIvrInteraction,
  validateTrackingToken,
} = require("../validators/feedback.validator");

const router = express.Router();

// 1. Missed-Call Webhook (Public / Telephony Gateway)
router.post("/missed-call", feedbackLimiter, validateMissedCall, handleMissedCall);

// 2. IVR Feedback Interaction (Public / Telephony Gateway / Simulator)
router.post("/ivr", feedbackLimiter, validateIvrInteraction, processIvrFeedback);

// 3. Anonymous Feedback Direct Submission (Public)
router.post("/anonymous", feedbackLimiter, validateFeedbackCreate, submitAnonymousFeedback);

// 4. Anonymous Feedback Tracking Lookup (Public by secure tracking token)
router.get("/track/:trackingToken", validateTrackingToken, trackFeedback);

// 5. Standard Web Feedback Submission (Public / Patient / Anonymous)
router.post("/", feedbackLimiter, validateFeedbackCreate, submitFeedback);

// 6. Feedback Quality Analytics (District Admin / Staff)
router.get(
  "/analytics",
  requireAuth,
  requireRole("district_admin", "phc_staff", "hospital_staff", "doctor"),
  getFeedbackAnalytics
);

// 7. 7-Day Feedback Trends (District Admin / Staff)
router.get(
  "/trends",
  requireAuth,
  requireRole("district_admin", "phc_staff", "hospital_staff", "doctor"),
  getFeedbackTrends
);

// 8. AI Categorization & Translation Assistant (District Admin / Staff)
router.post(
  "/ai-assist",
  requireAuth,
  requireRole("district_admin", "phc_staff", "hospital_staff", "doctor"),
  aiAssistFeedback
);

// 9. Operational Quality Signals (District Admin / Staff)
router.get(
  "/signals",
  requireAuth,
  requireRole("district_admin", "phc_staff", "hospital_staff", "doctor"),
  getQualitySignals
);

router.patch(
  "/signals/:id",
  requireAuth,
  requireRole("district_admin", "phc_staff", "hospital_staff", "doctor"),
  updateQualitySignal
);

// 10. Review Feedback List (Role-Scoped: Patients view own history, Staff facility, Admin district)
router.get(
  "/",
  requireAuth,
  requireRole("district_admin", "phc_staff", "hospital_staff", "doctor", "patient"),
  validatePagination,
  getFeedback
);

// 11. Single Feedback Record
router.get(
  "/:id",
  requireAuth,
  requireRole("district_admin", "phc_staff", "hospital_staff", "doctor", "patient"),
  getFeedbackById
);

// 12. Administrative Review Submission (Status & Internal Notes)
router.post(
  "/:id/review",
  requireAuth,
  requireRole("district_admin", "phc_staff", "hospital_staff", "doctor"),
  validateFeedbackReview,
  reviewFeedback
);

router.patch(
  "/:id/review",
  requireAuth,
  requireRole("district_admin", "phc_staff", "hospital_staff", "doctor"),
  validateFeedbackReview,
  reviewFeedback
);

module.exports = router;
