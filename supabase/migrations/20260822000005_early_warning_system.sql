-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000005_early_warning_system.sql
-- Description: Health Early-Warning System Tables & RLS Policies
-- ==============================================================================

-- 1. Early-Warning Signals Table
CREATE TABLE IF NOT EXISTS early_warning_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID REFERENCES phcs(id) ON DELETE CASCADE,
    district VARCHAR(100) NOT NULL,
    taluka VARCHAR(100),
    signal_type VARCHAR(100) NOT NULL, -- syndromic_case_surge, medicine_consumption_surge, multi_signal_anomaly
    time_window VARCHAR(50) NOT NULL DEFAULT '7_days',
    observed_value NUMERIC(10, 2) NOT NULL,
    baseline_value NUMERIC(10, 2) NOT NULL,
    deviation_percentage NUMERIC(6, 2) NOT NULL,
    z_score NUMERIC(5, 2),
    signal_level VARCHAR(50) NOT NULL DEFAULT 'WATCH', -- NORMAL, WATCH, ELEVATED, HIGH, INSUFFICIENT_DATA
    data_quality VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW, INSUFFICIENT_DATA
    status VARCHAR(50) NOT NULL DEFAULT 'new', -- new, acknowledged, under_review, resolved
    contributing_sources JSONB DEFAULT '[]',
    notes TEXT,
    reviewed_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Early-Warning Review Events Table (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS early_warning_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID NOT NULL REFERENCES early_warning_signals(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- SIGNAL_DETECTED, ACKNOWLEDGED, STATUS_UPDATED, RESOLVED
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_early_warning_signals_district ON early_warning_signals(district);
CREATE INDEX IF NOT EXISTS idx_early_warning_signals_phc_id ON early_warning_signals(phc_id);
CREATE INDEX IF NOT EXISTS idx_early_warning_signals_status ON early_warning_signals(status);
CREATE INDEX IF NOT EXISTS idx_early_warning_signals_signal_level ON early_warning_signals(signal_level);
CREATE INDEX IF NOT EXISTS idx_early_warning_events_signal_id ON early_warning_events(signal_id);

-- Enable RLS
ALTER TABLE early_warning_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_warning_events ENABLE ROW LEVEL SECURITY;

-- RLS: Only authorized health administrators, doctors, and facility staff can view operational signals
DROP POLICY IF EXISTS "Authorized health staff can view early-warning signals" ON early_warning_signals;
CREATE POLICY "Authorized health staff can view early-warning signals" ON early_warning_signals
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND (
                    profiles.role IN ('district_admin', 'doctor')
                    OR (profiles.role = 'phc_staff' AND profiles.assigned_phc_id = early_warning_signals.phc_id)
                )
            )
        )
    );

DROP POLICY IF EXISTS "System background jobs and admins can manage signals" ON early_warning_signals;
CREATE POLICY "System background jobs and admins can manage signals" ON early_warning_signals
    FOR ALL
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
        )
    );

DROP POLICY IF EXISTS "Authorized staff can view review events" ON early_warning_events;
CREATE POLICY "Authorized staff can view review events" ON early_warning_events
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

DROP POLICY IF EXISTS "Authorized staff can insert review events" ON early_warning_events;
CREATE POLICY "Authorized staff can insert review events" ON early_warning_events
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
            )
        )
    );
