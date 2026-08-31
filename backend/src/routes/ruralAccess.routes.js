const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { submitAssistedRequest, getIvrFlow } = require("../controllers/ruralAccess.controller");

const router = express.Router();

// GET /api/rural-access/ivr-flow
router.get("/ivr-flow", getIvrFlow);

// POST /api/rural-access/requests
router.post(
  "/requests",
  requireAuth,
  submitAssistedRequest
);

module.exports = router;
