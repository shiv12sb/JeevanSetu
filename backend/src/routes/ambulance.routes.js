const express = require("express");
const {
  getNearbyAmbulances,
  getAmbulanceDetails,
  createAmbulanceRequest,
  cancelAmbulanceRequest,
  getRequestStatus,
  getTripCrew,
  getTripLocation,
  getFareEstimate,
  completeTrip,
  streamTripLocation,
} = require("../controllers/ambulance.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

const router = express.Router();

// GET /api/ambulances/nearby - Discover nearby ambulances
router.get("/nearby", optionalAuth, getNearbyAmbulances);

// GET /api/ambulances/details/:id - Retrieve specific ambulance capability
router.get("/details/:id", optionalAuth, getAmbulanceDetails);

// GET /api/ambulances/fare-estimate - Tariff calculation
router.get("/fare-estimate", optionalAuth, getFareEstimate);

// POST /api/ambulances/requests - Create ambulance dispatch request
router.post("/requests", optionalAuth, createAmbulanceRequest);

// GET /api/ambulances/requests/:id - Check request / booking status
router.get("/requests/:id", optionalAuth, getRequestStatus);

// POST /api/ambulances/requests/:id/cancel - Cancel dispatch request
router.post("/requests/:id/cancel", optionalAuth, cancelAmbulanceRequest);

// GET /api/ambulances/trips/:id/crew - Retrieve assigned crew details
router.get("/trips/:id/crew", optionalAuth, getTripCrew);

// GET /api/ambulances/trips/:id/location - Live trip GPS tracking
router.get("/trips/:id/location", optionalAuth, getTripLocation);

// GET /api/ambulances/trips/:id/stream - SSE real-time GPS stream
router.get("/trips/:id/stream", optionalAuth, streamTripLocation);

// POST /api/ambulances/trips/:id/complete - Complete trip
router.post("/trips/:id/complete", optionalAuth, completeTrip);

module.exports = router;
