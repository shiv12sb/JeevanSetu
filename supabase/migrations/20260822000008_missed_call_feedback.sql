-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000008_missed_call_feedback.sql
-- Description: Anonymous Missed-Call Feedback, Channel Metadata, Quality Signals & RLS
-- ==============================================================================

-- 1. Enhance Feedback Table with Channel, Language and Service Metadata
ALTER TABLE feedback 
ADD COLUMN IF NOT EXISTS feedback_channel VARCHAR(50) NOT NULL DEFAULT 'WEB', -- 'WEB', 'IVR', 'MISSED_CALL'
ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'hi', -- 'hi', 'mr', 'en'
ADD COLUMN IF NOT EXISTS service_tag VARCHAR(50) DEFAULT 'general', -- 'waiting_time', 'staff_behaviour', 'doctor_availability', 'medicine_stock', 'cleanliness', 'referral_speed', 'other'
ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(50) NOT NULL DEFAULT 'approved'; -- 'approved', 'flagged', 'hidden'

-- 2. Feedback Operational Quality Signals Table
CREATE TABLE IF NOT EXISTS feedback_quality_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_type VARCHAR(50) NOT NULL, -- 'phc' or 'hospital'
    phc_id UUID REFERENCES phcs(id) ON DELETE SET NULL,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    signal_type VARCHAR(100) NOT NULL, -- 'negative_rating_spike', 'medicine_complaint_cluster', 'waiting_time_alert'
    severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'under_review', 'resolved'
    acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_channel_created ON feedback(feedback_channel, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_service_tag ON feedback(service_tag);
CREATE INDEX IF NOT EXISTS idx_feedback_quality_signals_facility ON feedback_quality_signals(phc_id, hospital_id);
CREATE INDEX IF NOT EXISTS idx_feedback_quality_signals_status ON feedback_quality_signals(status);

-- Enable RLS for quality signals
ALTER TABLE feedback_quality_signals ENABLE ROW LEVEL SECURITY;

-- RLS: Quality Signals read access
DROP POLICY IF EXISTS "Authorized staff and admin can view quality signals" ON feedback_quality_signals;
CREATE POLICY "Authorized staff and admin can view quality signals" ON feedback_quality_signals
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'district_admin'
                OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = feedback_quality_signals.phc_id)
                OR (profiles.role = 'hospital_staff' AND profiles.assigned_hospital_id = feedback_quality_signals.hospital_id)
            )
        )
    );

-- RLS: Quality Signals update access (acknowledgement / review)
DROP POLICY IF EXISTS "Authorized staff and admin can update quality signals" ON feedback_quality_signals;
CREATE POLICY "Authorized staff and admin can update quality signals" ON feedback_quality_signals
    FOR UPDATE
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'district_admin'
                OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = feedback_quality_signals.phc_id)
                OR (profiles.role = 'hospital_staff' AND profiles.assigned_hospital_id = feedback_quality_signals.hospital_id)
            )
        )
    );
