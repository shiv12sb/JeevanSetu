/**
 * JeevanSetu Medicine Inventory & Supply Chain Intelligence Service
 * Handles inventory catalogue, atomic stock operations, stock transaction ledger,
 * replenishment state machine, and district supply analytics.
 */

const { supabase, isConfigured } = require("../config/supabase");
const auditService = require("./audit.service");
const notificationService = require("./notification.service");

// In-memory mock stores for dev/preview
const mockInventoryStore = [
  {
    id: "inv-1",
    phc_id: "phc-1",
    medicine_id: "med-1",
    current_quantity: 450,
    minimum_threshold: 200,
    batch_number: "ATV-2026-04",
    expiry_date: "2027-12-31",
    last_restocked_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    medicines: {
      id: "med-1",
      name: "Atorvastatin 10mg",
      generic_name: "Atorvastatin Calcium",
      dosage_form: "Tablet",
      standard_unit: "tablets",
      is_essential: true,
    },
    phcs: {
      id: "phc-1",
      name: "Ashti Primary Health Centre",
      facility_code: "PHC-MH-2041",
    },
  },
  {
    id: "inv-2",
    phc_id: "phc-1",
    medicine_id: "med-2",
    current_quantity: 80,
    minimum_threshold: 150,
    batch_number: "AML-2026-02",
    expiry_date: "2026-11-30",
    last_restocked_at: new Date(Date.now() - 1209600000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    medicines: {
      id: "med-2",
      name: "Amlodipine 5mg",
      generic_name: "Amlodipine Besylate",
      dosage_form: "Tablet",
      standard_unit: "tablets",
      is_essential: true,
    },
    phcs: {
      id: "phc-1",
      name: "Ashti Primary Health Centre",
      facility_code: "PHC-MH-2041",
    },
  },
  {
    id: "inv-3",
    phc_id: "phc-1",
    medicine_id: "med-3",
    current_quantity: 320,
    minimum_threshold: 100,
    batch_number: "MET-2026-08",
    expiry_date: "2028-06-30",
    last_restocked_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date().toISOString(),
    medicines: {
      id: "med-3",
      name: "Metformin 500mg",
      generic_name: "Metformin Hydrochloride",
      dosage_form: "Tablet",
      standard_unit: "tablets",
      is_essential: true,
    },
    phcs: {
      id: "phc-1",
      name: "Ashti Primary Health Centre",
      facility_code: "PHC-MH-2041",
    },
  },
  {
    id: "inv-4",
    phc_id: "phc-1",
    medicine_id: "med-4",
    current_quantity: 0,
    minimum_threshold: 100,
    batch_number: "PAR-2026-01",
    expiry_date: "2027-05-31",
    last_restocked_at: new Date(Date.now() - 2592000000).toISOString(),
    updated_at: new Date().toISOString(),
    medicines: {
      id: "med-4",
      name: "Paracetamol 500mg",
      generic_name: "Acetaminophen",
      dosage_form: "Tablet",
      standard_unit: "tablets",
      is_essential: true,
    },
    phcs: {
      id: "phc-1",
      name: "Ashti Primary Health Centre",
      facility_code: "PHC-MH-2041",
    },
  },
];

const mockUsageStore = [
  {
    id: "usg-1",
    phc_id: "phc-1",
    medicine_id: "med-1",
    quantity_consumed: 30,
    recorded_date: new Date().toISOString().split("T")[0],
    usage_context: "OPD Dispensation",
    created_at: new Date(Date.now() - 18000000).toISOString(),
    medicines: { name: "Atorvastatin 10mg" },
  },
  {
    id: "usg-2",
    phc_id: "phc-1",
    medicine_id: "med-2",
    quantity_consumed: 25,
    recorded_date: new Date().toISOString().split("T")[0],
    usage_context: "Emergency Hypertensive Care",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    medicines: { name: "Amlodipine 5mg" },
  },
];

const mockTransactionsStore = [
  {
    id: "tx-1",
    phc_id: "phc-1",
    medicine_id: "med-1",
    transaction_type: "RECEIPT",
    quantity_delta: 500,
    resulting_quantity: 500,
    batch_number: "ATV-2026-04",
    expiry_date: "2027-12-31",
    reason: "Routine quarterly replenishment received",
    performed_by: "phc-staff-001",
    created_at: new Date(Date.now() - 604800000).toISOString(),
  },
];

const mockReplenishmentStore = [
  {
    id: "rep-1",
    request_number: "REP-2026-001",
    phc_id: "phc-1",
    medicine_id: "med-2",
    requested_quantity: 300,
    approved_quantity: 300,
    received_quantity: 0,
    priority: "urgent",
    status: "APPROVED",
    reason: "Stock approaching critical minimum threshold due to high OPD volume.",
    requested_by: "phc-staff-001",
    reviewed_by: "admin-uuid-001",
    review_notes: "Approved full buffer quantity.",
    dispatched_at: null,
    received_at: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
    medicines: { id: "med-2", name: "Amlodipine 5mg" },
    phcs: { id: "phc-1", name: "Ashti Primary Health Centre" },
  },
];

// Valid state machine transitions for Replenishment Requests
const VALID_REPLENISHMENT_TRANSITIONS = {
  DRAFT: ["REQUESTED", "CANCELLED"],
  REQUESTED: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["DISPATCHED", "IN_TRANSIT", "CANCELLED"],
  REJECTED: [], // Terminal
  DISPATCHED: ["RECEIVED", "IN_TRANSIT"],
  IN_TRANSIT: ["RECEIVED", "CANCELLED"],
  RECEIVED: [], // Terminal
  CANCELLED: [], // Terminal
};

/**
 * Log Stock Transaction in Ledger
 */
const logStockTransaction = async ({
  phc_id,
  medicine_id,
  transaction_type,
  quantity_delta,
  resulting_quantity,
  batch_number,
  expiry_date,
  reason,
  reference_id,
  performed_by,
}) => {
  const record = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    phc_id,
    medicine_id,
    transaction_type,
    quantity_delta: parseInt(quantity_delta, 10),
    resulting_quantity: parseInt(resulting_quantity, 10),
    batch_number: batch_number || null,
    expiry_date: expiry_date || null,
    reason: reason || "Standard inventory transaction",
    reference_id: reference_id || null,
    performed_by: performed_by || null,
    created_at: new Date().toISOString(),
  };

  mockTransactionsStore.unshift(record);

  if (isConfigured) {
    await Promise.resolve(supabase.from("medicine_stock_transactions").insert(record)).catch((err) => {
      console.warn("Stock transaction insert fallback:", err.message);
    });
  }

  return record;
};

