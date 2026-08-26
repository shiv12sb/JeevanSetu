-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000014_referral_continuity_intelligence.sql
-- Description: Phase 19 Referral Continuity, Patient Journey & Follow-Up Ledger
-- ==============================================================================

-- 1. Extend referrals table with patient journey acknowledgment & secure code
ALTER TABLE IF EXISTS referrals 
    ADD COLUMN IF NOT EXISTS patient_acknowledged_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS patient_response_status VARCHAR(50) DEFAULT 'NONE', -- 'NONE', 'RECEIVED_INFO', 'REACHED_FACILITY', 'CARE_RECEIVED', 'NEEDS_HELP', 'CANNOT_TRAVEL'
    ADD COLUMN IF NOT EXISTS qr_reference_code VARCHAR(100),
    ADD COLUMN IF NOT EXISTS digital_confirmation_status VARCHAR(50) DEFAULT 'PENDING'; -- 'PENDING', 'CONFIRMED', 'NO_DIGITAL_CONFIRMATION'

-- 2. Indexes for fast status and lookup queries
CREATE INDEX IF NOT EXISTS idx_referrals_patient_ack ON referrals(patient_acknowledged_at);
CREATE INDEX IF NOT EXISTS idx_referrals_digital_confirmation ON referrals(digital_confirmation_status);
CREATE INDEX IF NOT EXISTS idx_referrals_qr_code ON referrals(qr_reference_code);

-- 3. Update existing referral_events RLS policies to allow patients to record self-acknowledgement
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Patients can insert own referral journey events'
    ) THEN
        DROP POLICY IF EXISTS "Patients can insert own referral journey events" ON referral_events;
CREATE POLICY "Patients can insert own referral journey events" ON referral_events
            FOR INSERT
            WITH CHECK (
                auth.role() = 'service_role' OR EXISTS (
                    SELECT 1 FROM referrals
                    WHERE referrals.id = referral_events.referral_id
                    AND referrals.patient_id = auth.uid()
                )
            );
    END IF;
END $$;
