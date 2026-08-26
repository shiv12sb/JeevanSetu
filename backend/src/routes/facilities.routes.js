const express = require("express");
const { getPhcById, getHospitalById } = require("../controllers/facilities.controller");
const { validateUuidParam } = require("../validators/common.validator");

const router = express.Router();

// GET /api/phcs/:id - Single PHC details
router.get("/phcs/:id", validateUuidParam("id"), getPhcById);

// GET /api/hospitals/:id - Single Hospital details
router.get("/hospitals/:id", validateUuidParam("id"), getHospitalById);

module.exports = router;
