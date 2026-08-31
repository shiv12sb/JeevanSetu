const express = require("express");
const {
  getHospitals,
  getPhcById,
  getHospitalById,
  getHospitalDoctors,
} = require("../controllers/facilities.controller");
const { validateUuidParam } = require("../validators/common.validator");

const router = express.Router();

// GET /api/facilities/hospitals - List verified Maharashtra hospitals
router.get("/hospitals", getHospitals);

// GET /api/facilities/hospitals/:id/doctors - Doctors at this hospital
router.get("/hospitals/:id/doctors", validateUuidParam("id"), getHospitalDoctors);

// GET /api/facilities/hospitals/:id - Single Hospital details
router.get("/hospitals/:id", validateUuidParam("id"), getHospitalById);

// GET /api/facilities/phcs/:id - Single PHC details
router.get("/phcs/:id", validateUuidParam("id"), getPhcById);

module.exports = router;
