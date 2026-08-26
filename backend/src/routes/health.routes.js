const { Router } = require("express");
const { getHealth, getLiveness, getReadiness } = require("../controllers/health.controller");

const router = Router();

// GET /api/health - Unified Health Check
router.get("/", getHealth);

// GET /api/health/live - Liveness Probe
router.get("/live", getLiveness);

// GET /api/health/ready - Readiness Probe (Safe dependency inspection)
router.get("/ready", getReadiness);

module.exports = router;
