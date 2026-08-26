const { sendError } = require("../utils/response");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate UUID param helper
 * @param {string} paramName 
 */
const validateUuidParam = (paramName = "id") => {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!value || !UUID_REGEX.test(value)) {
      return sendError(res, {
        statusCode: 400,
        message: `Invalid identifier format for '${paramName}'. Must be a valid UUID.`,
      });
    }
    next();
  };
};

/**
 * Sanitize and validate pagination query parameters
 */
const validatePagination = (req, res, next) => {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 20;

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit,
  };

  next();
};

module.exports = {
  UUID_REGEX,
  validateUuidParam,
  validatePagination,
};
