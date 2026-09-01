const aiService = require("../services/ai/ai.service");
const realtimeVoiceService = require("../services/ai/realtimeVoice.service");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * Handle Standard Grounded Conversational AI Chat
 */
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

/**
 * Handle OpenAI Realtime Ephemeral Session Creation (WebRTC)
 * Returns a temporary single-use client secret; permanent key is never sent.
 */
const handleCreateRealtimeSession = async (req, res, next) => {
  try {
    const { language = "mr", voice = "alloy" } = req.body || {};
    const sessionData = await realtimeVoiceService.createRealtimeSession({
      user: req.user,
      language,
      voice,
    });

    return sendSuccess(res, {
      statusCode: 200,
      data: sessionData,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle Realtime Tool / Function Execution
 */
const handleExecuteRealtimeTool = async (req, res, next) => {
  try {
    const { toolName, arguments: args } = req.body;
    if (!toolName) {
      return sendError(res, {
        statusCode: 400,
        message: "Tool name is required.",
      });
    }

    const result = await realtimeVoiceService.executeRealtimeTool(
      toolName,
      args || {},
      req.user
    );

    return sendSuccess(res, {
      statusCode: 200,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleChat,
  handleCreateRealtimeSession,
  handleExecuteRealtimeTool,
};
