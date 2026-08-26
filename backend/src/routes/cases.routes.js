const express = require("express");
const {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  getCaseVitals,
  addCaseVitals,
} = require("../controllers/cases.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { validateUuidParam, validatePagination } = require("../validators/common.validator");
const {
  validateCaseCreate,
  validateCaseUpdate,
  validateVitalsCreate,
} = require("../validators/cases.validator");

const router = express.Router();

// GET /api/cases - List cases (Scoped by role)
router.get("/", requireAuth, validatePagination, getCases);

// POST /api/cases - Create new health case
router.post("/", requireAuth, validateCaseCreate, createCase);

// GET /api/cases/:id - Retrieve single case
router.get("/:id", requireAuth, validateUuidParam("id"), getCaseById);

// PATCH /api/cases/:id - Update case
router.patch("/:id", requireAuth, validateUuidParam("id"), validateCaseUpdate, updateCase);

// GET /api/cases/:id/vitals - Retrieve clinical vitals for case
router.get("/:id/vitals", requireAuth, validateUuidParam("id"), getCaseVitals);

// POST /api/cases/:id/vitals - Record clinical vitals (Medical staff only)
router.post(
  "/:id/vitals",
  requireAuth,
  requireRole("phc_staff", "doctor", "hospital_staff", "district_admin"),
  validateUuidParam("id"),
  validateVitalsCreate,
  addCaseVitals
);

module.exports = router;