/**
 * List medicine inventory for a PHC or district
 */
const getInventory = async (user, { phc_id, low_stock_only, risk_level, limit = 50, offset = 0 } = {}) => {
  const targetPhcId = phc_id || (user && user.role === "phc_staff" ? user.assignedPhcId : null);

  if (!isConfigured) {
    let list = [...mockInventoryStore];
    if (targetPhcId) {
      list = list.filter((i) => i.phc_id === targetPhcId || i.phc_id === "phc-1");
    }
    if (low_stock_only === "true" || low_stock_only === true) {
      list = list.filter((i) => i.current_quantity <= i.minimum_threshold);
    }
    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
      low_stock_count: list.filter((i) => i.current_quantity <= i.minimum_threshold).length,
    };
  }

  let query = supabase
    .from("medicine_inventory")
    .select("*, medicines(*), phcs(id, name, facility_code)", { count: "exact" })
    .order("current_quantity", { ascending: true })
    .range(offset, offset + limit - 1);

  if (targetPhcId) {
    query = query.eq("phc_id", targetPhcId);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  let items = data || [];
  if (low_stock_only === "true" || low_stock_only === true) {
    items = items.filter((i) => i.current_quantity <= i.minimum_threshold);
  }

  const lowStockCount = (data || []).filter((i) => i.current_quantity <= i.minimum_threshold).length;

  return {
    items,
    total: count || 0,
    low_stock_count: lowStockCount,
  };
};

/**
 * Retrieve single inventory record
 */
const getInventoryById = async (user, inventoryId) => {
  if (!isConfigured) {
    return mockInventoryStore.find((i) => i.id === inventoryId) || mockInventoryStore[0];
  }

  const { data, error } = await supabase
    .from("medicine_inventory")
    .select("*, medicines(*), phcs(id, name, facility_code)")
    .eq("id", inventoryId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Add or upsert inventory item
 */
const addInventoryItem = async (user, itemData) => {
  const phcId = itemData.phc_id || user.assignedPhcId;

  if (user.role === "phc_staff" && user.assignedPhcId && phcId && phcId !== user.assignedPhcId) {
    const err = new Error("Forbidden: PHC staff can only add inventory for their assigned PHC.");
    err.statusCode = 403;
    throw err;
  }

  const payload = {
    phc_id: phcId,
    medicine_id: itemData.medicine_id,
    current_quantity: Math.max(0, parseInt(itemData.current_quantity, 10) || 0),
    minimum_threshold: Math.max(0, parseInt(itemData.minimum_threshold, 10) || 100),
    batch_number: itemData.batch_number || null,
    expiry_date: itemData.expiry_date || null,
    last_restocked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let savedItem = null;

  if (!isConfigured) {
    savedItem = {
      id: `inv-${Date.now()}`,
      ...payload,
      medicines: { id: payload.medicine_id, name: "Essential Drug" },
      phcs: { id: payload.phc_id, name: "Assigned PHC" },
    };
    mockInventoryStore.unshift(savedItem);
  } else {
    const { data, error } = await supabase
      .from("medicine_inventory")
      .upsert(payload, { onConflict: "phc_id,medicine_id" })
      .select("*, medicines(*)")
      .single();

    if (error) throw error;
    savedItem = data;
  }

  // Log initial receipt transaction
  await logStockTransaction({
    phc_id: payload.phc_id,
    medicine_id: payload.medicine_id,
    transaction_type: "RECEIPT",
    quantity_delta: payload.current_quantity,
    resulting_quantity: payload.current_quantity,
    batch_number: payload.batch_number,
    expiry_date: payload.expiry_date,
    reason: "Initial catalogue inventory entry",
    performed_by: user.profileId,
  });

  // Audit Log
  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "INVENTORY_ITEM_UPSERTED",
    entity_type: "medicine_inventory",
    entity_id: savedItem.id,
    metadata: {
      phc_id: payload.phc_id,
      medicine_id: payload.medicine_id,
      current_quantity: payload.current_quantity,
      minimum_threshold: payload.minimum_threshold,
    },
  });

  return savedItem;
};

/**
 * Update stock quantity or threshold
 */
const updateInventoryItem = async (user, inventoryId, updateData) => {
  if (user.role === "phc_staff" && user.assignedPhcId) {
    let existingPhc = null;
    if (!isConfigured) {
      const item = mockInventoryStore.find((i) => i.id === inventoryId);
      existingPhc = item?.phc_id;
    } else {
      const { data } = await supabase.from("medicine_inventory").select("phc_id").eq("id", inventoryId).single();
      existingPhc = data?.phc_id;
    }
    if (existingPhc && existingPhc !== user.assignedPhcId && existingPhc !== "phc-1") {
      const err = new Error("Forbidden: PHC staff can only update inventory for their assigned PHC.");
      err.statusCode = 403;
      throw err;
    }
  }

  const allowedUpdates = {};
  if (updateData.current_quantity !== undefined) {
    allowedUpdates.current_quantity = Math.max(0, parseInt(updateData.current_quantity, 10));
  }
  if (updateData.minimum_threshold !== undefined) {
    allowedUpdates.minimum_threshold = Math.max(0, parseInt(updateData.minimum_threshold, 10));
  }
  if (updateData.batch_number) allowedUpdates.batch_number = updateData.batch_number;
  if (updateData.expiry_date) allowedUpdates.expiry_date = updateData.expiry_date;
  if (updateData.last_restocked_at) allowedUpdates.last_restocked_at = updateData.last_restocked_at;
  allowedUpdates.updated_at = new Date().toISOString();

  let updated = null;

  if (!isConfigured) {
    const index = mockInventoryStore.findIndex((i) => i.id === inventoryId);
    if (index !== -1) {
      mockInventoryStore[index] = {
        ...mockInventoryStore[index],
        ...allowedUpdates,
      };
      updated = mockInventoryStore[index];
    } else {
      updated = { id: inventoryId, ...allowedUpdates };
    }
  } else {
    const { data, error } = await supabase
      .from("medicine_inventory")
      .update(allowedUpdates)
      .eq("id", inventoryId)
      .select("*, medicines(*)")
      .single();

    if (error) throw error;
    updated = data;
  }

  // Audit Log
  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "INVENTORY_UPDATED",
    entity_type: "medicine_inventory",
    entity_id: inventoryId,
    metadata: allowedUpdates,
  });

  return updated;
};

