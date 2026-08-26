-- Migration 20260822000016_doctor_attendance_integrity.sql
-- JeevanSetu Phase 21: Doctor Presence & PHC Attendance Integrity

-- 1. Doctor Attendance Table
CREATE TABLE IF NOT EXISTS doctor_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    check_in_at TIMESTAMPTZ,
    check_out_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'CHECKED_IN', 'CHECKED_OUT', 'LATE', 'EARLY_CHECKOUT', 'ABSENT_REQUIRES_REVIEW', 'LEAVE', 'OFF_DUTY', 'INCOMPLETE'
    check_in_method VARCHAR(50) DEFAULT 'MANUAL', -- 'MANUAL', 'SYSTEM', 'AUTHENTICATED_APP', 'FUTURE_VERIFIED_METHOD'
    duty_duration_minutes INT DEFAULT 0,
    cases_created INT NOT NULL DEFAULT 0,
    cases_triaged INT NOT NULL DEFAULT 0,
    vitals_recorded INT NOT NULL DEFAULT 0,
    referrals_created INT NOT NULL DEFAULT 0,
    clinical_activity_count INT NOT NULL DEFAULT 0,
    mismatch_status VARCHAR(50) NOT NULL DEFAULT 'NORMAL_ACTIVITY', -- 'NORMAL_ACTIVITY', 'LOW_RECORDED_ACTIVITY', 'ATTENDANCE_NOT_RECORDED', 'LATE_CHECK_IN', 'EARLY_CHECKOUT', 'OUT_OF_WINDOW_ACTIVITY', 'ACTIVITY_ASSOCIATION_UNAVAILABLE', 'REQUIRES_REVIEW'
    explanation_category VARCHAR(50), -- 'OUTREACH', 'ADMINISTRATIVE_DUTY', 'EMERGENCY_DUTY', 'TRAINING', 'LEAVE', 'SYSTEM_ISSUE', 'OTHER'
    explanation_notes TEXT,
    review_status VARCHAR(50) NOT NULL DEFAULT 'NORMAL', -- 'NORMAL', 'FLAGGED', 'UNDER_REVIEW', 'EXPLAINED', 'CONFIRMED', 'DISMISSED'
    review_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    is_retroactive BOOLEAN NOT NULL DEFAULT FALSE,
    retroactive_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_duty_times CHECK (scheduled_end >= scheduled_start),
    CONSTRAINT chk_checkout_after_checkin CHECK (check_out_at IS NULL OR check_in_at IS NULL OR check_out_at >= check_in_at)
);

-- 2. Doctor Attendance Review Audit Trail
CREATE TABLE IF NOT EXISTS doctor_attendance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_id UUID NOT NULL REFERENCES doctor_attendance(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    previous_review_status VARCHAR(50) NOT NULL,
    new_review_status VARCHAR(50) NOT NULL,
    review_decision VARCHAR(50) NOT NULL, -- 'EXPLAINED', 'CONFIRMED_OPERATIONAL_GAP', 'DISMISSED_NO_ISSUE', 'UNDER_REVIEW'
    reason TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Performance & Deduplication Indexes
CREATE INDEX IF NOT EXISTS idx_doc_attendance_date ON doctor_attendance(doctor_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_doc_attendance_phc_date ON doctor_attendance(phc_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_doc_attendance_review ON doctor_attendance(review_status, mismatch_status);
CREATE INDEX IF NOT EXISTS idx_doc_attendance_reviews_att ON doctor_attendance_reviews(attendance_id);

-- 4. Row Level Security (RLS)
ALTER TABLE doctor_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_attendance_reviews ENABLE ROW LEVEL SECURITY;

-- Patients are strictly blocked from all attendance data
-- Doctors view their own attendance records
DROP POLICY IF EXISTS "Doctors view own attendance" ON doctor_attendance;
CREATE POLICY "Doctors view own attendance" ON doctor_attendance
    FOR SELECT USING (
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
    );

-- Doctors can check in / check out of their own scheduled duty
DROP POLICY IF EXISTS "Doctors update own attendance checkin" ON doctor_attendance;
CREATE POLICY "Doctors update own attendance checkin" ON doctor_attendance
    FOR UPDATE USING (
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
    );

-- PHC staff view and submit explanations for their assigned facility
DROP POLICY IF EXISTS "PHC staff view assigned facility attendance" ON doctor_attendance;
CREATE POLICY "PHC staff view assigned facility attendance" ON doctor_attendance
    FOR SELECT USING (
        phc_id IN (SELECT assigned_phc_id FROM profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "PHC staff update assigned facility attendance explanation" ON doctor_attendance;
CREATE POLICY "PHC staff update assigned facility attendance explanation" ON doctor_attendance
    FOR UPDATE USING (
        phc_id IN (SELECT assigned_phc_id FROM profiles WHERE id = auth.uid())
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('phc_staff', 'doctor'))
    );

-- District Admins view and manage all district attendance and reviews
DROP POLICY IF EXISTS "District admins manage all attendance" ON doctor_attendance;
CREATE POLICY "District admins manage all attendance" ON doctor_attendance
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'district_admin')
    );

DROP POLICY IF EXISTS "District admins manage attendance reviews" ON doctor_attendance_reviews;
CREATE POLICY "District admins manage attendance reviews" ON doctor_attendance_reviews
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'district_admin')
    );
