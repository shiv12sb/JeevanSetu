const adminService = require("../services/admin.service");
const { sendSuccess } = require("../utils/response");

const getMonitoringOverview = async (req, res, next) => {
  try {
    const { district } = req.query;
    const overview = await adminService.getAdminMonitoringOverview(req.user, { district });
    return sendSuccess(res, {
      statusCode: 200,
      data: overview,
    });
  } catch (err) {
    next(err);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { entity_type, entity_id, actor_id, action } = req.query;
    const pagination = req.pagination || { limit: 50, offset: 0 };
    const logs = await adminService.getSystemAuditLogs(req.user, {
      entity_type,
      entity_id,
      actor_id,
      action,
      limit: pagination.limit,
      offset: pagination.offset,
    });
    return sendSuccess(res, {
      statusCode: 200,
      data: logs.items,
      pagination: {
        total: logs.total,
        page: req.pagination?.page || 1,
        limit: pagination.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMonitoringOverview,
  getAuditLogs,
};
