const aiService = require("../services/ai/ai.service");
const { sendSuccess } = require("../utils/response");

const handleChat = async (req, res, next) => {
  try {
    const { message, language = "en", conversationHistory = [] } = req.body;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;

    const response = await aiService.processChat({
      user: req.user,
      message,
      language,
      conversationHistory,
      ipAddress,
    });

    return sendSuccess(res, {
      statusCode: 200,
      data: response,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleChat,
};
