/**
 * Doctor Attendance & Integrity Routes
 * JeevanSetu Phase 21
 */

const express = require("express");
const {
  getAttendanceRecords,
  getAttendanceById,
  recordCheckIn,
  recordCheckOut,
  submitExplanation,
  reviewAttendance,
  recordRetroactiveAttendance,
  getAttendanceAnalytics,
} = require("../controllers/attendance.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { validatePagination } = require("../validators/common.validator");

const router = express.Router();

// 1. Attendance Analytics
router.get(
  "/analytics",
  requireAuth,
  requireRole("district_admin", "phc_staff", "doctor"),
  getAttendanceAnalytics
);

// 2. Doctor Check-In
router.post(
  "/check-in",
  requireAuth,
  requireRole("doctor", "phc_staff", "district_admin"),
  recordCheckIn
);

// 3. Doctor Check-Out
router.post(
  "/check-out",
  requireAuth,
  requireRole("doctor", "phc_staff", "district_admin"),
  recordCheckOut
);

// 4. Retroactive Attendance Entry
router.post(
  "/retroactive",
  requireAuth,
  requireRole("phc_staff", "district_admin"),
  recordRetroactiveAttendance
);

// 5. Submit Explanation
router.post(
  "/:id/explanation",
  requireAuth,
  requireRole("doctor", "phc_staff", "district_admin"),
  submitExplanation
);

// 6. Administrative Review
router.post(
  "/:id/review",
  requireAuth,
  requireRole("phc_staff", "district_admin"),
  reviewAttendance
);

// 7. Get Attendance Detail
router.get(
  "/:id",
  requireAuth,
  requireRole("doctor", "phc_staff", "district_admin"),
  getAttendanceById
);

// 8. List Attendance Records
router.get(
  "/",
  requireAuth,
  requireRole("doctor", "phc_staff", "district_admin"),
  validatePagination,
  getAttendanceRecords
);

module.exports = router;