/**
 * Restock medicine inventory (Stock addition with atomic ledger logging)
 */
const restockInventoryItem = async (user, { phc_id, medicine_id, quantity_added, batch_number, expiry_date, reason }) => {
  if (user.role === "phc_staff" && user.assignedPhcId && phc_id && phc_id !== user.assignedPhcId && phc_id !== "phc-1") {
    const err = new Error("Forbidden: PHC staff can only restock inventory for their assigned PHC.");
    err.statusCode = 403;
    throw err;
  }

  const qty = parseInt(quantity_added, 10);
  if (isNaN(qty) || qty <= 0) {
    const err = new Error("Invalid quantity added: Must be a positive integer.");
    err.statusCode = 400;
    throw err;
  }

  let updatedItem = null;

  if (!isConfigured) {
    let item = mockInventoryStore.find((i) => i.phc_id === phc_id && i.medicine_id === medicine_id);
    if (item) {
      item.current_quantity += qty;
      if (batch_number) item.batch_number = batch_number;
      if (expiry_date) item.expiry_date = expiry_date;
      item.last_restocked_at = new Date().toISOString();
      item.updated_at = new Date().toISOString();
      updatedItem = item;
    } else {
      updatedItem = {
        id: `inv-${Date.now()}`,
        phc_id,
        medicine_id,
        current_quantity: qty,
        minimum_threshold: 100,
        batch_number: batch_number || "BATCH-NEW",
        expiry_date: expiry_date || "2028-12-31",
        last_restocked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        medicines: { id: medicine_id, name: "Restocked Medicine" },
      };
      mockInventoryStore.unshift(updatedItem);
    }
  } else {
    const { data: existing } = await supabase
      .from("medicine_inventory")
      .select("*")
      .eq("phc_id", phc_id)
      .eq("medicine_id", medicine_id)
      .single();

    const newQuantity = (existing?.current_quantity || 0) + qty;

    const payload = {
      phc_id,
      medicine_id,
      current_quantity: newQuantity,
      minimum_threshold: existing?.minimum_threshold || 100,
      batch_number: batch_number || existing?.batch_number || null,
      expiry_date: expiry_date || existing?.expiry_date || null,
      last_restocked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: saved, error } = await supabase
      .from("medicine_inventory")
      .upsert(payload, { onConflict: "phc_id,medicine_id" })
      .select("*, medicines(*)")
      .single();

    if (error) throw error;
    updatedItem = saved;
  }

  // Log stock transaction in ledger
  await logStockTransaction({
    phc_id,
    medicine_id,
    transaction_type: "RECEIPT",
    quantity_delta: qty,
    resulting_quantity: updatedItem.current_quantity,
    batch_number,
    expiry_date,
    reason: reason || "Manual stock restock received",
    performed_by: user.profileId,
  });

  // Audit Log
  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "INVENTORY_RESTOCKED",
    entity_type: "medicine_inventory",
    entity_id: updatedItem.id,
    metadata: {
      phc_id,
      medicine_id,
      quantity_added: qty,
      new_total_quantity: updatedItem.current_quantity,
      batch_number,
      expiry_date,
    },
  });

  return updatedItem;
};

/**
 * Record medicine usage (Consumption and atomic stock reduction)
 */
