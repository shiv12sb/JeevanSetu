const facilitiesService = require("../services/facilities.service");
const { sendSuccess } = require("../utils/response");

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

module.exports = {
  getPhcById,
  getHospitalById,
};
