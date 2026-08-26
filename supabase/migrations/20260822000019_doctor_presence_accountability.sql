-- Migration: 20260822000019_doctor_presence_accountability.sql
-- Description: Phase 25 Doctor Presence & PHC Operational Accountability Schema

-- 1. Doctor Duty Schedules Table
CREATE TABLE IF NOT EXISTS doctor_duty_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE CASCADE,
    duty_date DATE NOT NULL DEFAULT CURRENT_DATE,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_schedule_window CHECK (scheduled_end > scheduled_start)
);

-- 2. Doctor Presence Sessions Table (Authoritative Server Time Check-In / Check-Out)
CREATE TABLE IF NOT EXISTS doctor_presence_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES doctor_duty_schedules(id) ON DELETE SET NULL,
    check_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_at TIMESTAMPTZ,
    duty_duration_minutes INT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'CHECKED_OUT', 'INCOMPLETE', 'INVALID'
    verification_method VARCHAR(50) NOT NULL DEFAULT 'authenticated_app', -- 'authenticated_app', 'facility_kiosk', 'manual_roster'
    total_encounters_count INT NOT NULL DEFAULT 0,
    last_encounter_at TIMESTAMPTZ,
    sync_status VARCHAR(50) NOT NULL DEFAULT 'SYNCED', -- 'SYNCED', 'PENDING_SYNC', 'DATA_STALE'
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_session_times CHECK (check_out_at IS NULL OR check_out_at >= check_in_at)
);

-- 3. Doctor Operational Flags Table (Non-Punitive Operational Review Indicators)
CREATE TABLE IF NOT EXISTS doctor_operational_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE CASCADE,
    duty_session_id UUID REFERENCES doctor_presence_sessions(id) ON DELETE CASCADE,
    anomaly_type VARCHAR(100) NOT NULL, -- 'NO_ENCOUNTERS_DURING_DUTY', 'CHECKIN_WITHOUT_SCHEDULE', 'UNUSUAL_SESSION_DURATION', 'MISSING_CHECKOUT', 'MULTIPLE_ACTIVE_SESSIONS', 'ENCOUNTER_OUTSIDE_DUTY_WINDOW'
    severity VARCHAR(50) NOT NULL DEFAULT 'LOW', -- 'INFO', 'LOW', 'MEDIUM', 'HIGH' (Never 'CRITICAL')
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'
    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    evidence_summary TEXT NOT NULL,
    explanation_category VARCHAR(50), -- 'OUTREACH', 'ADMIN_DUTY', 'TRAINING', 'EMERGENCY_DEPLOYMENT', 'NETWORK_OUTAGE', 'PHC_CLOSED', 'LEAVE', 'OTHER'
    review_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    metrics JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Doctor Operational Reviews Audit Ledger
CREATE TABLE IF NOT EXISTS doctor_operational_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_id UUID NOT NULL REFERENCES doctor_operational_flags(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    action VARCHAR(50) NOT NULL, -- 'ACKNOWLEDGE', 'DISMISS', 'RESOLVE', 'ADD_NOTE'
    notes TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_duty_schedules_doc_date ON doctor_duty_schedules(doctor_id, duty_date);
CREATE INDEX IF NOT EXISTS idx_duty_schedules_phc_date ON doctor_duty_schedules(phc_id, duty_date);
CREATE INDEX IF NOT EXISTS idx_duty_schedules_status ON doctor_duty_schedules(status);

CREATE INDEX IF NOT EXISTS idx_presence_sessions_doc_status ON doctor_presence_sessions(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_presence_sessions_phc_status ON doctor_presence_sessions(phc_id, status);
CREATE INDEX IF NOT EXISTS idx_presence_sessions_checkin ON doctor_presence_sessions(check_in_at);

CREATE INDEX IF NOT EXISTS idx_operational_flags_doc_status ON doctor_operational_flags(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_operational_flags_phc_status ON doctor_operational_flags(phc_id, status);
CREATE INDEX IF NOT EXISTS idx_operational_flags_severity ON doctor_operational_flags(severity, status);

CREATE INDEX IF NOT EXISTS idx_operational_reviews_flag ON doctor_operational_reviews(flag_id);

-- 6. Row Level Security (RLS)
ALTER TABLE doctor_duty_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_presence_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_operational_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_operational_reviews ENABLE ROW LEVEL SECURITY;

-- Block patient and public access completely
DROP POLICY IF EXISTS "Patients blocked from duty schedules" ON doctor_duty_schedules;
CREATE POLICY "Patients blocked from duty schedules" ON doctor_duty_schedules
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'phc_staff', 'district_admin'))
    );

