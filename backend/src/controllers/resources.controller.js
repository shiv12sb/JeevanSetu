const resourcesService = require("../services/resources.service");
const { sendSuccess } = require("../utils/response");

const getDirectory = async (req, res, next) => {
  try {
    const { district, search } = req.query;
    const directory = await resourcesService.getDirectory({ district, search });
    return sendSuccess(res, {
      statusCode: 200,
      data: directory,
    });
  } catch (err) {
    next(err);
  }
};

const getHospitals = async (req, res, next) => {
  try {
    const { district, search } = req.query;
    const hospitals = await resourcesService.getHospitals({ district, search });
    return sendSuccess(res, {
      statusCode: 200,
      data: hospitals,
    });
  } catch (err) {
    next(err);
  }
};

const getPhcs = async (req, res, next) => {
  try {
    const { district, search } = req.query;
    const phcs = await resourcesService.getPhcs({ district, search });
    return sendSuccess(res, {
      statusCode: 200,
      data: phcs,
    });
  } catch (err) {
    next(err);
  }
};

const getNgos = async (req, res, next) => {
  try {
    const { district } = req.query;
    const ngos = await resourcesService.getNgos({ district });
    return sendSuccess(res, {
      statusCode: 200,
      data: ngos,
    });
  } catch (err) {
    next(err);
  }
};

const getSchemes = async (req, res, next) => {
  try {
    const schemes = await resourcesService.getSchemes();
    return sendSuccess(res, {
      statusCode: 200,
      data: schemes,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDirectory,
  getHospitals,
  getPhcs,
  getNgos,
  getSchemes,
};
