const express = require("express");
const {
  getNearbyAmbulances,
  createAmbulanceRequest,
  cancelAmbulanceRequest,
  getTripLocation,
  getFareEstimate,
} = require("../controllers/ambulance.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

const router = express.Router();

// GET /api/ambulances/nearby - Discover nearby ambulances
router.get("/nearby", optionalAuth, getNearbyAmbulances);

// GET /api/ambulances/fare-estimate - Tariff calculation
router.get("/fare-estimate", optionalAuth, getFareEstimate);

// POST /api/ambulances/requests - Create ambulance dispatch request
router.post("/requests", optionalAuth, createAmbulanceRequest);

// POST /api/ambulances/requests/:id/cancel - Cancel dispatch request
router.post("/requests/:id/cancel", optionalAuth, cancelAmbulanceRequest);

// GET /api/ambulances/trips/:id/location - Live trip GPS tracking
router.get("/trips/:id/location", optionalAuth, getTripLocation);

module.exports = router;