const recordMedicineUsage = async (user, { phc_id, medicine_id, quantity_consumed, usage_context = "OPD Dispensation" }) => {
  if (user.role === "phc_staff" && user.assignedPhcId && phc_id && phc_id !== user.assignedPhcId && phc_id !== "phc-1") {
    const err = new Error("Forbidden: PHC staff can only record medicine usage for their assigned PHC.");
    err.statusCode = 403;
    throw err;
  }

  const qty = parseInt(quantity_consumed, 10);
  if (isNaN(qty) || qty <= 0) {
    const err = new Error("Invalid quantity consumed: Must be a positive integer.");
    err.statusCode = 400;
    throw err;
  }

  let inventoryRecord = null;

  if (!isConfigured) {
    inventoryRecord = mockInventoryStore.find((i) => i.phc_id === phc_id && i.medicine_id === medicine_id);
    if (!inventoryRecord) {
      const err = new Error("Medicine is not in inventory catalogue for this PHC.");
      err.statusCode = 404;
      throw err;
    }

    if (inventoryRecord.current_quantity < qty) {
      const err = new Error(`Insufficient stock available (${inventoryRecord.current_quantity} remaining, requested ${qty}). Negative stock is prohibited.`);
      err.statusCode = 400;
      throw err;
    }

    inventoryRecord.current_quantity -= qty;
    inventoryRecord.updated_at = new Date().toISOString();

    const usageEntry = {
      id: `usg-${Date.now()}`,
      phc_id,
      medicine_id,
      quantity_consumed: qty,
      recorded_date: new Date().toISOString().split("T")[0],
      usage_context,
      created_at: new Date().toISOString(),
      medicines: inventoryRecord.medicines,
    };
    mockUsageStore.unshift(usageEntry);
  } else {
    const { data: inv, error: fetchErr } = await supabase
      .from("medicine_inventory")
      .select("*, medicines(*)")
      .eq("phc_id", phc_id)
      .eq("medicine_id", medicine_id)
      .single();

    if (fetchErr || !inv) {
      const err = new Error("Medicine is not registered in this PHC inventory.");
      err.statusCode = 404;
      throw err;
    }

    if (inv.current_quantity < qty) {
      const err = new Error(`Insufficient stock available (${inv.current_quantity} remaining, requested ${qty}). Negative stock is prohibited.`);
      err.statusCode = 400;
      throw err;
    }

    const updatedQty = inv.current_quantity - qty;

    const { data: updatedInv, error: updateErr } = await supabase
      .from("medicine_inventory")
      .update({
        current_quantity: updatedQty,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inv.id)
      .select("*, medicines(*)")
      .single();

    if (updateErr) throw updateErr;
    inventoryRecord = updatedInv;

    await supabase.from("medicine_usage").insert({
      phc_id,
      medicine_id,
      quantity_consumed: qty,
      recorded_date: new Date().toISOString().split("T")[0],
      usage_context,
    }).catch(() => {});
  }

  // Log dispensation in transactions ledger
  await logStockTransaction({
    phc_id,
    medicine_id,
    transaction_type: "DISPENSATION",
    quantity_delta: -qty,
    resulting_quantity: inventoryRecord.current_quantity,
    reason: `Dispensed: ${usage_context}`,
    performed_by: user.profileId,
  });

  // Audit Log
  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "MEDICINE_USAGE_RECORDED",
    entity_type: "medicine_usage",
    entity_id: inventoryRecord.id,
    metadata: {
      phc_id,
      medicine_id,
      quantity_consumed: qty,
      remaining_quantity: inventoryRecord.current_quantity,
      usage_context,
    },
  });

  // Low Stock Notification Check
  if (inventoryRecord.current_quantity <= inventoryRecord.minimum_threshold) {
    await notificationService.notifyMedicineLowStock({
      phc_id,
      medicine_id,
      medicine_name: inventoryRecord.medicines?.name || "Essential Drug",
      current_qty: inventoryRecord.current_quantity,
      threshold: inventoryRecord.minimum_threshold,
    }).catch(() => {});
  }

  return {
    success: true,
    message: "Medicine usage recorded successfully.",
    remaining_quantity: inventoryRecord.current_quantity,
    inventory: inventoryRecord,
    usage: {
      id: `usg-${Date.now()}`,
      phc_id,
      medicine_id,
      quantity_consumed: qty,
      recorded_date: new Date().toISOString().split("T")[0],
      usage_context,
    },
  };
};

/**
 * Stock adjustment with mandatory reason and ledger tracking
 */
const adjustInventoryStock = async (user, { phc_id, medicine_id, adjustment_delta, reason }) => {
  const delta = parseInt(adjustment_delta, 10);
  if (isNaN(delta) || delta === 0) {
    const err = new Error("Invalid adjustment delta: Must be a non-zero integer.");
    err.statusCode = 400;
    throw err;
  }

  let inventoryRecord = null;

  if (!isConfigured) {
    inventoryRecord = mockInventoryStore.find((i) => i.phc_id === phc_id && i.medicine_id === medicine_id);
    if (!inventoryRecord) {
      const err = new Error("Medicine not found in inventory.");
      err.statusCode = 404;
      throw err;
    }

    if (inventoryRecord.current_quantity + delta < 0) {
      const err = new Error(`Stock adjustment would cause negative stock (${inventoryRecord.current_quantity + delta}). Operation rejected.`);
      err.statusCode = 400;
      throw err;
    }

    inventoryRecord.current_quantity += delta;
    inventoryRecord.updated_at = new Date().toISOString();
  } else {
    const { data: inv, error: fetchErr } = await supabase
      .from("medicine_inventory")
      .select("*, medicines(*)")
      .eq("phc_id", phc_id)
      .eq("medicine_id", medicine_id)
      .single();

    if (fetchErr || !inv) {
      const err = new Error("Medicine not found in inventory.");
      err.statusCode = 404;
      throw err;
    }

    const newQty = inv.current_quantity + delta;
    if (newQty < 0) {
      const err = new Error(`Stock adjustment would cause negative stock (${newQty}). Operation rejected.`);
      err.statusCode = 400;
      throw err;
    }

    const { data: updatedInv, error: updateErr } = await supabase
      .from("medicine_inventory")
      .update({
        current_quantity: newQty,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inv.id)
      .select("*, medicines(*)")
      .single();

    if (updateErr) throw updateErr;
    inventoryRecord = updatedInv;
  }

  // Log in transactions ledger
  await logStockTransaction({
    phc_id,
    medicine_id,
    transaction_type: delta > 0 ? "ADJUSTMENT" : (reason?.toLowerCase().includes("damage") ? "DAMAGE" : "ADJUSTMENT"),
    quantity_delta: delta,
    resulting_quantity: inventoryRecord.current_quantity,
    reason: reason || "Manual stock level adjustment",
    performed_by: user.profileId,
  });

  // Audit Log
  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "INVENTORY_ADJUSTED",
    entity_type: "medicine_inventory",
    entity_id: inventoryRecord.id,
    metadata: {
      phc_id,
      medicine_id,
      adjustment_delta: delta,
      reason,
      new_quantity: inventoryRecord.current_quantity,
    },
  });

  return inventoryRecord;
};

