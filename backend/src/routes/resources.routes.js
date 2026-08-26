const express = require("express");
const {
  getDirectory,
  getHospitals,
  getPhcs,
  getNgos,
  getSchemes,
} = require("../controllers/resources.controller");

const router = express.Router();

// GET /api/resources - Aggregated verified directory
router.get("/", getDirectory);

// GET /api/resources/hospitals - Verified hospitals directory
router.get("/hospitals", getHospitals);

// GET /api/resources/phcs - Verified PHCs directory
router.get("/phcs", getPhcs);

// GET /api/resources/ngos - Verified NGOs directory
router.get("/ngos", getNgos);

// GET /api/resources/schemes - Active government health schemes
router.get("/schemes", getSchemes);

module.exports = router;
