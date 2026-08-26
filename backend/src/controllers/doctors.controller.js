const doctorsService = require("../services/doctors.service");
const { sendSuccess } = require("../utils/response");

const getDoctors = async (req, res, next) => {
  try {
    const { phc_id, hospital_id, specialization, is_on_duty } = req.query;
    const doctors = await doctorsService.getDoctors({ phc_id, hospital_id, specialization, is_on_duty });
    return sendSuccess(res, {
      statusCode: 200,
      data: doctors,
    });
  } catch (err) {
    next(err);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorsService.getDoctorById(req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      data: doctor,
    });
  } catch (err) {
    next(err);
  }
};

const checkInDoctor = async (req, res, next) => {
  try {
    const result = await doctorsService.checkInDoctor(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: result.message,
      data: result.doctor,
    });
  } catch (err) {
    next(err);
  }
};

const checkOutDoctor = async (req, res, next) => {
  try {
    const result = await doctorsService.checkOutDoctor(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: result.message,
      data: result.doctor,
    });
  } catch (err) {
    next(err);
  }
};

const getDutySchedule = async (req, res, next) => {
  try {
    const { phc_id, hospital_id } = req.query;
    const schedule = await doctorsService.getDutySchedule({ phc_id, hospital_id });
    return sendSuccess(res, {
      statusCode: 200,
      data: schedule,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  checkInDoctor,
  checkOutDoctor,
  getDutySchedule,
};
