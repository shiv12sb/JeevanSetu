-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000012_early_warning_intelligence.sql
-- Description: Phase 17 Multi-Source Health Early-Warning Intelligence
-- ==============================================================================

-- 1. Enhance early_warning_signals table with Phase 17 intelligence columns
ALTER TABLE IF EXISTS early_warning_signals 
    ADD COLUMN IF NOT EXISTS severity VARCHAR(50) DEFAULT 'WATCH',
    ADD COLUMN IF NOT EXISTS confidence VARCHAR(50) DEFAULT 'MEDIUM',
    ADD COLUMN IF NOT EXISTS signal_score NUMERIC(5, 2) DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'GENERAL',
    ADD COLUMN IF NOT EXISTS resolution_category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS algorithm_version VARCHAR(50) DEFAULT 'v1.0-deterministic',
    ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- 2. External Health Observations Table (Aggregated Feeds)
CREATE TABLE IF NOT EXISTS external_health_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(100) NOT NULL, -- 'weather', 'community_report', 'pharmacy_aggregate'
    facility_id UUID REFERENCES phcs(id) ON DELETE SET NULL,
    district VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    observed_value NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Composite Indexes for Fast Performance
CREATE INDEX IF NOT EXISTS idx_early_warning_signals_severity_status ON early_warning_signals(severity, status);
CREATE INDEX IF NOT EXISTS idx_early_warning_signals_phc_date ON early_warning_signals(phc_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_external_health_obs_lookup ON external_health_observations(district, source_type, observed_at DESC);

-- 4. Row Level Security for External Observations
ALTER TABLE external_health_observations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authorized health staff can view external observations" ON external_health_observations;
CREATE POLICY "Authorized health staff can view external observations" ON external_health_observations
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
            )
        )
    );

DROP POLICY IF EXISTS "System jobs and admins can insert external observations" ON external_health_observations;
CREATE POLICY "System jobs and admins can insert external observations" ON external_health_observations
    FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin')
        )
    );
