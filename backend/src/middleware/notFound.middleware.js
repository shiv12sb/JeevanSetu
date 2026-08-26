const { sendError } = require("../utils/response");

/**
 * 404 Not Found Middleware for unmatched API routes
 */
function notFoundHandler(req, res, next) {
  return sendError(res, {
    statusCode: 404,
    message: "API route not found",
  });
}

module.exports = notFoundHandler;
