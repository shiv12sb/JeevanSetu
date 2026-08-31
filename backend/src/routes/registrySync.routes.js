const express = require("express");
const router = express.Router();
const registrySyncController = require("../controllers/registrySync.controller");
const { authenticate } = require("../middleware/auth.middleware");

// Public / Protected Routes for ABDM & State Council Sync
router.get("/status", registrySyncController.getSyncStatus);
router.get("/search-hpr", registrySyncController.searchHpr);
router.post("/trigger", authenticate, registrySyncController.triggerSync);

module.exports = router;
