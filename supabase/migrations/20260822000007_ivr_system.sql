-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000007_ivr_system.sql
-- Description: IVR No-Smartphone Health Access Tables & Security Policies
-- ==============================================================================

-- 1. IVR Sessions Table (Short-lived state tracking)
CREATE TABLE IF NOT EXISTS ivr_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL UNIQUE,
    caller_phone VARCHAR(50) NOT NULL,
    caller_phone_masked VARCHAR(50) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'hi', -- 'hi', 'mr', 'en'
    current_menu VARCHAR(50) NOT NULL DEFAULT 'language_select',
    step VARCHAR(50) NOT NULL DEFAULT 'root',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    failed_attempts INT NOT NULL DEFAULT 0,
    session_data JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. IVR Call Logs Table (Operational aggregate metrics & debugging)
CREATE TABLE IF NOT EXISTS ivr_call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL,
    caller_phone_masked VARCHAR(50) NOT NULL,
    language VARCHAR(10) NOT NULL,
    flow_outcome VARCHAR(50) NOT NULL, -- 'completed', 'emergency_routed', 'followup_requested', 'timeout', 'abandoned', 'invalid_attempts_exceeded'
    duration_seconds INT NOT NULL DEFAULT 0,
    menus_navigated JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. IVR Follow-Up / Callback Requests Table (Staff Queue)
CREATE TABLE IF NOT EXISTS ivr_followup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_phone VARCHAR(50) NOT NULL,
    caller_phone_masked VARCHAR(50) NOT NULL,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'hi',
    patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_phc_id UUID REFERENCES phcs(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'contacted', 'resolved'
    assigned_staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    staff_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ivr_sessions_session_id ON ivr_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_ivr_sessions_expires_at ON ivr_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_ivr_call_logs_created_at ON ivr_call_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ivr_call_logs_language ON ivr_call_logs(language);
CREATE INDEX IF NOT EXISTS idx_ivr_followup_phc_id ON ivr_followup_requests(assigned_phc_id);
CREATE INDEX IF NOT EXISTS idx_ivr_followup_status ON ivr_followup_requests(status);

-- Enable Row Level Security
ALTER TABLE ivr_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ivr_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ivr_followup_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Service Role and System access for sessions
DROP POLICY IF EXISTS "System and authorized staff can manage IVR sessions" ON ivr_sessions;
CREATE POLICY "System and authorized staff can manage IVR sessions" ON ivr_sessions
    FOR ALL
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'phc_staff', 'doctor')
        )
    );

-- RLS: District Admin and Staff can view aggregate call logs
DROP POLICY IF EXISTS "Authorized staff can view IVR call logs" ON ivr_call_logs;
CREATE POLICY "Authorized staff can view IVR call logs" ON ivr_call_logs
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'phc_staff', 'doctor')
        )
    );

-- RLS: PHC Staff and Admin can view and manage callback requests
DROP POLICY IF EXISTS "Authorized PHC staff can view callback requests" ON ivr_followup_requests;
CREATE POLICY "Authorized PHC staff can view callback requests" ON ivr_followup_requests
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'district_admin'
                OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = ivr_followup_requests.assigned_phc_id)
            )
        )
    );

DROP POLICY IF EXISTS "Authorized PHC staff can update callback requests" ON ivr_followup_requests;
CREATE POLICY "Authorized PHC staff can update callback requests" ON ivr_followup_requests
    FOR UPDATE
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'district_admin'
                OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = ivr_followup_requests.assigned_phc_id)
            )
        )
    );
