const { sendSuccess } = require('../utils/response');

/**
 * Controller: Get authenticated user profile (/api/auth/me)
 */
const getMe = async (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Authenticated profile retrieved successfully',
    data: {
      user: req.user,
      role: req.role,
      authenticatedAt: new Date().toISOString(),
    },
  });
};

module.exports = {
  getMe,
};
