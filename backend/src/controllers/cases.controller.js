const casesService = require("../services/cases.service");
const { sendSuccess } = require("../utils/response");

const getCases = async (req, res, next) => {
  try {
    const { status, category, urgency } = req.query;
    const pagination = req.pagination || { limit: 20, offset: 0 };
    const result = await casesService.getCases(req.user, {
      status,
      category,
      urgency,
      limit: pagination.limit,
      offset: pagination.offset,
    });
    return sendSuccess(res, {
      statusCode: 200,
      data: result.items,
      pagination: {
        total: result.total,
        page: req.pagination?.page || 1,
        limit: pagination.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getCaseById = async (req, res, next) => {
  try {
    const caseData = await casesService.getCaseById(req.user, req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      data: caseData,
    });
  } catch (err) {
    next(err);
  }
};

const createCase = async (req, res, next) => {
  try {
    const newCase = await casesService.createCase(req.user, req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Health case created successfully",
      data: newCase,
    });
  } catch (err) {
    next(err);
  }
};

const updateCase = async (req, res, next) => {
  try {
    const updated = await casesService.updateCase(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Health case updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const getCaseVitals = async (req, res, next) => {
  try {
    const vitals = await casesService.getCaseVitals(req.user, req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      data: vitals,
    });
  } catch (err) {
    next(err);
  }
};

const addCaseVitals = async (req, res, next) => {
  try {
    const vitals = await casesService.addCaseVitals(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Clinical vitals recorded successfully",
      data: vitals,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  getCaseVitals,
  addCaseVitals,
};
