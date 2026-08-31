const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { getCampaigns, createCampaign } = require("../controllers/campaigns.controller");

const router = express.Router();

// GET /api/community-health/campaigns
router.get("/campaigns", getCampaigns);

// POST /api/community-health/campaigns
router.post(
  "/campaigns",
  requireAuth,
  requireRole("district_admin"),
  createCampaign
);

module.exports = router;
