const { sendSuccess } = require("../utils/response");
const ruralAccessService = require("../services/ruralAccess.service");

const getIvrFlow = async (req, res, next) => {
  try {
    const { lang } = req.query;
    const ivrFlow = await ruralAccessService.getIvrFlow(lang || "mr");
    return sendSuccess(res, {
      statusCode: 200,
      data: ivrFlow,
    });
  } catch (err) {
    next(err);
  }
};

const requestOutboundVoiceCall = async (req, res, next) => {
  try {
    const result = await ruralAccessService.requestOutboundVoiceCall(req.user, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: result.message,
      data: result.session,
    });
  } catch (err) {
    next(err);
  }
};

const handleIvrDtmfAction = async (req, res, next) => {
  try {
    const result = await ruralAccessService.handleIvrDtmfAction(req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "IVR Key action processed successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getAshaQueue = async (req, res, next) => {
  try {
    const queue = await ruralAccessService.getAshaIncomingQueue(req.query);
    return sendSuccess(res, {
      statusCode: 200,
      data: queue,
    });
  } catch (err) {
    next(err);
  }
};

const updateAshaQueueStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ruralAccessService.updateAshaQueueStatus(id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: result.message,
      data: result.ticket,
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
  requestOutboundVoiceCall,
  handleIvrDtmfAction,
  getAshaQueue,
  updateAshaQueueStatus,
  submitAssistedRequest,
};
