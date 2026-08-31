const { sendSuccess } = require("../utils/response");
const ruralAccessService = require("../services/ruralAccess.service");

const getIvrFlow = async (req, res, next) => {
  try {
    const { lang } = req.query;
    const ivrFlow = await ruralAccessService.getIvrFlow(lang || "en");
    return sendSuccess(res, {
      statusCode: 200,
      data: ivrFlow,
    });
  } catch (err) {
    next(err);
  }
};

const submitAssistedRequest = async (req, res, next) => {
  try {
    const request = await ruralAccessService.submitAssistedRequest(req.user, req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "ASHA assisted request logged successfully",
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getIvrFlow,
  submitAssistedRequest,
};
