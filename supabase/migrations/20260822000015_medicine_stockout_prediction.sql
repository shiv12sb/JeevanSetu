-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000015_medicine_stockout_prediction.sql
-- Description: AI-Assisted Medicine Stockout Prediction, Lead Time, Safety Stock & Alert Management
-- ==============================================================================

-- 1. Extend medicine_inventory with lead time and safety stock configuration
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicine_inventory' AND column_name = 'replenishment_lead_time_days'
    ) THEN
        ALTER TABLE medicine_inventory 
        ADD COLUMN replenishment_lead_time_days INT NOT NULL DEFAULT 5 CHECK (replenishment_lead_time_days >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicine_inventory' AND column_name = 'safety_stock_quantity'
    ) THEN
        ALTER TABLE medicine_inventory 
        ADD COLUMN safety_stock_quantity INT NOT NULL DEFAULT 50 CHECK (safety_stock_quantity >= 0);
    END IF;
END $$;

-- 2. Extend medicine_forecasts with rolling averages, threshold dates, and algorithm metadata
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicine_forecasts' AND column_name = 'estimated_threshold_date'
    ) THEN
        ALTER TABLE medicine_forecasts 
        ADD COLUMN estimated_threshold_date DATE,
        ADD COLUMN estimated_stockout_date DATE,
        ADD COLUMN days_of_stock NUMERIC(6, 1),
        ADD COLUMN reorder_recommended BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN recommended_reorder_date DATE,
        ADD COLUMN rolling_avg_7d NUMERIC(8, 2),
        ADD COLUMN rolling_avg_14d NUMERIC(8, 2),
        ADD COLUMN rolling_avg_30d NUMERIC(8, 2),
        ADD COLUMN data_sufficiency VARCHAR(50) NOT NULL DEFAULT 'INSUFFICIENT_DATA',
        ADD COLUMN algorithm_version VARCHAR(50) NOT NULL DEFAULT 'stockout-v1';
    END IF;
END $$;

-- 3. Create Medicine Inventory Alerts Table for proactive stockout warnings
CREATE TABLE IF NOT EXISTS medicine_inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'LOW_STOCK', 'CRITICAL_STOCKOUT', 'OUT_OF_STOCK', 'CONSUMPTION_SPIKE', 'REORDER_DUE'
    risk_level VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'OUT_OF_STOCK', 'INSUFFICIENT_DATA'
    current_quantity INT NOT NULL CHECK (current_quantity >= 0),
    days_remaining NUMERIC(6, 1),
    status VARCHAR(50) NOT NULL DEFAULT 'NEW', -- 'NEW', 'UNDER_REVIEW', 'ACKNOWLEDGED', 'RESOLVED', 'CLOSED'
    dedup_key VARCHAR(255) NOT NULL UNIQUE,
    acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance & query optimization
CREATE INDEX IF NOT EXISTS idx_inv_alerts_phc_status ON medicine_inventory_alerts(phc_id, status);
CREATE INDEX IF NOT EXISTS idx_inv_alerts_risk_created ON medicine_inventory_alerts(risk_level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inv_alerts_medicine_id ON medicine_inventory_alerts(medicine_id);
CREATE INDEX IF NOT EXISTS idx_inv_alerts_dedup ON medicine_inventory_alerts(dedup_key);

-- Enable RLS
ALTER TABLE medicine_inventory_alerts ENABLE ROW LEVEL SECURITY;

-- RLS: Read policy for inventory alerts
DROP POLICY IF EXISTS "Authorized staff can view inventory alerts" ON medicine_inventory_alerts;
CREATE POLICY "Authorized staff can view inventory alerts" ON medicine_inventory_alerts
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role IN ('district_admin', 'doctor')
                OR (profiles.role = 'phc_staff' AND profiles.assigned_phc_id = medicine_inventory_alerts.phc_id)
            )
        )
    );

-- RLS: Update policy for inventory alerts (Acknowledge & Resolve)
DROP POLICY IF EXISTS "Authorized staff can update inventory alerts" ON medicine_inventory_alerts;
CREATE POLICY "Authorized staff can update inventory alerts" ON medicine_inventory_alerts
    FOR UPDATE
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'district_admin'
                OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = medicine_inventory_alerts.phc_id)
            )
        )
    );
