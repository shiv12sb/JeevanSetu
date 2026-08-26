const express = require('express');
const { getMe } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

const router = express.Router();

// GET /api/auth/me - Protected verification endpoint with rate limiting
router.get('/me', authLimiter, requireAuth, getMe);

module.exports = router;
