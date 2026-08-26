const express = require("express");
const { getProfile, updateProfile } = require("../controllers/profile.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { validateProfileUpdate } = require("../validators/profile.validator");

const router = express.Router();

// GET /api/profile - Fetch user's own profile
router.get("/", requireAuth, getProfile);

// PATCH /api/profile - Update user's permitted profile fields
router.patch("/", requireAuth, validateProfileUpdate, updateProfile);

module.exports = router;
