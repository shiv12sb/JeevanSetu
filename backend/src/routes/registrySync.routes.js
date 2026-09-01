const express = require("express");
const router = express.Router();
const registrySyncController = require("../controllers/registrySync.controller");
const { requireAuth } = require("../middleware/auth.middleware");

// Public / Protected Routes for ABDM & State Council Sync
router.get("/status", registrySyncController.getSyncStatus);
router.get("/search-hpr", registrySyncController.searchHpr);
router.post("/trigger", requireAuth, registrySyncController.triggerSync);

module.exports = router;