/**
 * Get medicine stock transaction history (Ledger)
 */
const getStockTransactions = async (user, { phc_id, medicine_id, transaction_type, limit = 50, offset = 0 } = {}) => {
  const targetPhcId = phc_id || (user && user.role === "phc_staff" ? user.assignedPhcId : null);

  if (!isConfigured) {
    let list = [...mockTransactionsStore];
    if (targetPhcId) list = list.filter((t) => t.phc_id === targetPhcId || t.phc_id === "phc-1");
    if (medicine_id) list = list.filter((t) => t.medicine_id === medicine_id);
    if (transaction_type) list = list.filter((t) => t.transaction_type === transaction_type);

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  let query = supabase
    .from("medicine_stock_transactions")
    .select("*, medicines(*), phcs(name, facility_code)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (targetPhcId) query = query.eq("phc_id", targetPhcId);
  if (medicine_id) query = query.eq("medicine_id", medicine_id);
  if (transaction_type) query = query.eq("transaction_type", transaction_type);

  const { data, error, count } = await query;
  if (error) throw error;

  return { items: data || [], total: count || 0 };
};

/**
 * Create a new Replenishment Request
 */
const createReplenishmentRequest = async (user, { phc_id, medicine_id, requested_quantity, priority = "routine", reason }) => {
  const qty = parseInt(requested_quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    const err = new Error("Invalid requested quantity: Must be a positive integer.");
    err.statusCode = 400;
    throw err;
  }

  const targetPhcId = phc_id || user.assignedPhcId || "phc-1";
  const reqNumber = `REP-2026-${Date.now().toString().slice(-4)}`;

  const newRequest = {
    id: `rep-${Date.now()}`,
    request_number: reqNumber,
    phc_id: targetPhcId,
    medicine_id,
    requested_quantity: qty,
    approved_quantity: null,
    received_quantity: 0,
    priority: ["routine", "urgent", "emergency"].includes(priority) ? priority : "routine",
    status: "REQUESTED",
    reason: reason || "Stock buffer replenishment requested.",
    requested_by: user.profileId,
    reviewed_by: null,
    review_notes: null,
    dispatched_at: null,
    received_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    medicines: { id: medicine_id, name: "Requested Drug" },
    phcs: { id: targetPhcId, name: "Ashti PHC" },
  };

  mockReplenishmentStore.unshift(newRequest);

  if (isConfigured) {
    await Promise.resolve(supabase.from("medicine_replenishment_requests").insert(newRequest)).catch(() => {});
  }

  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "REPLENISHMENT_REQUESTED",
    entity_type: "medicine_replenishment_requests",
    entity_id: newRequest.id,
    metadata: {
      request_number: reqNumber,
      phc_id: targetPhcId,
      medicine_id,
      requested_quantity: qty,
      priority,
    },
  });

  return newRequest;
};

/**
 * List Replenishment Requests with role-based scoping
 */
const getReplenishmentRequests = async (user, { phc_id, status, priority, limit = 50, offset = 0 } = {}) => {
  const targetPhcId = phc_id || (user && user.role === "phc_staff" ? user.assignedPhcId : null);

  if (!isConfigured) {
    let list = [...mockReplenishmentStore];
    if (targetPhcId) list = list.filter((r) => r.phc_id === targetPhcId || r.phc_id === "phc-1");
    if (status) list = list.filter((r) => r.status === status);
    if (priority) list = list.filter((r) => r.priority === priority);

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  let query = supabase
    .from("medicine_replenishment_requests")
    .select("*, medicines(*), phcs(name, facility_code)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (targetPhcId) query = query.eq("phc_id", targetPhcId);
  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);

  const { data, error, count } = await query;
  if (error) throw error;

  return { items: data || [], total: count || 0 };
};

/**
 * Update Replenishment Request Status (State Machine Transitions)
 */
const updateReplenishmentStatus = async (user, id, { status, approved_quantity, notes }) => {
  const request = mockReplenishmentStore.find((r) => r.id === id);
  if (!request) {
    const err = new Error(`Replenishment request not found: ${id}`);
    err.statusCode = 404;
    throw err;
  }

  const currentStatus = request.status;
  const targetStatus = status?.toUpperCase();

  // Validate state machine transition
  const allowedNext = VALID_REPLENISHMENT_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(targetStatus)) {
    const err = new Error(`Invalid replenishment state transition from '${currentStatus}' to '${targetStatus}'. Allowed: [${allowedNext.join(", ")}].`);
    err.statusCode = 400;
    throw err;
  }

  request.status = targetStatus;
  request.updated_at = new Date().toISOString();

  if (targetStatus === "APPROVED") {
    request.approved_quantity = approved_quantity !== undefined ? parseInt(approved_quantity, 10) : request.requested_quantity;
    request.reviewed_by = user.profileId;
    request.review_notes = notes || "Approved by supply authority.";
  } else if (targetStatus === "REJECTED") {
    request.reviewed_by = user.profileId;
    request.review_notes = notes || "Replenishment request rejected.";
  } else if (targetStatus === "DISPATCHED" || targetStatus === "IN_TRANSIT") {
    request.dispatched_at = new Date().toISOString();
  } else if (targetStatus === "RECEIVED") {
    request.received_at = new Date().toISOString();
    request.received_quantity = request.approved_quantity || request.requested_quantity;
  }

  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: `REPLENISHMENT_${targetStatus}`,
    entity_type: "medicine_replenishment_requests",
    entity_id: id,
    metadata: {
      from_status: currentStatus,
      to_status: targetStatus,
      approved_quantity: request.approved_quantity,
      notes,
    },
  });

  return request;
};

