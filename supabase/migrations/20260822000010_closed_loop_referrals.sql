-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000010_closed_loop_referrals.sql
-- Description: Closed-Loop Referral Lifecycle, Transport Tracking, and Post-Care Follow-Up
-- ==============================================================================

-- 1. Extend referrals table with closed-loop tracking fields
ALTER TABLE referrals 
    ADD COLUMN IF NOT EXISTS transport_status VARCHAR(50) DEFAULT 'not_required', -- not_required, requested, assigned, in_transit, completed
    ADD COLUMN IF NOT EXISTS follow_up_date DATE,
    ADD COLUMN IF NOT EXISTS follow_up_facility_id UUID REFERENCES phcs(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS follow_up_notes TEXT,
    ADD COLUMN IF NOT EXISTS delay_status VARCHAR(50) DEFAULT 'NORMAL', -- NORMAL, PENDING, DELAYED, FOLLOW_UP_OVERDUE, NO_CONFIRMATION
    ADD COLUMN IF NOT EXISTS expected_arrival_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- 2. Indexes for fast facility and status queries
CREATE INDEX IF NOT EXISTS idx_referrals_dest_status ON referrals(destination_hospital_id, status);
CREATE INDEX IF NOT EXISTS idx_referrals_orig_status ON referrals(originating_phc_id, status);
CREATE INDEX IF NOT EXISTS idx_referrals_delay_status ON referrals(delay_status);
CREATE INDEX IF NOT EXISTS idx_referrals_follow_up_date ON referrals(follow_up_date);

-- 3. RLS: NGO transport staff can view and update transport-assigned referrals
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'NGO staff can view assigned transport referrals'
    ) THEN
        DROP POLICY IF EXISTS "NGO staff can view assigned transport referrals" ON referrals;
CREATE POLICY "NGO staff can view assigned transport referrals" ON referrals
            FOR SELECT
            USING (
                auth.role() = 'service_role' OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'ngo_staff'
                    AND profiles.assigned_ngo_id = referrals.ngo_transport_id
                )
            );
    END IF;
END $$;
