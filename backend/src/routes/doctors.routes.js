const express = require("express");
const {
  getDoctors,
  getDoctorById,
  checkInDoctor,
  checkOutDoctor,
  getDutySchedule,
} = require("../controllers/doctors.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { validateUuidParam } = require("../validators/common.validator");

const router = express.Router();

// GET /api/doctors/schedule - Doctor duty schedule & roster
router.get("/schedule", getDutySchedule);

// GET /api/doctors - Verified doctors registry
router.get("/", getDoctors);

// GET /api/doctors/:id - Single doctor details
router.get("/:id", validateUuidParam("id"), getDoctorById);

// POST /api/doctors/:id/check-in - Record doctor check-in (Doctor, Staff, Admin)
router.post(
  "/:id/check-in",
  requireAuth,
  requireRole("doctor", "phc_staff", "hospital_staff", "district_admin"),
  validateUuidParam("id"),
  checkInDoctor
);

// POST /api/doctors/:id/check-out - Record doctor check-out (Doctor, Staff, Admin)
router.post(
  "/:id/check-out",
  requireAuth,
  requireRole("doctor", "phc_staff", "hospital_staff", "district_admin"),
  validateUuidParam("id"),
  checkOutDoctor
);

module.exports = router;