DROP POLICY IF EXISTS "Patients blocked from presence sessions" ON doctor_presence_sessions;
CREATE POLICY "Patients blocked from presence sessions" ON doctor_presence_sessions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'phc_staff', 'district_admin'))
    );

DROP POLICY IF EXISTS "Patients blocked from operational flags" ON doctor_operational_flags;
CREATE POLICY "Patients blocked from operational flags" ON doctor_operational_flags
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'phc_staff', 'district_admin'))
    );

DROP POLICY IF EXISTS "Patients blocked from operational reviews" ON doctor_operational_reviews;
CREATE POLICY "Patients blocked from operational reviews" ON doctor_operational_reviews
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('phc_staff', 'district_admin'))
    );

-- Doctors: View own schedules, sessions, and non-punitive flags
DROP POLICY IF EXISTS "Doctors view own schedules" ON doctor_duty_schedules;
CREATE POLICY "Doctors view own schedules" ON doctor_duty_schedules
    FOR SELECT USING (
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
    );

DROP POLICY IF EXISTS "Doctors view and update own presence sessions" ON doctor_presence_sessions;
CREATE POLICY "Doctors view and update own presence sessions" ON doctor_presence_sessions
    FOR ALL USING (
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
    );

DROP POLICY IF EXISTS "Doctors view own operational flags" ON doctor_operational_flags;
CREATE POLICY "Doctors view own operational flags" ON doctor_operational_flags
    FOR SELECT USING (
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
    );

-- PHC Staff: View and manage schedules and operational flags for assigned PHC
DROP POLICY IF EXISTS "PHC staff view assigned PHC schedules" ON doctor_duty_schedules;
CREATE POLICY "PHC staff view assigned PHC schedules" ON doctor_duty_schedules
    FOR SELECT USING (
        phc_id IN (SELECT assigned_phc_id FROM profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "PHC staff view assigned PHC sessions" ON doctor_presence_sessions;
CREATE POLICY "PHC staff view assigned PHC sessions" ON doctor_presence_sessions
    FOR SELECT USING (
        phc_id IN (SELECT assigned_phc_id FROM profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "PHC staff view and review assigned PHC flags" ON doctor_operational_flags;
CREATE POLICY "PHC staff view and review assigned PHC flags" ON doctor_operational_flags
    FOR ALL USING (
        phc_id IN (SELECT assigned_phc_id FROM profiles WHERE id = auth.uid())
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('phc_staff', 'doctor'))
    );

-- District Admin: District-wide administrative oversight across all tables
DROP POLICY IF EXISTS "District admins manage all duty schedules" ON doctor_duty_schedules;
CREATE POLICY "District admins manage all duty schedules" ON doctor_duty_schedules
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'district_admin')
    );

DROP POLICY IF EXISTS "District admins manage all presence sessions" ON doctor_presence_sessions;
CREATE POLICY "District admins manage all presence sessions" ON doctor_presence_sessions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'district_admin')
    );

DROP POLICY IF EXISTS "District admins manage all operational flags" ON doctor_operational_flags;
CREATE POLICY "District admins manage all operational flags" ON doctor_operational_flags
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'district_admin')
    );

DROP POLICY IF EXISTS "District admins manage all operational reviews" ON doctor_operational_reviews;
CREATE POLICY "District admins manage all operational reviews" ON doctor_operational_reviews
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'district_admin')
    );
