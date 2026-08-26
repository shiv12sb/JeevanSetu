-- Migration 20260822000017_referral_continuity_lifecycle.sql
-- JeevanSetu Phase 22: Referral Follow-Up & Treatment Completion Tracking

-- 1. Extend referrals table with treatment and continuity fields
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS treatment_status VARCHAR(50) DEFAULT 'NOT_STARTED';
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS treatment_summary TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS treatment_completed_at TIMESTAMPTZ;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS follow_up_due_date DATE;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS follow_up_status VARCHAR(50) DEFAULT 'NOT_REQUIRED';
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS follow_up_completed_at TIMESTAMPTZ;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS patient_acknowledgement_status VARCHAR(50) DEFAULT 'NONE';
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS hospital_confirmation_status VARCHAR(50) DEFAULT 'NONE';
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS transport_mode VARCHAR(50) DEFAULT 'SELF_TRANSPORT';
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS transport_state VARCHAR(50) DEFAULT 'NOT_REQUIRED';
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS stuck_status VARCHAR(50) DEFAULT 'NORMAL';
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(100);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS cancellation_notes TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS transfer_reason TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS previous_hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL;

-- 2. Performance & Lifecycle Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_treatment_status ON referrals(treatment_status);
CREATE INDEX IF NOT EXISTS idx_referrals_followup_status ON referrals(follow_up_status, follow_up_due_date);
CREATE INDEX IF NOT EXISTS idx_referrals_stuck_status ON referrals(stuck_status);
CREATE INDEX IF NOT EXISTS idx_referrals_hospital_status ON referrals(destination_hospital_id, status);
CREATE INDEX IF NOT EXISTS idx_referral_events_ref_time ON referral_events(referral_id, created_at DESC);

-- 3. Row Level Security Policies (RLS)
-- Ensure patient access is strictly scoped to own records
-- Ensure originating PHC staff and destination hospital staff can manage appropriate stages
-- Ensure District Admins have district-wide management permissions
