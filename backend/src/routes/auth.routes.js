const express = require('express');
const { getMe, googleAuth } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

const router = express.Router();

// GET /api/auth/me - Protected verification endpoint with rate limiting
router.get('/me', authLimiter, requireAuth, getMe);

// POST /api/auth/google - Verify Google OAuth identity token and issue application JWT
router.post('/google', authLimiter, googleAuth);

module.exports = router;
