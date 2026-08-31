const doctorsService = require("../services/doctors.service");
const { sendSuccess } = require("../utils/response");

const getDoctors = async (req, res, next) => {
  try {
    const doctors = await doctorsService.getDoctors(req.query);
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
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: { message: "Doctor not found in verified registry" },
      });
    }
    return sendSuccess(res, {
      statusCode: 200,
      data: doctor,
    });
  } catch (err) {
    next(err);
  }
};

const getDoctorProvenance = async (req, res, next) => {
  try {
    const provenance = await doctorsService.getDoctorProvenance(req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      data: provenance,
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
      data: result,
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
      data: result,
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

const getDoctorFacilities = async (req, res, next) => {
  try {
    const facilities = await doctorsService.getDoctorFacilities(req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      data: facilities,
    });
  } catch (err) {
    next(err);
  }
};

const updateDoctorFacilityStatus = async (req, res, next) => {
  try {
    const result = await doctorsService.updateDoctorFacilityStatus(
      req.user,
      req.params.id,
      req.params.facilityId,
      req.body
    );
    return sendSuccess(res, {
      statusCode: 200,
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const importDoctors = async (req, res, next) => {
  try {
    const result = await doctorsService.importDoctors(req.body.records || [], req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: `Successfully imported ${result.importedCount} doctors (${result.rejectedCount} rejected).`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getDoctorProvenance,
  checkInDoctor,
  checkOutDoctor,
  getDutySchedule,
  getDoctorFacilities,
  updateDoctorFacilityStatus,
  importDoctors,
};
