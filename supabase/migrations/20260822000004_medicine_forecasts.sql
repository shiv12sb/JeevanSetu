-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000004_medicine_forecasts.sql
-- Description: Medicine Depletion Forecasts Table & RLS Policies
-- ==============================================================================

CREATE TABLE IF NOT EXISTS medicine_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    current_quantity INT NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
    estimated_daily_consumption NUMERIC(8, 2),
    estimated_days_remaining NUMERIC(6, 1),
    projected_depletion_date DATE,
    consumption_trend VARCHAR(50) NOT NULL DEFAULT 'stable', -- stable, increasing, decreasing, highly_variable, insufficient_data
    risk_level VARCHAR(50) NOT NULL DEFAULT 'LOW', -- LOW, MEDIUM, HIGH, CRITICAL, INSUFFICIENT_DATA
    data_quality VARCHAR(50) NOT NULL DEFAULT 'INSUFFICIENT_DATA', -- HIGH, MEDIUM, LOW, INSUFFICIENT_DATA
    forecast_status VARCHAR(50) NOT NULL DEFAULT 'calculated', -- calculated, insufficient_data, no_recent_consumption
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (phc_id, medicine_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medicine_forecasts_phc_id ON medicine_forecasts(phc_id);
CREATE INDEX IF NOT EXISTS idx_medicine_forecasts_risk_level ON medicine_forecasts(risk_level);
CREATE INDEX IF NOT EXISTS idx_medicine_forecasts_medicine_id ON medicine_forecasts(medicine_id);

-- Enable RLS
ALTER TABLE medicine_forecasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Authorized staff and doctors can view forecasts" ON medicine_forecasts;
CREATE POLICY "Authorized staff and doctors can view forecasts" ON medicine_forecasts
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND (
                    profiles.role IN ('district_admin', 'doctor')
                    OR (profiles.role = 'phc_staff' AND profiles.assigned_phc_id = medicine_forecasts.phc_id)
                )
            )
        )
    );

DROP POLICY IF EXISTS "System background jobs and admins can upsert forecasts" ON medicine_forecasts;
CREATE POLICY "System background jobs and admins can upsert forecasts" ON medicine_forecasts
    FOR ALL
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'district_admin'
        )
    );
