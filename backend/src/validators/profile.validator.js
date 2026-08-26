const { sendError } = require("../utils/response");

const FORBIDDEN_PROFILE_FIELDS = [
  "role",
  "user_id",
  "assigned_phc_id",
  "created_at",
  "updated_at",
  "id",
];

/**
 * Validate profile update request
 * Rejects attempts to modify system/privileged fields
 */
const validateProfileUpdate = (req, res, next) => {
  const body = req.body;
  if (!body || typeof body !== "object") {
    return sendError(res, {
      statusCode: 400,
      message: "Invalid payload: Request body must be a JSON object.",
    });
  }

  const forbiddenKeys = Object.keys(body).filter((key) =>
    FORBIDDEN_PROFILE_FIELDS.includes(key)
  );

  if (forbiddenKeys.length > 0) {
    return sendError(res, {
      statusCode: 403,
      message: `Modification of restricted fields is not permitted: [${forbiddenKeys.join(", ")}]`,
    });
  }

  next();
};

module.exports = {
  validateProfileUpdate,
};
