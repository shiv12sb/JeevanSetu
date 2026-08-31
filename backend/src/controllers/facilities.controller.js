const facilitiesService = require("../services/facilities.service");
const { sendSuccess } = require("../utils/response");

const getHospitals = async (req, res, next) => {
  try {
    const hospitals = await facilitiesService.getHospitals(req.query);
    return sendSuccess(res, {
      statusCode: 200,
      data: hospitals,
    });
  } catch (err) {
    next(err);
  }
};

const getPhcById = async (req, res, next) => {
  try {
    const phc = await facilitiesService.getPhcById(req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      data: phc,
    });
  } catch (err) {
    next(err);
  }
};

const getHospitalById = async (req, res, next) => {
  try {
    const hospital = await facilitiesService.getHospitalById(req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      data: hospital,
    });
  } catch (err) {
    next(err);
  }
};

const getHospitalDoctors = async (req, res, next) => {
  try {
    const doctors = await facilitiesService.getHospitalDoctors(req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      data: doctors,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHospitals,
  getPhcById,
  getHospitalById,
  getHospitalDoctors,
};