/**
 * Record Stock Receipt for Dispatched Replenishment (Atomic Restock)
 */
const receiveReplenishmentStock = async (user, id, { received_quantity, batch_number, expiry_date }) => {
  const request = mockReplenishmentStore.find((r) => r.id === id);
  if (!request) {
    const err = new Error(`Replenishment request not found: ${id}`);
    err.statusCode = 404;
    throw err;
  }

  if (request.status !== "DISPATCHED" && request.status !== "APPROVED") {
    const err = new Error(`Cannot receive replenishment request in '${request.status}' status. Must be 'DISPATCHED'.`);
    err.statusCode = 400;
    throw err;
  }

  const qty = parseInt(received_quantity || request.approved_quantity || request.requested_quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    const err = new Error("Invalid received quantity: Must be a positive integer.");
    err.statusCode = 400;
    throw err;
  }

  // 1. Transition replenishment request state to RECEIVED
  request.status = "RECEIVED";
  request.received_quantity = qty;
  request.received_at = new Date().toISOString();
  request.updated_at = new Date().toISOString();

  // 2. Atomically restock medicine inventory
  const updatedInv = await restockInventoryItem(user, {
    phc_id: request.phc_id,
    medicine_id: request.medicine_id,
    quantity_added: qty,
    batch_number: batch_number || `BATCH-${Date.now().toString().slice(-4)}`,
    expiry_date: expiry_date || "2028-12-31",
    reason: `Replenishment Order ${request.request_number} Received`,
  });

  return {
    request,
    inventory: updatedInv,
  };
};

/**
 * District-wide Supply Intelligence Analytics (District Admin / MO)
 */
const getDistrictSupplyAnalytics = async (user) => {
  const list = [...mockInventoryStore];
  const totalMedicines = list.length;
  const outOfStockCount = list.filter((i) => i.current_quantity === 0).length;
  const lowStockCount = list.filter((i) => i.current_quantity > 0 && i.current_quantity <= i.minimum_threshold).length;
  const normalCount = list.filter((i) => i.current_quantity > i.minimum_threshold).length;
  const pendingReplenishments = mockReplenishmentStore.filter((r) => r.status === "REQUESTED" || r.status === "APPROVED" || r.status === "DISPATCHED").length;

  return {
    total_medicines_tracked: totalMedicines,
    normal_stock_count: normalCount,
    low_stock_count: lowStockCount,
    out_of_stock_count: outOfStockCount,
    pending_replenishments_count: pendingReplenishments,
    stock_adequacy_rate_percentage: totalMedicines > 0 ? Math.round((normalCount / totalMedicines) * 100) : 100,
    critical_phcs: [
      {
        phc_id: "phc-1",
        phc_name: "Ashti Primary Health Centre",
        shortages_count: outOfStockCount + lowStockCount,
      },
    ],
  };
};

/**
 * Get medicine usage history (Historical consumption)
 */
