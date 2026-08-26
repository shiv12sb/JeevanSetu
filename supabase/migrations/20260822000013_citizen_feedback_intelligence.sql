-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000013_citizen_feedback_intelligence.sql
-- Description: Phase 18 Citizen Feedback, Anonymous Ratings & Review Ledger
-- ==============================================================================

-- 1. Enhance Feedback Table with Lifecycle Status, Category & Internal Review
ALTER TABLE IF EXISTS feedback 
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'NEW', -- 'NEW', 'UNDER_REVIEW', 'ACKNOWLEDGED', 'RESOLVED', 'CLOSED'
    ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'SERVICE_QUALITY', -- 'SERVICE_QUALITY', 'MEDICINE_AVAILABILITY', 'WAITING_TIME', 'STAFF_BEHAVIOUR', 'FACILITY', 'REFERRAL_EXPERIENCE', 'ACCESSIBILITY', 'OTHER'
    ADD COLUMN IF NOT EXISTS internal_notes TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 2. Feedback Review Events Table (Immutable Audit Ledger)
CREATE TABLE IF NOT EXISTS feedback_review_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 'STATUS_UPDATED', 'ACKNOWLEDGED', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Composite Indexes for Performance & Search
CREATE INDEX IF NOT EXISTS idx_feedback_phc_category ON feedback(phc_id, category);
CREATE INDEX IF NOT EXISTS idx_feedback_hospital_category ON feedback(hospital_id, category);
CREATE INDEX IF NOT EXISTS idx_feedback_status_created ON feedback(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_anonymous_rating ON feedback(is_anonymous, rating);
CREATE INDEX IF NOT EXISTS idx_feedback_review_events_feedback_id ON feedback_review_events(feedback_id);

-- 4. Enable RLS
ALTER TABLE feedback_review_events ENABLE ROW LEVEL SECURITY;

-- 5. RLS: Only authorized health administrators and facility staff can view internal review events
DROP POLICY IF EXISTS "Authorized staff and admin can view feedback review events" ON feedback_review_events;
CREATE POLICY "Authorized staff and admin can view feedback review events" ON feedback_review_events
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'doctor', 'phc_staff', 'hospital_staff')
        )
    );

DROP POLICY IF EXISTS "Authorized staff and admin can insert feedback review events" ON feedback_review_events;
CREATE POLICY "Authorized staff and admin can insert feedback review events" ON feedback_review_events
    FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'doctor', 'phc_staff', 'hospital_staff')
        )
    );
