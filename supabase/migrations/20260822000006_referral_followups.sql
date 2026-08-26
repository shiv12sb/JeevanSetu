-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000006_referral_followups.sql
-- Description: Referral Follow-Up Intelligence Tables & RLS Policies
-- ==============================================================================

-- 1. Referral Follow-Ups Table
CREATE TABLE IF NOT EXISTS referral_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL UNIQUE REFERENCES referrals(id) ON DELETE CASCADE,
    current_stage VARCHAR(50) NOT NULL,
    expected_stage VARCHAR(50) NOT NULL,
    follow_up_status VARCHAR(50) NOT NULL DEFAULT 'MONITORING', -- NOT_REQUIRED, MONITORING, FOLLOW_UP_DUE, OVERDUE, ESCALATED, RESOLVED
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    due_at TIMESTAMPTZ NOT NULL,
    overdue_at TIMESTAMPTZ NOT NULL,
    escalated_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    last_reminder_at TIMESTAMPTZ,
    assigned_phc_id UUID REFERENCES phcs(id) ON DELETE SET NULL,
    assigned_hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    notes TEXT,
    manual_override_reason TEXT,
    override_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Referral Follow-Up Events (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS referral_followup_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    followup_id UUID NOT NULL REFERENCES referral_followups(id) ON DELETE CASCADE,
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- INITIALIZED, STATUS_CHANGED, REMINDER_SENT, ESCALATED, MANUAL_RESOLVED
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_followups_referral_id ON referral_followups(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_followups_status ON referral_followups(follow_up_status);
CREATE INDEX IF NOT EXISTS idx_referral_followups_due_at ON referral_followups(due_at);
CREATE INDEX IF NOT EXISTS idx_referral_followups_assigned_phc ON referral_followups(assigned_phc_id);
CREATE INDEX IF NOT EXISTS idx_referral_followups_assigned_hosp ON referral_followups(assigned_hospital_id);
CREATE INDEX IF NOT EXISTS idx_referral_followup_events_followup_id ON referral_followup_events(followup_id);

-- Enable RLS
ALTER TABLE referral_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_followup_events ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated healthcare staff, doctors, and admins can view follow-ups for their facility/district
DROP POLICY IF EXISTS "Authorized staff can view referral follow-ups" ON referral_followups;
CREATE POLICY "Authorized staff can view referral follow-ups" ON referral_followups
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND (
                    profiles.role IN ('district_admin', 'doctor')
                    OR (profiles.role = 'phc_staff' AND profiles.assigned_phc_id = referral_followups.assigned_phc_id)
                    OR (profiles.role = 'hospital_staff' AND profiles.assigned_hospital_id = referral_followups.assigned_hospital_id)
                    OR (profiles.role = 'patient' AND EXISTS (
                        SELECT 1 FROM referrals WHERE referrals.id = referral_followups.referral_id AND referrals.patient_id = auth.uid()
                    ))
                )
            )
        )
    );

DROP POLICY IF EXISTS "System background jobs and authorized staff can update follow-ups" ON referral_followups;
CREATE POLICY "System background jobs and authorized staff can update follow-ups" ON referral_followups
    FOR ALL
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'doctor', 'phc_staff', 'hospital_staff')
        )
    );

DROP POLICY IF EXISTS "Authorized staff can view follow-up events" ON referral_followup_events;
CREATE POLICY "Authorized staff can view follow-up events" ON referral_followup_events
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('district_admin', 'doctor', 'phc_staff', 'hospital_staff')
            )
        )
    );

DROP POLICY IF EXISTS "Authorized staff can insert follow-up events" ON referral_followup_events;
CREATE POLICY "Authorized staff can insert follow-up events" ON referral_followup_events
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('district_admin', 'doctor', 'phc_staff', 'hospital_staff')
            )
        )
    );
