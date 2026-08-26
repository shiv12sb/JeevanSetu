const profileService = require("../services/profile.service");
const { sendSuccess, sendError } = require("../utils/response");

const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.id);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Profile retrieved successfully",
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updated = await profileService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
