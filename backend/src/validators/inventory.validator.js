const { sendError } = require("../utils/response");
const { UUID_REGEX } = require("./common.validator");

const isValidId = (id) => {
  return UUID_REGEX.test(id) || (typeof id === "string" && (id.startsWith("phc-") || id.startsWith("med-") || id.startsWith("rep-") || id.startsWith("inv-")));
};

/**
 * Validate Inventory Add / Upsert
 */
const validateInventoryCreate = (req, res, next) => {
  const { phc_id, medicine_id, current_quantity, minimum_threshold } = req.body;

  if (!phc_id || !isValidId(phc_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'phc_id' is required and must be a valid ID.",
    });
  }

  if (!medicine_id || !isValidId(medicine_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'medicine_id' is required and must be a valid ID.",
    });
  }

  if (current_quantity !== undefined && (isNaN(current_quantity) || parseInt(current_quantity, 10) < 0)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'current_quantity' must be a non-negative integer.",
    });
  }

  if (minimum_threshold !== undefined && (isNaN(minimum_threshold) || parseInt(minimum_threshold, 10) < 0)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'minimum_threshold' must be a non-negative integer.",
    });
  }

  next();
};

/**
 * Validate Inventory Update
 */
const validateInventoryUpdate = (req, res, next) => {
  const { current_quantity, minimum_threshold } = req.body;

  if (current_quantity !== undefined && (isNaN(current_quantity) || parseInt(current_quantity, 10) < 0)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'current_quantity' must be a non-negative integer.",
    });
  }

  if (minimum_threshold !== undefined && (isNaN(minimum_threshold) || parseInt(minimum_threshold, 10) < 0)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'minimum_threshold' must be a non-negative integer.",
    });
  }

  next();
};

/**
 * Validate Medicine Usage Recording (Dispensation)
 */
const validateInventoryUsage = (req, res, next) => {
  const { phc_id, medicine_id, quantity_consumed, usage_context } = req.body;

  if (!phc_id || !isValidId(phc_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'phc_id' is required and must be a valid ID.",
    });
  }

  if (!medicine_id || !isValidId(medicine_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'medicine_id' is required and must be a valid ID.",
    });
  }

  if (quantity_consumed === undefined || isNaN(quantity_consumed) || parseInt(quantity_consumed, 10) <= 0) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'quantity_consumed' must be a positive integer greater than 0.",
    });
  }

  next();
};

/**
 * Validate Medicine Restock
 */
const validateInventoryRestock = (req, res, next) => {
  const { phc_id, medicine_id, quantity_added, batch_number, expiry_date } = req.body;

  if (!phc_id || !isValidId(phc_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'phc_id' is required and must be a valid ID.",
    });
  }

  if (!medicine_id || !isValidId(medicine_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'medicine_id' is required and must be a valid ID.",
    });
  }

  if (!quantity_added || isNaN(quantity_added) || parseInt(quantity_added, 10) <= 0) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'quantity_added' must be a positive integer greater than 0.",
    });
  }

  next();
};

/**
 * Validate Inventory Adjustment
 */
const validateInventoryAdjust = (req, res, next) => {
  const { phc_id, medicine_id, adjustment_delta, reason } = req.body;

  if (!phc_id || !isValidId(phc_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'phc_id' is required and must be a valid ID.",
    });
  }

  if (!medicine_id || !isValidId(medicine_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'medicine_id' is required and must be a valid ID.",
    });
  }

  if (adjustment_delta === undefined || isNaN(adjustment_delta) || parseInt(adjustment_delta, 10) === 0) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'adjustment_delta' must be a non-zero integer.",
    });
  }

  if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'reason' is required for audit tracking of stock adjustments.",
    });
  }

  next();
};

/**
 * Validate Replenishment Request Creation
 */
const validateReplenishmentCreate = (req, res, next) => {
  const { medicine_id, requested_quantity, priority } = req.body;

  if (!medicine_id || !isValidId(medicine_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'medicine_id' is required.",
    });
  }

  if (!requested_quantity || isNaN(requested_quantity) || parseInt(requested_quantity, 10) <= 0) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'requested_quantity' must be a positive integer greater than 0.",
    });
  }

  if (priority && !["routine", "urgent", "emergency"].includes(priority.toLowerCase())) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'priority' must be one of ['routine', 'urgent', 'emergency'].",
    });
  }

  next();
};

/**
 * Validate Replenishment Status Update
 */
const validateReplenishmentStatusUpdate = (req, res, next) => {
  const { status, approved_quantity } = req.body;
  const ALLOWED = ["REQUESTED", "APPROVED", "REJECTED", "DISPATCHED", "RECEIVED", "CANCELLED"];

  if (!status || !ALLOWED.includes(status.toUpperCase())) {
    return sendError(res, {
      statusCode: 400,
      message: `Validation error: 'status' must be one of [${ALLOWED.join(", ")}].`,
    });
  }

  if (approved_quantity !== undefined && (isNaN(approved_quantity) || parseInt(approved_quantity, 10) < 0)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'approved_quantity' must be a non-negative integer.",
    });
  }

  next();
};

/**
 * Validate Replenishment Stock Receipt
 */
const validateReplenishmentReceipt = (req, res, next) => {
  const { received_quantity } = req.body;

  if (received_quantity !== undefined && (isNaN(received_quantity) || parseInt(received_quantity, 10) <= 0)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'received_quantity' must be a positive integer greater than 0.",
    });
  }

  next();
};

module.exports = {
  validateInventoryCreate,
  validateInventoryUpdate,
  validateInventoryUsage,
  validateInventoryRestock,
  validateInventoryAdjust,
  validateReplenishmentCreate,
  validateReplenishmentStatusUpdate,
  validateReplenishmentReceipt,
};
