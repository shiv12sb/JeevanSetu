-- Migration 20260822000011_doctor_presence.sql
-- JeevanSetu Phase 16: Doctor Presence & PHC Service Availability Intelligence

-- 1. Doctor Duty Sessions Table
CREATE TABLE IF NOT EXISTS doctor_duty_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES phcs(id) ON DELETE SET NULL,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    facility_type VARCHAR(50) NOT NULL DEFAULT 'phc', -- 'phc' or 'hospital'
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    check_in_at TIMESTAMPTZ,
    check_out_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'CHECKED_IN', 'ON_DUTY', 'CHECKED_OUT', 'LEAVE', 'AUTHORIZED_EXTERNAL_DUTY', 'DATA_PENDING', 'REVIEW_REQUIRED'
    verification_method VARCHAR(50) DEFAULT 'authenticated_app', -- 'authenticated_app', 'facility_staff_verified', 'manual_roster'
    duty_type VARCHAR(50) DEFAULT 'OPD_GENERAL', -- 'OPD_GENERAL', 'EMERGENCY_ON_CALL', 'OUTREACH_CAMP', 'VACCINATION_DRIVE', 'ADMINISTRATIVE'
    total_cases_count INT NOT NULL DEFAULT 0,
    total_vitals_count INT NOT NULL DEFAULT 0,
    total_referrals_count INT NOT NULL DEFAULT 0,
    first_activity_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    max_gap_hours NUMERIC(4, 2) DEFAULT 0.0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Doctor Presence Operational Signals Table
CREATE TABLE IF NOT EXISTS doctor_presence_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    duty_session_id UUID REFERENCES doctor_duty_sessions(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES phcs(id) ON DELETE SET NULL,
    signal_type VARCHAR(100) NOT NULL, -- 'SCHEDULED_NOT_CHECKED_IN', 'CHECK_IN_NO_RECORDED_ACTIVITY', 'CHECK_IN_LOW_ACTIVITY', 'ACTIVITY_GAP_DETECTED', 'MISSING_CHECK_OUT', 'DATA_PENDING_CONNECTIVITY'
    severity VARCHAR(50) NOT NULL DEFAULT 'LOW', -- 'INFO', 'LOW', 'MEDIUM', 'HIGH'
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'ACKNOWLEDGED', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'
    description TEXT NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}',
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    resolution VARCHAR(50), -- 'CONFIRMED_DATA_ISSUE', 'CONFIRMED_OPERATIONAL_GAP', 'AUTHORIZED_REASON', 'NO_ISSUE', 'REQUIRES_FOLLOW_UP'
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Doctor Presence Reviews Audit Ledger
CREATE TABLE IF NOT EXISTS doctor_presence_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID NOT NULL REFERENCES doctor_presence_signals(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    decision VARCHAR(50) NOT NULL, -- 'CONFIRMED_DATA_ISSUE', 'CONFIRMED_OPERATIONAL_GAP', 'AUTHORIZED_REASON', 'NO_ISSUE', 'REQUIRES_FOLLOW_UP'
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Composite Indexes for Fast Querying
CREATE INDEX IF NOT EXISTS idx_duty_sessions_doc_date ON doctor_duty_sessions(doctor_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_duty_sessions_facility_status ON doctor_duty_sessions(facility_id, status);
CREATE INDEX IF NOT EXISTS idx_presence_signals_status ON doctor_presence_signals(status, severity);
CREATE INDEX IF NOT EXISTS idx_presence_signals_doc_fac ON doctor_presence_signals(doctor_id, facility_id);

-- 5. Row Level Security (RLS) Policies
ALTER TABLE doctor_duty_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_presence_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_presence_reviews ENABLE ROW LEVEL SECURITY;

-- Duty Sessions RLS:
-- Doctors view own sessions
DROP POLICY IF EXISTS "Doctors view own duty sessions" ON doctor_duty_sessions;
CREATE POLICY "Doctors view own duty sessions" ON doctor_duty_sessions
    FOR SELECT USING (
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
    );

-- PHC staff view assigned facility sessions
DROP POLICY IF EXISTS "PHC staff view assigned facility duty sessions" ON doctor_duty_sessions;
CREATE POLICY "PHC staff view assigned facility duty sessions" ON doctor_duty_sessions
    FOR SELECT USING (
        facility_id IN (SELECT assigned_phc_id FROM profiles WHERE id = auth.uid())
    );

-- District Admins view and manage all sessions
DROP POLICY IF EXISTS "District admins view and manage duty sessions" ON doctor_duty_sessions;
CREATE POLICY "District admins view and manage duty sessions" ON doctor_duty_sessions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'district_admin')
    );

-- Presence Signals RLS:
-- District admins and facility supervisors manage signals
DROP POLICY IF EXISTS "District admins view and manage presence signals" ON doctor_presence_signals;
CREATE POLICY "District admins view and manage presence signals" ON doctor_presence_signals
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('district_admin', 'phc_staff'))
    );

-- Doctors view own non-punitive signals
DROP POLICY IF EXISTS "Doctors view own presence signals" ON doctor_presence_signals;
CREATE POLICY "Doctors view own presence signals" ON doctor_presence_signals
    FOR SELECT USING (
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
    );

-- Presence Reviews RLS:
DROP POLICY IF EXISTS "District admins manage presence reviews" ON doctor_presence_reviews;
CREATE POLICY "District admins manage presence reviews" ON doctor_presence_reviews
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'district_admin')
    );