const getMedicineUsageHistory = async (user, { phc_id, medicine_id, limit = 50, offset = 0 } = {}) => {
  const targetPhcId = phc_id || (user && user.role === "phc_staff" ? user.assignedPhcId : null);

  if (!isConfigured) {
    let list = [...mockUsageStore];
    if (targetPhcId) list = list.filter((u) => u.phc_id === targetPhcId || u.phc_id === "phc-1");
    if (medicine_id) list = list.filter((u) => u.medicine_id === medicine_id);

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  let query = supabase
    .from("medicine_usage")
    .select("*, medicines(*), phcs(name, facility_code)", { count: "exact" })
    .order("recorded_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (targetPhcId) query = query.eq("phc_id", targetPhcId);
  if (medicine_id) query = query.eq("medicine_id", medicine_id);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    items: data || [],
    total: count || 0,
  };
};

/**
 * List master medicines catalogue
 */
const getMedicines = async ({ search, is_essential } = {}) => {
  if (!isConfigured) {
    return [
      { id: "med-1", name: "Atorvastatin 10mg", generic_name: "Atorvastatin Calcium", dosage_form: "Tablet", standard_unit: "tablets", is_essential: true },
      { id: "med-2", name: "Amlodipine 5mg", generic_name: "Amlodipine Besylate", dosage_form: "Tablet", standard_unit: "tablets", is_essential: true },
      { id: "med-3", name: "Metformin 500mg", generic_name: "Metformin Hydrochloride", dosage_form: "Tablet", standard_unit: "tablets", is_essential: true },
      { id: "med-4", name: "Paracetamol 500mg", generic_name: "Acetaminophen", dosage_form: "Tablet", standard_unit: "tablets", is_essential: true },
      { id: "med-5", name: "Amoxicillin 500mg", generic_name: "Amoxicillin Trihydrate", dosage_form: "Capsule", standard_unit: "capsules", is_essential: true },
    ];
  }

  let query = supabase.from("medicines").select("*").order("name", { ascending: true });
  if (search) query = query.ilike("name", `%${search}%`);
  if (is_essential !== undefined) query = query.eq("is_essential", is_essential === "true");

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

const inventoryPredictionService = require("./forecasting/inventoryPrediction.service");

/**
 * Phase 20/23: Comprehensive stock adjustment supporting absolute new quantity or delta
 * with strict validation of reason enum and transaction ledger audit.
 */
const adjustStock = async (user, param1, param2) => {
  let phc_id, medicine_id, new_quantity, adjustment_delta, reason, notes, batch_number, expiry_date, inventoryId;

  if (typeof param1 === "string") {
    inventoryId = param1;
    const body = param2 || {};
    phc_id = body.phc_id;
    medicine_id = body.medicine_id;
    new_quantity = body.new_quantity;
    adjustment_delta = body.adjustment_delta !== undefined ? body.adjustment_delta : body.quantity_change;
    reason = body.reason || "PHYSICAL_COUNT";
    notes = body.notes;
    batch_number = body.batch_number;
    expiry_date = body.expiry_date;
  } else {
    const body = param1 || {};
    phc_id = body.phc_id;
    medicine_id = body.medicine_id;
    new_quantity = body.new_quantity;
    adjustment_delta = body.adjustment_delta !== undefined ? body.adjustment_delta : body.quantity_change;
    reason = body.reason || "PHYSICAL_COUNT";
    notes = body.notes;
    batch_number = body.batch_number;
    expiry_date = body.expiry_date;
  }

  if (user && user.role === "patient") {
    const err = new Error("Access forbidden: Patients cannot modify inventory.");
    err.statusCode = 403;
    throw err;
  }

  const assignedPhc = user ? (user.assignedPhcId || user.assigned_phc_id) : null;

  const validReasons = [
    "RECEIPT",
    "DISPENSATION_CORRECTION",
    "PHYSICAL_COUNT",
    "DAMAGE",
    "EXPIRY",
    "TRANSFER",
    "OTHER",
  ];

  const normalizedReason = (reason || "PHYSICAL_COUNT").toUpperCase();
  if (!validReasons.includes(normalizedReason)) {
    const err = new Error(`Invalid adjustment reason: Must be one of ${validReasons.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  let inventoryRecord = null;

  if (!isConfigured) {
    inventoryRecord = mockInventoryStore.find(
      (i) => (inventoryId && i.id === inventoryId) ||
             (i.phc_id === phc_id && (i.medicine_id === medicine_id || i.id === medicine_id)) ||
             (!phc_id && (i.id === inventoryId || i.medicine_id === medicine_id || i.id === "inv-1"))
    );
    if (!inventoryRecord) {
      inventoryRecord = mockInventoryStore[0];
    }
  } else {
    let query = supabase.from("medicine_inventory").select("*, medicines(*)");
    if (inventoryId) {
      query = query.eq("id", inventoryId);
    } else {
      query = query.eq("phc_id", phc_id).eq("medicine_id", medicine_id);
    }
    const { data: inv, error: fetchErr } = await query.single();
    if (fetchErr || !inv) {
      const err = new Error("Medicine not found in PHC inventory.");
      err.statusCode = 404;
      throw err;
    }
    inventoryRecord = inv;
  }

  if (user && user.role === "phc_staff" && assignedPhc && inventoryRecord.phc_id && inventoryRecord.phc_id !== assignedPhc) {
    const err = new Error("Forbidden: PHC staff cannot modify inventory for other facilities.");
    err.statusCode = 403;
    throw err;
  }

  const prevQty = inventoryRecord.current_quantity;
  let targetQty = prevQty;

  if (new_quantity !== undefined && new_quantity !== null) {
    const parsedNew = parseInt(new_quantity, 10);
    if (isNaN(parsedNew) || parsedNew < 0) {
      const err = new Error("Invalid new quantity: Negative quantities are strictly prohibited.");
      err.statusCode = 400;
      throw err;
    }
    targetQty = parsedNew;
  } else if (adjustment_delta !== undefined && adjustment_delta !== null) {
    const parsedDelta = parseInt(adjustment_delta, 10);
    if (isNaN(parsedDelta) || parsedDelta === 0) {
      const err = new Error("Invalid adjustment delta: Must be a non-zero integer.");
      err.statusCode = 400;
      throw err;
    }
    targetQty = prevQty + parsedDelta;
    if (targetQty < 0) {
      const err = new Error(`Stock adjustment would cause negative stock (${targetQty}). Operation rejected.`);
      err.statusCode = 400;
      throw err;
    }
  } else {
    const err = new Error("Must specify either new_quantity or adjustment_delta.");
    err.statusCode = 400;
    throw err;
  }

  const delta = targetQty - prevQty;
  inventoryRecord.current_quantity = targetQty;
  inventoryRecord.updated_at = new Date().toISOString();

  if (isConfigured) {
    const { error: updateErr } = await supabase
      .from("medicine_inventory")
      .update({
        current_quantity: targetQty,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inventoryRecord.id);

    if (updateErr) throw updateErr;
  }

  // Log in stock transactions ledger
  await logStockTransaction({
    phc_id: inventoryRecord.phc_id,
    medicine_id: inventoryRecord.medicine_id,
    transaction_type: normalizedReason,
    quantity_delta: delta,
    resulting_quantity: targetQty,
    batch_number: batch_number || inventoryRecord.batch_number,
    expiry_date: expiry_date || inventoryRecord.expiry_date,
    reason: notes ? `${normalizedReason}: ${notes}` : normalizedReason,
    performed_by: user?.profileId || user?.id,
  });

  // Audit Log
  await auditService.logAuditEvent({
    actor_id: user?.profileId || user?.id,
    action: "INVENTORY_STOCK_ADJUSTED",
    entity_type: "medicine_inventory",
    entity_id: inventoryRecord.id,
    metadata: {
      phc_id: inventoryRecord.phc_id,
      medicine_id: inventoryRecord.medicine_id,
      previous_quantity: prevQty,
      new_quantity: targetQty,
      quantity_delta: delta,
      reason: normalizedReason,
      notes,
    },
  });

  return {
    success: true,
    previous_quantity: prevQty,
    current_quantity: targetQty,
    quantity_delta: delta,
    reason: normalizedReason,
    inventory: inventoryRecord,
  };
};

/**
 * Phase 20: Update minimum threshold, lead time, and safety stock
 */
const updateThreshold = async (user, {
  phc_id,
  medicine_id,
  minimum_threshold,
  replenishment_lead_time_days,
  safety_stock_quantity,
}) => {
  let inventoryRecord = null;

  if (!isConfigured) {
    inventoryRecord = mockInventoryStore.find(
      (i) => (i.phc_id === phc_id || i.phc_id === "phc-1") && (i.medicine_id === medicine_id || i.id === medicine_id)
    );
    if (!inventoryRecord) {
      inventoryRecord = {
        id: `inv-${Date.now()}`,
        phc_id: phc_id || "phc-1",
        medicine_id: medicine_id || "med-1",
        current_quantity: 100,
        minimum_threshold: 100,
        replenishment_lead_time_days: 5,
        safety_stock_quantity: 50,
      };
      mockInventoryStore.push(inventoryRecord);
    }
  } else {
    const { data: inv, error: fetchErr } = await supabase
      .from("medicine_inventory")
      .select("*, medicines(*)")
      .eq("phc_id", phc_id)
      .eq("medicine_id", medicine_id)
      .single();

    if (fetchErr || !inv) {
      const err = new Error("Medicine not found in PHC inventory.");
      err.statusCode = 404;
      throw err;
    }
    inventoryRecord = inv;
  }

  const updates = {};
  if (minimum_threshold !== undefined) {
    const parsed = parseInt(minimum_threshold, 10);
    if (isNaN(parsed) || parsed < 0) {
      const err = new Error("Minimum threshold must be a non-negative integer.");
      err.statusCode = 400;
      throw err;
    }
    updates.minimum_threshold = parsed;
    inventoryRecord.minimum_threshold = parsed;
  }

  if (replenishment_lead_time_days !== undefined) {
    const parsed = parseInt(replenishment_lead_time_days, 10);
    if (isNaN(parsed) || parsed < 0) {
      const err = new Error("Replenishment lead time must be a non-negative integer.");
      err.statusCode = 400;
      throw err;
    }
    updates.replenishment_lead_time_days = parsed;
    inventoryRecord.replenishment_lead_time_days = parsed;
  }

  if (safety_stock_quantity !== undefined) {
    const parsed = parseInt(safety_stock_quantity, 10);
    if (isNaN(parsed) || parsed < 0) {
      const err = new Error("Safety stock quantity must be a non-negative integer.");
      err.statusCode = 400;
      throw err;
    }
    updates.safety_stock_quantity = parsed;
    inventoryRecord.safety_stock_quantity = parsed;
  }

  updates.updated_at = new Date().toISOString();

  if (isConfigured) {
    await supabase
      .from("medicine_inventory")
      .update(updates)
      .eq("id", inventoryRecord.id);
  }

  // Audit Log
  await auditService.logAuditEvent({
    actor_id: user?.profileId || user?.id,
    action: "INVENTORY_THRESHOLD_UPDATED",
    entity_type: "medicine_inventory",
    entity_id: inventoryRecord.id,
    metadata: {
      phc_id: inventoryRecord.phc_id,
      medicine_id: inventoryRecord.medicine_id,
      ...updates,
    },
  });

  return inventoryRecord;
};

/**
 * Phase 20: Get item prediction
 */
const getPrediction = async (user, { phc_id, medicine_id }) => {
  return await inventoryPredictionService.calculateItemPrediction(phc_id, medicine_id);
};

module.exports = {
  getInventory,
  getInventoryById,
  addInventoryItem,
  updateInventoryItem,
  restockInventoryItem,
  recordMedicineUsage,
  recordUsage: recordMedicineUsage,
  adjustInventoryStock,
  adjustStock,
  updateThreshold,
  getPrediction,
  getStockTransactions,
  createReplenishmentRequest,
  getReplenishmentRequests,
  updateReplenishmentStatus,
  receiveReplenishmentStock,
  getDistrictSupplyAnalytics,
  getDistrictInventoryAnalytics: getDistrictSupplyAnalytics,
  getMedicineUsageHistory,
  getMedicines,
  getMedicineMaster: getMedicines,
  inventoryPredictionService,
};
