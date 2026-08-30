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

const getAmbulanceDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ambulanceService.getAmbulanceDetails(id);
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

const getRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ambulanceService.getRequestStatus(id);
    return sendSuccess(res, {
      statusCode: 200,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getTripCrew = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ambulanceService.getTripCrew(id);
    return sendSuccess(res, {
      statusCode: 200,
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

const completeTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ambulanceService.completeTrip(id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Trip completed",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Server-Sent Events (SSE) stream endpoint for live telematics
 */
const streamTripLocation = async (req, res, next) => {
  try {
    const { id } = req.params;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const sendPing = async () => {
      const loc = await ambulanceService.getTripLocation(id);
      res.write(`data: ${JSON.stringify(loc)}\n\n`);
    };

    await sendPing();
    const interval = setInterval(sendPing, 4000);

    req.on("close", () => {
      clearInterval(interval);
      res.end();
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNearbyAmbulances,
  getAmbulanceDetails,
  createAmbulanceRequest,
  cancelAmbulanceRequest,
  getRequestStatus,
  getTripCrew,
  getTripLocation,
  getFareEstimate,
  completeTrip,
  streamTripLocation,
};
