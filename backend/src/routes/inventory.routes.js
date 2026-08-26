/**
 * Inventory & Supply Chain Routes
 */

const express = require("express");
const {
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
} = require("../controllers/inventory.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { validateUuidParam, validatePagination } = require("../validators/common.validator");
const {
  validateInventoryCreate,
  validateInventoryUpdate,
  validateInventoryUsage,
  validateInventoryRestock,
  validateInventoryAdjust,
  validateReplenishmentCreate,
  validateReplenishmentStatusUpdate,
  validateReplenishmentReceipt,
} = require("../validators/inventory.validator");

const router = express.Router();

// 1. Master Medicines Catalogue
router.get("/master/medicines", getMedicines);

// 2. District-wide Supply Chain Analytics
router.get(
  "/supply-analytics",
  requireAuth,
  requireRole("district_admin", "phc_staff", "hospital_staff", "doctor"),
  getDistrictSupplyAnalytics
);

router.get(
  "/analytics",
  requireAuth,
  requireRole("district_admin", "phc_staff", "hospital_staff", "doctor"),
  getDistrictSupplyAnalytics
);

// 3. Proactive Inventory Alerts (Phase 20)
router.get(
  "/alerts",
  requireAuth,
  requireRole("phc_staff", "doctor", "hospital_staff", "district_admin"),
  validatePagination,
  getInventoryAlerts
);

router.post(
  "/alerts/:id/acknowledge",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  acknowledgeAlert
);

router.post(
  "/alerts/:id/resolve",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  resolveAlert
);

// 4. Depletion Forecasting & Prediction
router.get(
  "/forecast",
  requireAuth,
  requireRole("phc_staff", "doctor", "hospital_staff", "district_admin"),
  getForecasts
);

// 5. Stock Transactions Ledger
router.get(
  "/transactions",
  requireAuth,
  requireRole("phc_staff", "doctor", "hospital_staff", "district_admin"),
  validatePagination,
  getStockTransactions
);

// 6. Replenishment Requests Workflow
router.get(
  "/replenishments",
  requireAuth,
  requireRole("phc_staff", "doctor", "hospital_staff", "district_admin"),
  validatePagination,
  getReplenishmentRequests
);

router.post(
  "/replenishments",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  validateReplenishmentCreate,
  createReplenishmentRequest
);

router.patch(
  "/replenishments/:id/status",
  requireAuth,
  requireRole("district_admin", "phc_staff"),
  validateReplenishmentStatusUpdate,
  updateReplenishmentStatus
);

router.post(
  "/replenishments/:id/receive",
  requireAuth,
  requireRole("phc_staff", "district_admin"),
  validateReplenishmentReceipt,
  receiveReplenishmentStock
);

// 7. Usage & Restock Operations
router.get("/usage", requireAuth, validatePagination, getMedicineUsageHistory);

router.post(
  "/usage",
  requireAuth,
  requireRole("phc_staff", "doctor", "district_admin"),
  validateInventoryUsage,
  recordMedicineUsage
);

router.post(
  "/restock",
  requireAuth,
  requireRole("phc_staff", "district_admin"),
  validateInventoryRestock,
  restockInventoryItem
);

router.post(
  "/adjust",
  requireAuth,
  requireRole("phc_staff", "district_admin"),
  validateInventoryAdjust,
  adjustInventoryStock
);

// 8. Phase 20 Item Operations
router.get(
  "/:id/prediction",
  requireAuth,
  requireRole("phc_staff", "doctor", "hospital_staff", "district_admin"),
  getItemPrediction
);

router.post(
  "/:id/adjust",
  requireAuth,
  requireRole("phc_staff", "district_admin"),
  adjustStock
);

router.post(
  "/:id/threshold",
  requireAuth,
  requireRole("phc_staff", "district_admin"),
  updateThreshold
);

// 9. Standard Inventory CRUD
router.get("/", requireAuth, validatePagination, getInventory);

router.post(
  "/",
  requireAuth,
  requireRole("phc_staff", "district_admin"),
  validateInventoryCreate,
  addInventoryItem
);

router.get(
  "/:id/forecast",
  requireAuth,
  requireRole("phc_staff", "doctor", "hospital_staff", "district_admin"),
  getItemForecast
);

router.get("/:id", requireAuth, getInventoryById);

router.patch(
  "/:id",
  requireAuth,
  requireRole("phc_staff", "district_admin"),
  validateInventoryUpdate,
  updateInventoryItem
);

module.exports = router;
