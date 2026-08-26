/**
 * Inventory & Supply Chain Controller
 */

const inventoryService = require("../services/inventory.service");
const medicineForecastService = require("../services/forecasting/medicineForecast.service");
const { sendSuccess, sendError } = require("../utils/response");

const getInventory = async (req, res, next) => {
  try {
    const { phc_id, low_stock_only, risk_level } = req.query;
    const pagination = req.pagination || { limit: 50, offset: 0 };
    const result = await inventoryService.getInventory(req.user, {
      phc_id,
      low_stock_only,
      risk_level,
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
      low_stock_count: result.low_stock_count,
    });
  } catch (err) {
    next(err);
  }
};

const getInventoryById = async (req, res, next) => {
  try {
    const item = await inventoryService.getInventoryById(req.user, req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

const addInventoryItem = async (req, res, next) => {
  try {
    const item = await inventoryService.addInventoryItem(req.user, req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Medicine inventory item saved successfully",
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

const updateInventoryItem = async (req, res, next) => {
  try {
    const updated = await inventoryService.updateInventoryItem(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Medicine inventory updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const restockInventoryItem = async (req, res, next) => {
  try {
    const item = await inventoryService.restockInventoryItem(req.user, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Medicine stock successfully restocked",
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

const recordMedicineUsage = async (req, res, next) => {
  try {
    const result = await inventoryService.recordMedicineUsage(req.user, req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const adjustInventoryStock = async (req, res, next) => {
  try {
    const item = await inventoryService.adjustInventoryStock(req.user, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Stock adjusted and logged for audit",
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

const getStockTransactions = async (req, res, next) => {
  try {
    const { phc_id, medicine_id, transaction_type } = req.query;
    const pagination = req.pagination || { limit: 50, offset: 0 };
    const result = await inventoryService.getStockTransactions(req.user, {
      phc_id,
      medicine_id,
      transaction_type,
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

const createReplenishmentRequest = async (req, res, next) => {
  try {
    const result = await inventoryService.createReplenishmentRequest(req.user, req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Replenishment request created successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getReplenishmentRequests = async (req, res, next) => {
  try {
    const { phc_id, status, priority } = req.query;
    const pagination = req.pagination || { limit: 50, offset: 0 };
    const result = await inventoryService.getReplenishmentRequests(req.user, {
      phc_id,
      status,
      priority,
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

const updateReplenishmentStatus = async (req, res, next) => {
  try {
    const result = await inventoryService.updateReplenishmentStatus(
      req.user,
      req.params.id,
      req.body
    );
    return sendSuccess(res, {
      statusCode: 200,
      message: `Replenishment request status updated to ${result.status}.`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const receiveReplenishmentStock = async (req, res, next) => {
  try {
    const result = await inventoryService.receiveReplenishmentStock(
      req.user,
      req.params.id,
      req.body
    );
    return sendSuccess(res, {
      statusCode: 200,
      message: "Replenishment stock received and inventory atomically updated.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getDistrictSupplyAnalytics = async (req, res, next) => {
  try {
    const result = await inventoryService.getDistrictSupplyAnalytics(req.user);
    return sendSuccess(res, {
      statusCode: 200,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getMedicineUsageHistory = async (req, res, next) => {
  try {
    const { phc_id, medicine_id } = req.query;
    const pagination = req.pagination || { limit: 50, offset: 0 };
    const result = await inventoryService.getMedicineUsageHistory(req.user, {
      phc_id,
      medicine_id,
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

const getMedicines = async (req, res, next) => {
  try {
    const { search, is_essential } = req.query;
    const medicines = await inventoryService.getMedicines({ search, is_essential });
    return sendSuccess(res, {
      statusCode: 200,
      data: medicines,
    });
  } catch (err) {
    next(err);
  }
};

const getForecasts = async (req, res, next) => {
  try {
    const { phc_id, risk_level, medicine_id } = req.query;

    if (req.user.role === "patient") {
      return sendError(res, {
        statusCode: 403,
        message: "Access forbidden: Patients may not access internal operational depletion forecasts.",
      });
    }

    const forecasts = await medicineForecastService.getForecasts(req.user, {
      phc_id,
      risk_level,
      medicine_id,
    });

    return sendSuccess(res, {
      statusCode: 200,
      data: forecasts.items,
      metadata: {
        facility_id: forecasts.facility_id,
        total: forecasts.total,
        calculated_at: forecasts.calculated_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getItemForecast = async (req, res, next) => {
  try {
    if (req.user.role === "patient") {
      return sendError(res, {
        statusCode: 403,
        message: "Access forbidden: Patients may not access internal operational depletion forecasts.",
      });
    }

    const inventoryItem = await inventoryService.getInventoryById(req.user, req.params.id);
    const forecast = await medicineForecastService.calculateItemForecast(
      inventoryItem.phc_id,
      inventoryItem.medicine_id,
      inventoryItem
    );

    return sendSuccess(res, {
      statusCode: 200,
      data: forecast,
    });
  } catch (err) {
    next(err);
  }
};

const adjustStock = async (req, res, next) => {
  try {
    if (req.user.role === "patient") {
      return sendError(res, {
        statusCode: 403,
        message: "Access forbidden: Patients cannot modify inventory.",
      });
    }

    const { id } = req.params;
    const result = await inventoryService.adjustStock(req.user, {
      medicine_id: id,
      phc_id: req.body.phc_id || req.user.assignedPhcId,
      ...req.body,
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: "Stock adjustment recorded successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const updateThreshold = async (req, res, next) => {
  try {
    if (req.user.role === "patient") {
      return sendError(res, {
        statusCode: 403,
        message: "Access forbidden: Patients cannot modify threshold.",
      });
    }

    const { id } = req.params;
    const result = await inventoryService.updateThreshold(req.user, {
      medicine_id: id,
      phc_id: req.body.phc_id || req.user.assignedPhcId,
      ...req.body,
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: "Inventory threshold updated successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getItemPrediction = async (req, res, next) => {
  try {
    if (req.user.role === "patient") {
      return sendError(res, {
        statusCode: 403,
        message: "Access forbidden: Patients may not access internal operational depletion forecasts.",
      });
    }

    const { id } = req.params;
    const phc_id = req.query.phc_id || req.user.assignedPhcId || "phc-1";
    const prediction = await inventoryService.getPrediction(req.user, { phc_id, medicine_id: id });

    return sendSuccess(res, {
      statusCode: 200,
      data: prediction,
    });
  } catch (err) {
    next(err);
  }
};

const getInventoryAlerts = async (req, res, next) => {
  try {
    if (req.user.role === "patient") {
      return sendError(res, {
        statusCode: 403,
        message: "Access forbidden: Patients may not access internal supply alerts.",
      });
    }

    const { phc_id, status, risk_level } = req.query;
    const pagination = req.pagination || { limit: 50, offset: 0 };
    const result = await inventoryService.inventoryPredictionService.getInventoryAlerts(req.user, {
      phcId: phc_id,
      status,
      riskLevel: risk_level,
      limit: pagination.limit,
      offset: pagination.offset,
    });

    return sendSuccess(res, {
      statusCode: 200,
      data: result.alerts,
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

const acknowledgeAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const result = await inventoryService.inventoryPredictionService.acknowledgeAlert(req.user, id, { note });

    return sendSuccess(res, {
      statusCode: 200,
      message: "Alert acknowledged successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note, resolution } = req.body;
    const result = await inventoryService.inventoryPredictionService.resolveAlert(req.user, id, { note, resolution });

    return sendSuccess(res, {
      statusCode: 200,
      message: "Alert resolved successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getInventory,
  getInventoryById,
  addInventoryItem,
  updateInventoryItem,
  restockInventoryItem,
  recordMedicineUsage,
  adjustInventoryStock,
  adjustStock,
  updateThreshold,
  getItemPrediction,
  getInventoryAlerts,
  acknowledgeAlert,
  resolveAlert,
  getStockTransactions,
  createReplenishmentRequest,
  getReplenishmentRequests,
  updateReplenishmentStatus,
  receiveReplenishmentStock,
  getDistrictSupplyAnalytics,
  getMedicineUsageHistory,
  getMedicines,
  getForecasts,
  getItemForecast,
};
