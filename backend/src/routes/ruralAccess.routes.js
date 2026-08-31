const express = require("express");
const router = express.Router();
const {
  getIvrFlow,
  requestOutboundVoiceCall,
  handleIvrDtmfAction,
  getAshaQueue,
  updateAshaQueueStatus,
  submitAssistedRequest,
} = require("../controllers/ruralAccess.controller");
const { optionalAuth, authenticate } = require("../middleware/auth.middleware");

// Public / Citizen assisted routes
router.get("/ivr-flow", getIvrFlow);
router.post("/outbound-voice-call", optionalAuth, requestOutboundVoiceCall);
router.post("/ivr-webhook", handleIvrDtmfAction);
router.post("/assisted-request", optionalAuth, submitAssistedRequest);

// ASHA Worker & Coordinator Queue Routes
router.get("/asha-queue", optionalAuth, getAshaQueue);
router.patch("/asha-queue/:id", optionalAuth, updateAshaQueueStatus);

module.exports = router;
