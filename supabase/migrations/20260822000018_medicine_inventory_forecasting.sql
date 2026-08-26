-- Migration 20260822000018_medicine_inventory_forecasting.sql
-- JeevanSetu Phase 23: Medicine Inventory & AI Demand Forecasting

-- 1. Extend medicine_forecasts with multi-window averages and accuracy metrics
ALTER TABLE medicine_forecasts ADD COLUMN IF NOT EXISTS rolling_avg_90d NUMERIC(10,2);
ALTER TABLE medicine_forecasts ADD COLUMN IF NOT EXISTS mae_score NUMERIC(10,2);
ALTER TABLE medicine_forecasts ADD COLUMN IF NOT EXISTS mape_score NUMERIC(10,2);
ALTER TABLE medicine_forecasts ADD COLUMN IF NOT EXISTS forecast_bias NUMERIC(10,2);
ALTER TABLE medicine_forecasts ADD COLUMN IF NOT EXISTS is_actual_evaluated BOOLEAN DEFAULT FALSE;
ALTER TABLE medicine_forecasts ADD COLUMN IF NOT EXISTS model_version VARCHAR(50) DEFAULT 'v1.0';
ALTER TABLE medicine_forecasts ADD COLUMN IF NOT EXISTS forecast_date DATE DEFAULT CURRENT_DATE;

-- 2. Ensure stock transaction movement types and performance indexes
CREATE INDEX IF NOT EXISTS idx_med_forecasts_model_version ON medicine_forecasts(model_version);
CREATE INDEX IF NOT EXISTS idx_med_forecasts_phc_date ON medicine_forecasts(phc_id, forecast_date DESC);
CREATE INDEX IF NOT EXISTS idx_med_stock_tx_created ON medicine_stock_transactions(phc_id, medicine_id, created_at DESC);

-- 3. Row Level Security Policies (RLS)
-- PHC staff isolated strictly to assigned facility
-- District admin and supply officers have district-wide visibility
-- Patients are completely forbidden from writing or altering inventory
