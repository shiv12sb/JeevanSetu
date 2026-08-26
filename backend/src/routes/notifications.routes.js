const express = require("express");
const { getNotifications, markRead, markAllRead } = require("../controllers/notifications.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { validateUuidParam, validatePagination } = require("../validators/common.validator");

const router = express.Router();

// GET /api/notifications - User's own notifications
router.get("/", requireAuth, validatePagination, getNotifications);

// POST /api/notifications/read-all - Mark all notifications as read
router.post("/read-all", requireAuth, markAllRead);

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch("/:id/read", requireAuth, validateUuidParam("id"), markRead);

module.exports = router;

