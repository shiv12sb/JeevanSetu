const notificationsService = require("../services/notifications.service");
const { sendSuccess } = require("../utils/response");

const getNotifications = async (req, res, next) => {
  try {
    const unread_only = req.query.unread_only === "true";
    const notifications = await notificationsService.getNotifications(req.user, { unread_only });
    return sendSuccess(res, {
      statusCode: 200,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    const updated = await notificationsService.markRead(req.user, req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Notification marked as read",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await notificationsService.markAllRead(req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "All notifications marked as read",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
};
