-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000021_public_health_early_warning.sql
-- Description: Phase 27 Public Health Early Warning & Outbreak Intelligence
-- ==============================================================================

-- 1. Create public_health_early_warnings table
CREATE TABLE IF NOT EXISTS public_health_early_warnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    geographic_scope VARCHAR(50) NOT NULL DEFAULT 'phc', -- 'phc', 'taluka', 'district', 'village'
    location_id VARCHAR(100) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL DEFAULT 'Gadchiroli',
    taluka VARCHAR(100),
    village VARCHAR(100),
    signal_type VARCHAR(100) NOT NULL DEFAULT 'MULTI_SOURCE_SIGNAL',
    category VARCHAR(100) DEFAULT 'GENERAL',
    severity VARCHAR(50) NOT NULL DEFAULT 'INFO', -- 'INFO', 'LOW', 'MEDIUM', 'HIGH'
    confidence VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
    status VARCHAR(50) NOT NULL DEFAULT 'DETECTED', -- 'DETECTED', 'UNDER_REVIEW', 'VERIFIED', 'DISMISSED', 'RESOLVED'
    data_quality VARCHAR(50) NOT NULL DEFAULT 'HIGH', -- 'HIGH', 'MEDIUM', 'LOW', 'UNAVAILABLE', 'DATA_STALE'
    baseline_value NUMERIC(10, 2) DEFAULT 0.0,
    current_value NUMERIC(10, 2) DEFAULT 0.0,
    deviation_percentage NUMERIC(10, 2) DEFAULT 0.0,
    z_score NUMERIC(5, 2) DEFAULT 0.0,
    evidence JSONB DEFAULT '[]',
    contributing_sources TEXT[] DEFAULT '{}',
    ai_summary TEXT,
    ai_explanations JSONB DEFAULT '[]',
    ai_limitations JSONB DEFAULT '[]',
    recommended_review_questions JSONB DEFAULT '[]',
    reviewed_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_action VARCHAR(50),
    resolution_category VARCHAR(100),
    resolution_notes TEXT,
    dedup_key VARCHAR(255) UNIQUE,
    is_stale BOOLEAN DEFAULT FALSE,
    algorithm_version VARCHAR(50) DEFAULT 'v2.0-deterministic',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create community_asha_reports table (Structured community observations)
CREATE TABLE IF NOT EXISTS community_asha_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id VARCHAR(100),
    area_name VARCHAR(150) NOT NULL,
    village VARCHAR(100),
    taluka VARCHAR(100) DEFAULT 'Chamorshi',
    district VARCHAR(100) NOT NULL DEFAULT 'Gadchiroli',
    observation_type VARCHAR(100) NOT NULL, -- 'FEVER_CLUSTER', 'DIARRHEA_CASES', 'WATER_CONTAMINATION', 'SEASONAL_ILLNESS'
    reported_count INTEGER NOT NULL DEFAULT 1,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    source_role VARCHAR(50) DEFAULT 'ASHA',
    reporter_name VARCHAR(150),
    notes TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create public_health_reviews table (Immutable Supervisory Audit Ledger)
CREATE TABLE IF NOT EXISTS public_health_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warning_id UUID REFERENCES public_health_early_warnings(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'ACKNOWLEDGE', 'REQUEST_INVESTIGATION', 'VERIFY', 'DISMISS', 'RESOLVE', 'ADD_NOTE'
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    resolution_category VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Composite Indexes for Fast Performance & Dashboard Queries
CREATE INDEX IF NOT EXISTS idx_ph_early_warnings_geo ON public_health_early_warnings(district, taluka, location_id);
CREATE INDEX IF NOT EXISTS idx_ph_early_warnings_severity_status ON public_health_early_warnings(severity, status);
CREATE INDEX IF NOT EXISTS idx_ph_early_warnings_date ON public_health_early_warnings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ph_early_warnings_dedup ON public_health_early_warnings(dedup_key);
CREATE INDEX IF NOT EXISTS idx_community_asha_lookup ON community_asha_reports(district, phc_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_ph_reviews_warning_date ON public_health_reviews(warning_id, created_at DESC);

-- 5. Row Level Security (RLS) Enforcement
ALTER TABLE public_health_early_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_asha_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_health_reviews ENABLE ROW LEVEL SECURITY;

-- 5.1 Early Warnings Policies
DROP POLICY IF EXISTS "District Admin full access to public health early warnings" ON public_health_early_warnings;
CREATE POLICY "District Admin full access to public health early warnings" ON public_health_early_warnings
    FOR ALL
    USING (
        auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'district_admin'
        )
    );

DROP POLICY IF EXISTS "PHC Staff view assigned facility early warnings" ON public_health_early_warnings;
CREATE POLICY "PHC Staff view assigned facility early warnings" ON public_health_early_warnings
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('phc_staff', 'doctor')
            AND (profiles.assigned_phc_id::text = public_health_early_warnings.location_id OR public_health_early_warnings.geographic_scope = 'district')
        )
    );

DROP POLICY IF EXISTS "Service role manages early warnings" ON public_health_early_warnings;
CREATE POLICY "Service role manages early warnings" ON public_health_early_warnings
    FOR ALL
    USING (auth.role() = 'service_role');

-- 5.2 Community ASHA Reports Policies
DROP POLICY IF EXISTS "Health staff can read community ASHA reports" ON community_asha_reports;
CREATE POLICY "Health staff can read community ASHA reports" ON community_asha_reports
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
        )
    );

DROP POLICY IF EXISTS "Health workers and admins can submit community reports" ON community_asha_reports;
CREATE POLICY "Health workers and admins can submit community reports" ON community_asha_reports
    FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
        )
    );

-- 5.3 Public Health Reviews Policies
DROP POLICY IF EXISTS "Health staff can view public health review events" ON public_health_reviews;
CREATE POLICY "Health staff can view public health review events" ON public_health_reviews
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
        )
    );

DROP POLICY IF EXISTS "Supervisors can insert public health review events" ON public_health_reviews;
CREATE POLICY "Supervisors can insert public health review events" ON public_health_reviews
    FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
        )
    );
