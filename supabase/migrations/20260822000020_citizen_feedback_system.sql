-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000020_citizen_feedback_system.sql
-- Description: Phase 26 Citizen Feedback, Missed-Call & Privacy-Preserving Access System
-- ==============================================================================

-- 1. Enhance Feedback Table with Tracking, Caller Masking, AI Metadata & Voice Records
ALTER TABLE IF EXISTS feedback
    ADD COLUMN IF NOT EXISTS tracking_token VARCHAR(64) UNIQUE,
    ADD COLUMN IF NOT EXISTS caller_hash VARCHAR(64),
    ADD COLUMN IF NOT EXISTS caller_phone_masked VARCHAR(50),
    ADD COLUMN IF NOT EXISTS ai_category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS ai_summary TEXT,
    ADD COLUMN IF NOT EXISTS ai_priority VARCHAR(20) DEFAULT 'medium',
    ADD COLUMN IF NOT EXISTS original_text TEXT,
    ADD COLUMN IF NOT EXISTS translated_text TEXT,
    ADD COLUMN IF NOT EXISTS facility_target_type VARCHAR(50) DEFAULT 'phc', -- 'phc', 'hospital', 'referral', 'general'
    ADD COLUMN IF NOT EXISTS district VARCHAR(100),
    ADD COLUMN IF NOT EXISTS taluka VARCHAR(100),
    ADD COLUMN IF NOT EXISTS pincode VARCHAR(20),
    ADD COLUMN IF NOT EXISTS voice_recording_url TEXT,
    ADD COLUMN IF NOT EXISTS voice_recording_duration_sec INT,
    ADD COLUMN IF NOT EXISTS has_voice_recording BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS spam_score NUMERIC(4,2) DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS assigned_to_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Feedback Interactions Table (Missed-Call, IVR & SMS Session State Machine)
CREATE TABLE IF NOT EXISTS feedback_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interaction_type VARCHAR(50) NOT NULL DEFAULT 'MISSED_CALL', -- 'MISSED_CALL', 'IVR', 'SMS', 'WEB'
    session_id VARCHAR(100) UNIQUE NOT NULL,
    caller_hash VARCHAR(64),
    caller_phone_masked VARCHAR(50),
    language VARCHAR(10) NOT NULL DEFAULT 'hi', -- 'hi', 'mr', 'en'
    current_step VARCHAR(50) NOT NULL DEFAULT 'INITIATED', -- 'INITIATED', 'FACILITY_SELECTED', 'RATING_RECORDED', 'CATEGORY_RECORDED', 'VOICE_RECORDED', 'COMPLETED', 'FAILED', 'EXPIRED'
    interaction_data JSONB DEFAULT '{}',
    provider_name VARCHAR(100) NOT NULL DEFAULT 'MockTelephonyProvider',
    provider_status VARCHAR(50) NOT NULL DEFAULT 'INITIALIZED', -- 'DELIVERED', 'PROVIDER_NOT_CONFIGURED', 'FAILED', 'COMPLETED'
    feedback_id UUID REFERENCES feedback(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Composite Indexes for Search, Scoping & Abuse Prevention
CREATE INDEX IF NOT EXISTS idx_feedback_tracking_token ON feedback(tracking_token);
CREATE INDEX IF NOT EXISTS idx_feedback_caller_hash ON feedback(caller_hash);
CREATE INDEX IF NOT EXISTS idx_feedback_phc_status ON feedback(phc_id, status);
CREATE INDEX IF NOT EXISTS idx_feedback_hospital_status ON feedback(hospital_id, status);
CREATE INDEX IF NOT EXISTS idx_feedback_category_status ON feedback(category, status);
CREATE INDEX IF NOT EXISTS idx_feedback_channel_created ON feedback(feedback_channel, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_interactions_session ON feedback_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_interactions_caller_hash ON feedback_interactions(caller_hash, created_at DESC);

-- 4. Enable RLS
ALTER TABLE feedback_interactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for feedback_interactions
DROP POLICY IF EXISTS "Service role manages feedback interactions" ON feedback_interactions;
CREATE POLICY "Service role manages feedback interactions" ON feedback_interactions
    FOR ALL
    USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Authorized staff view facility feedback interactions" ON feedback_interactions;
CREATE POLICY "Authorized staff view facility feedback interactions" ON feedback_interactions
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'phc_staff', 'hospital_staff', 'doctor')
        )
    );

-- 6. Updated Feedback Policies for Anonymous Tracking & Privacy
-- Note: Anyone can insert feedback via controlled API; anonymous lookups use tracking_token
DROP POLICY IF EXISTS "Public anonymous tracking lookup" ON feedback;
CREATE POLICY "Public anonymous tracking lookup" ON feedback
    FOR SELECT
    USING (
        tracking_token IS NOT NULL 
        OR auth.role() = 'service_role'
        OR (auth.uid() IS NOT NULL AND (
            patient_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND (
                    profiles.role = 'district_admin'
                    OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = feedback.phc_id)
                    OR (profiles.role = 'hospital_staff' AND profiles.assigned_hospital_id = feedback.hospital_id)
                )
            )
        ))
    );
