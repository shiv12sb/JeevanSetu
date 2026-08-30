const ambulanceService = require("../services/ambulance.service");
const { sendSuccess } = require("../utils/response");

const getNearbyAmbulances = async (req, res, next) => {
  try {
    const { lat, lng, radiusKm, type, district } = req.query;
    const result = await ambulanceService.searchNearbyAmbulances({
      lat,
      lng,
      radiusKm,
      type,
      district,
    });
    return sendSuccess(res, {
      statusCode: 200,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const createAmbulanceRequest = async (req, res, next) => {
  try {
    const patientId = req.user?.id || null;
    const result = await ambulanceService.createRequest(patientId, req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Ambulance request created successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const cancelAmbulanceRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;
    const result = await ambulanceService.cancelRequest(id, reason, userId);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Ambulance request cancelled",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getTripLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ambulanceService.getTripLocation(id);
    return sendSuccess(res, {
      statusCode: 200,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getFareEstimate = async (req, res, next) => {
  try {
    const result = await ambulanceService.getFareEstimate(req.query);
    return sendSuccess(res, {
      statusCode: 200,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNearbyAmbulances,
  createAmbulanceRequest,
  cancelAmbulanceRequest,
  getTripLocation,
  getFareEstimate,
};
