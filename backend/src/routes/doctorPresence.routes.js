const express = require("express");
const {
  createSchedule,
  listSchedules,
  cancelSchedule,
  checkInDoctor,
  checkOutDoctor,
  getCurrentSession,
  getOperationalFlags,
  reviewFlag,
  dismissFlag,
  resolveFlag,
  addReviewNote,
  evaluatePresenceSignals,
  getOperationalSummary,
  getAISummary,
  getDoctorAttendance,
  getDutySessions,
  getDutySessionById,
  checkInDoctorSession,
  checkOutDoctorSession,
  getPresenceSignals,
  reviewPresenceSignal,
  getPresenceAnalytics,
} = require("../controllers/doctorPresence.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = express.Router();

// Schedules
router.post(
  "/schedules",
  requireAuth,
  requireRole("doctor", "phc_staff", "district_admin"),
  createSchedule
);

router.get(
  "/schedules",
  requireAuth,
  requireRole("doctor", "phc_staff", "hospital_staff", "district_admin"),
  listSchedules
);

router.post(
  "/schedules/:id/cancel",
  requireAuth,
  requireRole("phc_staff", "district_admin"),
  cancelSchedule
);

// Check-In & Check-Out
router.post(
  "/check-in",
  requireAuth,
  requireRole("doctor", "phc_staff", "hospital_staff", "district_admin"),
  checkInDoctor
);

router.post(
  "/check-out",
  requireAuth,
  requireRole("doctor", "phc_staff", "hospital_staff", "district_admin"),
  checkOutDoctor
);

router.get(
  "/current-session",
  requireAuth,
  requireRole("doctor", "phc_staff", "district_admin"),
  getCurrentSession
);

// Attendance History
router.get(
  "/attendance",
  requireAuth,
  requireRole("doctor", "phc_staff", "district_admin"),
  getDoctorAttendance
);

// Operational Summary & AI
router.get(
  "/summary",
  requireAuth,
  requireRole("doctor", "phc_staff", "hospital_staff", "district_admin"),
  getOperationalSummary
);

router.get(
  "/analytics",
  requireAuth,
  requireRole("doctor", "phc_staff", "hospital_staff", "district_admin"),
  getPresenceAnalytics
);

router.get(
  "/ai-summary",
  requireAuth,
  requireRole("phc_staff", "hospital_staff", "district_admin"),
  getAISummary
);

// Operational Review Flags
router.get(
  "/flags",
  requireAuth,
  requireRole("doctor", "phc_staff", "hospital_staff", "district_admin"),
  getOperationalFlags
);

router.post(
  "/flags/:id/review",
  requireAuth,
  requireRole("phc_staff", "district_admin"),
  reviewFlag
);

router.post(
  "/flags/:id/dismiss",
  requireAuth,
  requireRole("phc_staff", "district_admin"),
  dismissFlag
);

router.post(
  "/flags/:id/resolve",
  requireAuth,
  requireRole("phc_staff", "district_admin"),
  resolveFlag
);

router.post(
  "/flags/:id/notes",
  requireAuth,
  requireRole("phc_staff", "district_admin"),
  addReviewNote
);

// Evaluation Sweep
router.post(
  "/evaluate",
  requireAuth,
  requireRole("district_admin", "phc_staff"),
  evaluatePresenceSignals
);

// Legacy Phase 16 endpoints for compatibility
router.get(
  "/signals",
  requireAuth,
  requireRole("doctor", "phc_staff", "hospital_staff", "district_admin"),
  getPresenceSignals
);

router.post(
  "/signals/:id/review",
  requireAuth,
  requireRole("district_admin", "phc_staff"),
  reviewPresenceSignal
);

router.get(
  "/sessions",
  requireAuth,
  requireRole("doctor", "phc_staff", "hospital_staff", "district_admin"),
  getDutySessions
);

router.get(
  "/sessions/:id",
  requireAuth,
  requireRole("doctor", "phc_staff", "hospital_staff", "district_admin"),
  getDutySessionById
);

router.post(
  "/sessions/:id/check-out",
  requireAuth,
  requireRole("doctor", "phc_staff", "hospital_staff", "district_admin"),
  checkOutDoctorSession
);

module.exports = router;
