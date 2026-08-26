-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000009_medicine_supply_chain.sql
-- Description: Medicine Stock Transaction Ledger, Replenishment Requests, and Constraints
-- ==============================================================================

-- 1. Ensure inventory quantity cannot be negative
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_inventory_non_negative'
    ) THEN
        ALTER TABLE medicine_inventory 
        ADD CONSTRAINT chk_inventory_non_negative CHECK (current_quantity >= 0);
    END IF;
END $$;

-- 2. Medicine Stock Transactions Ledger Table
CREATE TABLE IF NOT EXISTS medicine_stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'RECEIPT', 'DISPENSATION', 'ADJUSTMENT', 'DAMAGE', 'EXPIRY', 'TRANSFER_IN', 'TRANSFER_OUT'
    quantity_delta INT NOT NULL,
    resulting_quantity INT NOT NULL CHECK (resulting_quantity >= 0),
    batch_number VARCHAR(100),
    expiry_date DATE,
    reason TEXT,
    reference_id VARCHAR(100),
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Medicine Replenishment Requests Table
CREATE TABLE IF NOT EXISTS medicine_replenishment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) NOT NULL UNIQUE,
    phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    requested_quantity INT NOT NULL CHECK (requested_quantity > 0),
    approved_quantity INT CHECK (approved_quantity >= 0),
    received_quantity INT CHECK (received_quantity >= 0),
    priority VARCHAR(20) NOT NULL DEFAULT 'routine', -- 'routine', 'urgent', 'emergency'
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED', -- 'DRAFT', 'REQUESTED', 'APPROVED', 'REJECTED', 'DISPATCHED', 'RECEIVED', 'CANCELLED'
    reason TEXT,
    suggested_formula_metadata JSONB DEFAULT '{}',
    requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    review_notes TEXT,
    dispatched_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_trans_phc_med ON medicine_stock_transactions(phc_id, medicine_id);
CREATE INDEX IF NOT EXISTS idx_stock_trans_created ON medicine_stock_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replenish_phc_status ON medicine_replenishment_requests(phc_id, status);
CREATE INDEX IF NOT EXISTS idx_replenish_status_created ON medicine_replenishment_requests(status, created_at DESC);

-- Enable RLS
ALTER TABLE medicine_stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_replenishment_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Transactions read policy (PHC staff sees assigned PHC, district admin sees all)
DROP POLICY IF EXISTS "Authorized staff can view stock transactions" ON medicine_stock_transactions;
CREATE POLICY "Authorized staff can view stock transactions" ON medicine_stock_transactions
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'district_admin'
                OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = medicine_stock_transactions.phc_id)
            )
        )
    );

-- RLS: Replenishment requests read policy
DROP POLICY IF EXISTS "Authorized staff can view replenishment requests" ON medicine_replenishment_requests;
CREATE POLICY "Authorized staff can view replenishment requests" ON medicine_replenishment_requests
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'district_admin'
                OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = medicine_replenishment_requests.phc_id)
            )
        )
    );

-- RLS: Replenishment requests update policy
DROP POLICY IF EXISTS "Authorized staff can update replenishment requests" ON medicine_replenishment_requests;
CREATE POLICY "Authorized staff can update replenishment requests" ON medicine_replenishment_requests
    FOR UPDATE
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'district_admin'
                OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = medicine_replenishment_requests.phc_id)
            )
        )
    );
