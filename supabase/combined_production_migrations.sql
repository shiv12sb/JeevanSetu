-- ========================================================
-- JEEVANSETU COMPLETE PRODUCTION DATABASE MIGRATIONS (1-22)
-- ========================================================


-- ========================================================
-- MIGRATION: 20260822000001_initial_schema.sql
-- ========================================================

-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000001_initial_schema.sql
-- Description: Core relational schema, enum types, constraints & updated_at trigger
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Controlled ENUM Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'patient',
        'phc_staff',
        'doctor',
        'hospital_staff',
        'ngo_staff',
        'district_admin'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE case_urgency AS ENUM (
        'routine',
        'urgent',
        'emergency'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE case_status AS ENUM (
        'open',
        'referred',
        'in_treatment',
        'resolved',
        'closed'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE referral_status AS ENUM (
        'created',
        'patient_notified',
        'destination_accepted',
        'patient_reached',
        'treatment_started',
        'completed',
        'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE feedback_category AS ENUM (
        'phc_visit',
        'medicine_stock',
        'referral_speed',
        'scheme_support',
        'general'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'referral_update',
        'medicine_stock_alert',
        'doctor_duty_alert',
        'system_alert'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. Automatic updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Facility Tables (PHCs and Hospitals)
CREATE TABLE IF NOT EXISTS phcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    address TEXT,
    village VARCHAR(100),
    taluka VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    pincode VARCHAR(10),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    operational_hours VARCHAR(100) DEFAULT '24x7 Emergency / 09:00 - 17:00 OPD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    hospital_type VARCHAR(100) NOT NULL DEFAULT 'District Civil Hospital', -- District Hospital, Sub-District, Medical College
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    address TEXT,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    pincode VARCHAR(10),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    total_beds INT NOT NULL DEFAULT 0,
    icu_beds INT NOT NULL DEFAULT 0,
    empanelled_schemes TEXT[] DEFAULT '{}',
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hospital_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    service_name VARCHAR(150) NOT NULL, -- e.g. Cardiology OPD, Dialysis Unit, Neonatal ICU
    doctor_on_duty_status VARCHAR(50) DEFAULT 'Available',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. User Profiles (Decoupled from auth for modularity)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE, -- Reserved for future Supabase auth.users linking
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    village VARCHAR(100),
    taluka VARCHAR(100),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    pincode VARCHAR(10),
    assigned_phc_id UUID REFERENCES phcs(id) ON DELETE SET NULL,
    assigned_hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    assigned_ngo_id UUID,
    abha_id VARCHAR(50),
    ration_card_number VARCHAR(50),
    pmjay_status VARCHAR(50) DEFAULT 'Eligible',
    emergency_contact VARCHAR(255),
    role user_role NOT NULL DEFAULT 'patient',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Doctors Registry
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    medical_council_id VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    facility_type VARCHAR(50) NOT NULL, -- 'phc' or 'hospital'
    phc_id UUID REFERENCES phcs(id) ON DELETE SET NULL,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    is_on_duty BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. NGOs & Charitable Trust Partners
CREATE TABLE IF NOT EXISTS ngos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_darpan_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    aid_focus TEXT[] NOT NULL DEFAULT '{}',
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    coordinator_name VARCHAR(255),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_profiles_ngo'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT fk_profiles_ngo FOREIGN KEY (assigned_ngo_id) REFERENCES ngos(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 8. Government Healthcare Assistance Schemes
CREATE TABLE IF NOT EXISTS government_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. PMJAY, MJPJAY, JSSK
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    benefits_summary TEXT,
    eligibility_criteria TEXT[] DEFAULT '{}',
    official_portal_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Patient Healthcare Cases
CREATE TABLE IF NOT EXISTS health_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. JVS-MH-7A82K1
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    caregiver_mode VARCHAR(50) DEFAULT 'myself', -- myself, family, dependent
    primary_concern TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- Cardiology, Maternal, Respiratory, Orthopedic, etc.
    urgency case_urgency NOT NULL DEFAULT 'routine',
    status case_status NOT NULL DEFAULT 'open',
    initial_phc_id UUID REFERENCES phcs(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_case_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES health_cases(id) ON DELETE CASCADE,
    systolic_bp INT,
    diastolic_bp INT,
    blood_sugar NUMERIC(6, 2),
    hemoglobin NUMERIC(4, 2),
    temperature NUMERIC(4, 1),
    pulse_rate INT,
    notes TEXT,
    recorded_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Multi-Stage Referral Coordination
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. REF-2026-001
    case_id UUID NOT NULL REFERENCES health_cases(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    originating_phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE RESTRICT,
    destination_hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
    required_specialty VARCHAR(150) NOT NULL,
    clinical_summary TEXT NOT NULL,
    status referral_status NOT NULL DEFAULT 'created',
    priority case_urgency NOT NULL DEFAULT 'urgent',
    estimated_travel_distance_km NUMERIC(6, 2),
    ngo_transport_id UUID REFERENCES ngos(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    stage referral_status NOT NULL,
    event_title VARCHAR(255) NOT NULL,
    note TEXT,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PHC Medicine Master & Inventory
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    dosage_form VARCHAR(50) NOT NULL, -- Tablet, Syrup, Injection, Sachet
    standard_unit VARCHAR(50) NOT NULL, -- strips, vials, sachets
    description TEXT,
    is_essential BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicine_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
    current_quantity INT NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
    minimum_threshold INT NOT NULL DEFAULT 100 CHECK (minimum_threshold >= 0),
    batch_number VARCHAR(100),
    expiry_date DATE,
    last_restocked_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (phc_id, medicine_id)
);

CREATE TABLE IF NOT EXISTS medicine_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
    quantity_consumed INT NOT NULL CHECK (quantity_consumed > 0),
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    usage_context VARCHAR(100) DEFAULT 'OPD Dispensation', -- OPD, Emergency, Camp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Citizen Feedback
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES health_cases(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    facility_type VARCHAR(50) NOT NULL, -- phc or hospital
    phc_id UUID REFERENCES phcs(id) ON DELETE SET NULL,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    category feedback_category NOT NULL DEFAULT 'general',
    message TEXT NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'submitted', -- submitted, reviewed, action_taken
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. System Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'in_app', -- in_app, sms, whatsapp
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'sent', -- pending, sent, delivered, failed
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g. CASE_CREATED, REFERRAL_ACCEPTED, INVENTORY_UPDATED
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Attach updated_at Triggers
DROP TRIGGER IF EXISTS update_phcs_updated_at ON phcs;
CREATE TRIGGER update_phcs_updated_at BEFORE UPDATE ON phcs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hospitals_updated_at ON hospitals;
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hospital_services_updated_at ON hospital_services;
CREATE TRIGGER update_hospital_services_updated_at BEFORE UPDATE ON hospital_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_doctors_updated_at ON doctors;
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ngos_updated_at ON ngos;
CREATE TRIGGER update_ngos_updated_at BEFORE UPDATE ON ngos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_government_schemes_updated_at ON government_schemes;
CREATE TRIGGER update_government_schemes_updated_at BEFORE UPDATE ON government_schemes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_cases_updated_at ON health_cases;
CREATE TRIGGER update_health_cases_updated_at BEFORE UPDATE ON health_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_referrals_updated_at ON referrals;
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medicines_updated_at ON medicines;
CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON medicines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medicine_inventory_updated_at ON medicine_inventory;
CREATE TRIGGER update_medicine_inventory_updated_at BEFORE UPDATE ON medicine_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ========================================================
-- MIGRATION: 20260822000002_indexes.sql
-- ========================================================

-- ==============================================================================
-- JeevanSetu Database Indexes Migration
-- Version: 20260822000002_indexes.sql
-- Description: Justified B-tree & compound indexes for relational queries, joins & search
-- ==============================================================================

-- 1. Profiles Lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON profiles(district);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_phc ON profiles(assigned_phc_id) WHERE assigned_phc_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_hospital ON profiles(assigned_hospital_id) WHERE assigned_hospital_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_ngo ON profiles(assigned_ngo_id) WHERE assigned_ngo_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_abha_id ON profiles(abha_id) WHERE abha_id IS NOT NULL;

-- 2. Facilities Lookups (PHCs and Hospitals)
CREATE INDEX IF NOT EXISTS idx_phcs_district_taluka ON phcs(district, taluka);
CREATE INDEX IF NOT EXISTS idx_phcs_is_verified ON phcs(is_verified);
CREATE INDEX IF NOT EXISTS idx_hospitals_district ON hospitals(district);
CREATE INDEX IF NOT EXISTS idx_hospitals_is_verified ON hospitals(is_verified);
CREATE INDEX IF NOT EXISTS idx_hospital_services_hospital ON hospital_services(hospital_id, is_active);

-- 3. Doctors Registry
CREATE INDEX IF NOT EXISTS idx_doctors_phc ON doctors(phc_id) WHERE phc_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_doctors_hospital ON doctors(hospital_id) WHERE hospital_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_on_duty ON doctors(is_on_duty);

-- 4. NGOs Directory
CREATE INDEX IF NOT EXISTS idx_ngos_district ON ngos(district);
CREATE INDEX IF NOT EXISTS idx_ngos_is_verified ON ngos(is_verified);

-- 5. Health Cases Lookups
CREATE INDEX IF NOT EXISTS idx_health_cases_patient ON health_cases(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_cases_case_number ON health_cases(case_number);
CREATE INDEX IF NOT EXISTS idx_health_cases_status_urgency ON health_cases(status, urgency);
CREATE INDEX IF NOT EXISTS idx_health_cases_initial_phc ON health_cases(initial_phc_id) WHERE initial_phc_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_health_cases_created_at ON health_cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_case_vitals_case ON health_case_vitals(case_id);

-- 6. Referrals & Lifecycle Timeline Events
CREATE INDEX IF NOT EXISTS idx_referrals_case ON referrals(case_id);
CREATE INDEX IF NOT EXISTS idx_referrals_patient ON referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_origin_phc ON referrals(originating_phc_id);
CREATE INDEX IF NOT EXISTS idx_referrals_dest_hospital ON referrals(destination_hospital_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status_priority ON referrals(status, priority);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_events_referral_created ON referral_events(referral_id, created_at ASC);

-- 7. Medicines & Stock Inventory Surveillance
CREATE INDEX IF NOT EXISTS idx_medicines_essential ON medicines(is_essential);
CREATE INDEX IF NOT EXISTS idx_medicine_inventory_phc_medicine ON medicine_inventory(phc_id, medicine_id);
CREATE INDEX IF NOT EXISTS idx_medicine_inventory_low_stock ON medicine_inventory(phc_id) WHERE current_quantity <= minimum_threshold;
CREATE INDEX IF NOT EXISTS idx_medicine_usage_phc_date ON medicine_usage(phc_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_medicine_usage_forecast ON medicine_usage(phc_id, medicine_id, recorded_date DESC);

-- 8. Feedback & Citizen Sentiment
CREATE INDEX IF NOT EXISTS idx_feedback_patient ON feedback(patient_id) WHERE patient_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedback_phc ON feedback(phc_id) WHERE phc_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedback_hospital ON feedback(hospital_id) WHERE hospital_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedback_category_rating ON feedback(category, rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- 9. Notifications (Unread queries & polling)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON notifications(recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 10. Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id) WHERE actor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);


-- ========================================================
-- MIGRATION: 20260822000003_auth_and_rls.sql
-- ========================================================

-- ==============================================================================
-- JeevanSetu Supabase Auth Linkage, Role Protection & Row Level Security (RLS)
-- Version: 20260822000003_auth_and_rls.sql
-- Description: Foreign key to auth.users, user provisioning triggers, role protection,
--              and least-privilege RLS policies for all sensitive healthcare tables.
-- ==============================================================================

-- 1. Link profiles.user_id to Supabase auth.users(id)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN
        ALTER TABLE profiles
        DROP CONSTRAINT IF EXISTS fk_profiles_auth_user;

        ALTER TABLE profiles
        ADD CONSTRAINT fk_profiles_auth_user
        FOREIGN KEY (user_id) REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Automatic Profile Provisioning Trigger for New Supabase Signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name VARCHAR(255);
    v_phone VARCHAR(20);
    v_district VARCHAR(100);
    v_state VARCHAR(100);
    v_role user_role;
BEGIN
    -- Extract user metadata supplied during signup safely
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Healthcare Citizen');
    v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, '');
    v_district := COALESCE(NEW.raw_user_meta_data->>'district', 'Gadchiroli');
    v_state := COALESCE(NEW.raw_user_meta_data->>'state', 'Maharashtra');
    
    -- Public signups default strictly to 'patient'. Privileged roles require admin assignment.
    v_role := 'patient'::user_role;

    INSERT INTO public.profiles (
        user_id,
        full_name,
        phone,
        email,
        district,
        state,
        role,
        pmjay_status,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        v_full_name,
        v_phone,
        NEW.email,
        v_district,
        v_state,
        v_role,
        'Pending Verification',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users if auth schema exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- 3. Prevent Normal Users from Self-Assigning Privileged Roles
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- If role is being changed, verify caller is service_role or admin
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        IF auth.uid() IS NOT NULL AND (
            SELECT role FROM public.profiles WHERE user_id = auth.uid()
        ) != 'district_admin'::user_role THEN
            RAISE EXCEPTION 'Unauthorized: Users cannot modify their own application role.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- ==============================================================================
-- 4. Enable Row Level Security (RLS) on Sensitive Tables
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_case_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public tables for verified infrastructure directory (Read-only for public)
ALTER TABLE public.phcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. Helper Functions for RLS Checks
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID AS $$
    SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_user_phc_id()
RETURNS UUID AS $$
    SELECT assigned_phc_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 6. RLS Policies: Directory & Public Health Tables (Read-Only)
-- ==============================================================================
DROP POLICY IF EXISTS "Public Read Verified PHCs" ON public.phcs;
CREATE POLICY "Public Read Verified PHCs" ON public.phcs FOR SELECT USING (is_verified = TRUE);
DROP POLICY IF EXISTS "Public Read Verified Hospitals" ON public.hospitals;
CREATE POLICY "Public Read Verified Hospitals" ON public.hospitals FOR SELECT USING (is_verified = TRUE);
DROP POLICY IF EXISTS "Public Read Active Hospital Services" ON public.hospital_services;
CREATE POLICY "Public Read Active Hospital Services" ON public.hospital_services FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Public Read Verified Doctors" ON public.doctors;
CREATE POLICY "Public Read Verified Doctors" ON public.doctors FOR SELECT USING (is_verified = TRUE);
DROP POLICY IF EXISTS "Public Read Verified NGOs" ON public.ngos;
CREATE POLICY "Public Read Verified NGOs" ON public.ngos FOR SELECT USING (is_verified = TRUE);
DROP POLICY IF EXISTS "Public Read Active Schemes" ON public.government_schemes;
CREATE POLICY "Public Read Active Schemes" ON public.government_schemes FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Public Read Essential Medicines" ON public.medicines;
CREATE POLICY "Public Read Essential Medicines" ON public.medicines FOR SELECT USING (TRUE);

-- ==============================================================================
-- 7. RLS Policies: Profiles
-- ==============================================================================
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Medical Officers read patient profiles for referrals" ON public.profiles;
CREATE POLICY "Medical Officers read patient profiles for referrals" ON public.profiles
    FOR SELECT USING (
        public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'district_admin')
    );

-- ==============================================================================
-- 8. RLS Policies: Health Cases & Vitals
-- ==============================================================================
DROP POLICY IF EXISTS "Patients view own cases" ON public.health_cases;
CREATE POLICY "Patients view own cases" ON public.health_cases
    FOR SELECT USING (
        patient_id = public.current_profile_id()
        OR public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'district_admin')
    );

DROP POLICY IF EXISTS "Patients create own cases" ON public.health_cases;
CREATE POLICY "Patients create own cases" ON public.health_cases
    FOR INSERT WITH CHECK (
        patient_id = public.current_profile_id()
        OR public.current_user_role() IN ('phc_staff', 'district_admin')
    );

DROP POLICY IF EXISTS "Staff update assigned health cases" ON public.health_cases;
CREATE POLICY "Staff update assigned health cases" ON public.health_cases
    FOR UPDATE USING (
        public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'district_admin')
    );

DROP POLICY IF EXISTS "View case vitals" ON public.health_case_vitals;
CREATE POLICY "View case vitals" ON public.health_case_vitals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.health_cases
            WHERE health_cases.id = health_case_vitals.case_id
            AND (
                health_cases.patient_id = public.current_profile_id()
                OR public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'district_admin')
            )
        )
    );

DROP POLICY IF EXISTS "Staff record case vitals" ON public.health_case_vitals;
CREATE POLICY "Staff record case vitals" ON public.health_case_vitals
    FOR INSERT WITH CHECK (
        public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'district_admin')
    );

-- ==============================================================================
-- 9. RLS Policies: Referrals & Events
-- ==============================================================================
DROP POLICY IF EXISTS "Patients and staff view authorized referrals" ON public.referrals;
CREATE POLICY "Patients and staff view authorized referrals" ON public.referrals
    FOR SELECT USING (
        patient_id = public.current_profile_id()
        OR public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'ngo_staff', 'district_admin')
    );

DROP POLICY IF EXISTS "PHC staff create referrals" ON public.referrals;
CREATE POLICY "PHC staff create referrals" ON public.referrals
    FOR INSERT WITH CHECK (
        public.current_user_role() IN ('phc_staff', 'doctor', 'district_admin')
    );

DROP POLICY IF EXISTS "Staff update referral status" ON public.referrals;
CREATE POLICY "Staff update referral status" ON public.referrals
    FOR UPDATE USING (
        public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'district_admin')
    );

DROP POLICY IF EXISTS "View referral timeline events" ON public.referral_events;
CREATE POLICY "View referral timeline events" ON public.referral_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.referrals
            WHERE referrals.id = referral_events.referral_id
            AND (
                referrals.patient_id = public.current_profile_id()
                OR public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'ngo_staff', 'district_admin')
            )
        )
    );

DROP POLICY IF EXISTS "Staff append referral events" ON public.referral_events;
CREATE POLICY "Staff append referral events" ON public.referral_events
    FOR INSERT WITH CHECK (
        public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'district_admin')
    );

-- ==============================================================================
-- 10. RLS Policies: Medicine Inventory & Usage
-- ==============================================================================
DROP POLICY IF EXISTS "Public read summarized medicine availability" ON public.medicine_inventory;
CREATE POLICY "Public read summarized medicine availability" ON public.medicine_inventory
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "PHC staff manage own medicine inventory" ON public.medicine_inventory;
CREATE POLICY "PHC staff manage own medicine inventory" ON public.medicine_inventory
    FOR ALL USING (
        public.current_user_role() = 'district_admin'
        OR (
            public.current_user_role() = 'phc_staff'
            AND phc_id = public.current_user_phc_id()
        )
    );

DROP POLICY IF EXISTS "Staff view and record medicine usage" ON public.medicine_usage;
CREATE POLICY "Staff view and record medicine usage" ON public.medicine_usage
    FOR ALL USING (
        public.current_user_role() IN ('phc_staff', 'district_admin')
    );

-- ==============================================================================
-- 11. RLS Policies: Feedback
-- ==============================================================================
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback" ON public.feedback
    FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Users view own feedback or staff review" ON public.feedback;
CREATE POLICY "Users view own feedback or staff review" ON public.feedback
    FOR SELECT USING (
        (is_anonymous = FALSE AND contact_phone = (SELECT phone FROM public.profiles WHERE user_id = auth.uid()))
        OR public.current_user_role() IN ('district_admin', 'phc_staff', 'hospital_staff')
    );

-- ==============================================================================
-- 12. RLS Policies: Notifications
-- ==============================================================================
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications
    FOR SELECT USING (
        recipient_id = public.current_profile_id()
    );

DROP POLICY IF EXISTS "Users mark own notifications as read" ON public.notifications;
CREATE POLICY "Users mark own notifications as read" ON public.notifications
    FOR UPDATE USING (
        recipient_id = public.current_profile_id()
    )
    WITH CHECK (
        recipient_id = public.current_profile_id()
    );

-- ==============================================================================
-- 13. RLS Policies: Audit Logs
-- ==============================================================================
DROP POLICY IF EXISTS "District Admin view audit logs" ON public.audit_logs;
CREATE POLICY "District Admin view audit logs" ON public.audit_logs
    FOR SELECT USING (
        public.current_user_role() = 'district_admin'
    );

DROP POLICY IF EXISTS "Service and staff append audit logs" ON public.audit_logs;
CREATE POLICY "Service and staff append audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (TRUE);


-- ========================================================
-- MIGRATION: 20260822000004_medicine_forecasts.sql
-- ========================================================

-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000004_medicine_forecasts.sql
-- Description: Medicine Depletion Forecasts Table & RLS Policies
-- ==============================================================================

CREATE TABLE IF NOT EXISTS medicine_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    current_quantity INT NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
    estimated_daily_consumption NUMERIC(8, 2),
    estimated_days_remaining NUMERIC(6, 1),
    projected_depletion_date DATE,
    consumption_trend VARCHAR(50) NOT NULL DEFAULT 'stable', -- stable, increasing, decreasing, highly_variable, insufficient_data
    risk_level VARCHAR(50) NOT NULL DEFAULT 'LOW', -- LOW, MEDIUM, HIGH, CRITICAL, INSUFFICIENT_DATA
    data_quality VARCHAR(50) NOT NULL DEFAULT 'INSUFFICIENT_DATA', -- HIGH, MEDIUM, LOW, INSUFFICIENT_DATA
    forecast_status VARCHAR(50) NOT NULL DEFAULT 'calculated', -- calculated, insufficient_data, no_recent_consumption
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (phc_id, medicine_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medicine_forecasts_phc_id ON medicine_forecasts(phc_id);
CREATE INDEX IF NOT EXISTS idx_medicine_forecasts_risk_level ON medicine_forecasts(risk_level);
CREATE INDEX IF NOT EXISTS idx_medicine_forecasts_medicine_id ON medicine_forecasts(medicine_id);

-- Enable RLS
ALTER TABLE medicine_forecasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Authorized staff and doctors can view forecasts" ON medicine_forecasts;
CREATE POLICY "Authorized staff and doctors can view forecasts" ON medicine_forecasts
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND (
                    profiles.role IN ('district_admin', 'doctor')
                    OR (profiles.role = 'phc_staff' AND profiles.assigned_phc_id = medicine_forecasts.phc_id)
                )
            )
        )
    );

DROP POLICY IF EXISTS "System background jobs and admins can upsert forecasts" ON medicine_forecasts;
CREATE POLICY "System background jobs and admins can upsert forecasts" ON medicine_forecasts
    FOR ALL
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'district_admin'
        )
    );


-- ========================================================
-- MIGRATION: 20260822000005_early_warning_system.sql
-- ========================================================

-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000005_early_warning_system.sql
-- Description: Health Early-Warning System Tables & RLS Policies
-- ==============================================================================

-- 1. Early-Warning Signals Table
CREATE TABLE IF NOT EXISTS early_warning_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID REFERENCES phcs(id) ON DELETE CASCADE,
    district VARCHAR(100) NOT NULL,
    taluka VARCHAR(100),
    signal_type VARCHAR(100) NOT NULL, -- syndromic_case_surge, medicine_consumption_surge, multi_signal_anomaly
    time_window VARCHAR(50) NOT NULL DEFAULT '7_days',
    observed_value NUMERIC(10, 2) NOT NULL,
    baseline_value NUMERIC(10, 2) NOT NULL,
    deviation_percentage NUMERIC(6, 2) NOT NULL,
    z_score NUMERIC(5, 2),
    signal_level VARCHAR(50) NOT NULL DEFAULT 'WATCH', -- NORMAL, WATCH, ELEVATED, HIGH, INSUFFICIENT_DATA
    data_quality VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW, INSUFFICIENT_DATA
    status VARCHAR(50) NOT NULL DEFAULT 'new', -- new, acknowledged, under_review, resolved
    contributing_sources JSONB DEFAULT '[]',
    notes TEXT,
    reviewed_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Early-Warning Review Events Table (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS early_warning_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID NOT NULL REFERENCES early_warning_signals(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- SIGNAL_DETECTED, ACKNOWLEDGED, STATUS_UPDATED, RESOLVED
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_early_warning_signals_district ON early_warning_signals(district);
CREATE INDEX IF NOT EXISTS idx_early_warning_signals_phc_id ON early_warning_signals(phc_id);
CREATE INDEX IF NOT EXISTS idx_early_warning_signals_status ON early_warning_signals(status);
CREATE INDEX IF NOT EXISTS idx_early_warning_signals_signal_level ON early_warning_signals(signal_level);
CREATE INDEX IF NOT EXISTS idx_early_warning_events_signal_id ON early_warning_events(signal_id);

-- Enable RLS
ALTER TABLE early_warning_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_warning_events ENABLE ROW LEVEL SECURITY;

-- RLS: Only authorized health administrators, doctors, and facility staff can view operational signals
DROP POLICY IF EXISTS "Authorized health staff can view early-warning signals" ON early_warning_signals;
CREATE POLICY "Authorized health staff can view early-warning signals" ON early_warning_signals
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND (
                    profiles.role IN ('district_admin', 'doctor')
                    OR (profiles.role = 'phc_staff' AND profiles.assigned_phc_id = early_warning_signals.phc_id)
                )
            )
        )
    );

DROP POLICY IF EXISTS "System background jobs and admins can manage signals" ON early_warning_signals;
CREATE POLICY "System background jobs and admins can manage signals" ON early_warning_signals
    FOR ALL
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
        )
    );

DROP POLICY IF EXISTS "Authorized staff can view review events" ON early_warning_events;
CREATE POLICY "Authorized staff can view review events" ON early_warning_events
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
            )
        )
    );

DROP POLICY IF EXISTS "Authorized staff can insert review events" ON early_warning_events;
CREATE POLICY "Authorized staff can insert review events" ON early_warning_events
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
            )
        )
    );


-- ========================================================
-- MIGRATION: 20260822000006_referral_followups.sql
-- ========================================================

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


-- ========================================================
-- MIGRATION: 20260822000007_ivr_system.sql
-- ========================================================

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


-- ========================================================
-- MIGRATION: 20260822000008_missed_call_feedback.sql
-- ========================================================

-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000008_missed_call_feedback.sql
-- Description: Anonymous Missed-Call Feedback, Channel Metadata, Quality Signals & RLS
-- ==============================================================================

-- 1. Enhance Feedback Table with Channel, Language and Service Metadata
ALTER TABLE feedback 
ADD COLUMN IF NOT EXISTS feedback_channel VARCHAR(50) NOT NULL DEFAULT 'WEB', -- 'WEB', 'IVR', 'MISSED_CALL'
ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'hi', -- 'hi', 'mr', 'en'
ADD COLUMN IF NOT EXISTS service_tag VARCHAR(50) DEFAULT 'general', -- 'waiting_time', 'staff_behaviour', 'doctor_availability', 'medicine_stock', 'cleanliness', 'referral_speed', 'other'
ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(50) NOT NULL DEFAULT 'approved'; -- 'approved', 'flagged', 'hidden'

-- 2. Feedback Operational Quality Signals Table
CREATE TABLE IF NOT EXISTS feedback_quality_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_type VARCHAR(50) NOT NULL, -- 'phc' or 'hospital'
    phc_id UUID REFERENCES phcs(id) ON DELETE SET NULL,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    signal_type VARCHAR(100) NOT NULL, -- 'negative_rating_spike', 'medicine_complaint_cluster', 'waiting_time_alert'
    severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'under_review', 'resolved'
    acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_channel_created ON feedback(feedback_channel, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_service_tag ON feedback(service_tag);
CREATE INDEX IF NOT EXISTS idx_feedback_quality_signals_facility ON feedback_quality_signals(phc_id, hospital_id);
CREATE INDEX IF NOT EXISTS idx_feedback_quality_signals_status ON feedback_quality_signals(status);

-- Enable RLS for quality signals
ALTER TABLE feedback_quality_signals ENABLE ROW LEVEL SECURITY;

-- RLS: Quality Signals read access
DROP POLICY IF EXISTS "Authorized staff and admin can view quality signals" ON feedback_quality_signals;
CREATE POLICY "Authorized staff and admin can view quality signals" ON feedback_quality_signals
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'district_admin'
                OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = feedback_quality_signals.phc_id)
                OR (profiles.role = 'hospital_staff' AND profiles.assigned_hospital_id = feedback_quality_signals.hospital_id)
            )
        )
    );

-- RLS: Quality Signals update access (acknowledgement / review)
DROP POLICY IF EXISTS "Authorized staff and admin can update quality signals" ON feedback_quality_signals;
CREATE POLICY "Authorized staff and admin can update quality signals" ON feedback_quality_signals
    FOR UPDATE
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'district_admin'
                OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = feedback_quality_signals.phc_id)
                OR (profiles.role = 'hospital_staff' AND profiles.assigned_hospital_id = feedback_quality_signals.hospital_id)
            )
        )
    );


-- ========================================================
-- MIGRATION: 20260822000009_medicine_supply_chain.sql
-- ========================================================

-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000009_medicine_supply_chain.sql
-- Description: Medicine Stock Transaction Ledger, Replenishment Requests, and Constraints
-- ==============================================================================

-- 1. Ensure inventory quantity cannot be negative
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_inventory_non_negative'
    ) THEN
        ALTER TABLE medicine_inventory 
        ADD CONSTRAINT chk_inventory_non_negative CHECK (current_quantity >= 0);
    END IF;
END $$;

-- 2. Medicine Stock Transactions Ledger Table
CREATE TABLE IF NOT EXISTS medicine_stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'RECEIPT', 'DISPENSATION', 'ADJUSTMENT', 'DAMAGE', 'EXPIRY', 'TRANSFER_IN', 'TRANSFER_OUT'
    quantity_delta INT NOT NULL,
    resulting_quantity INT NOT NULL CHECK (resulting_quantity >= 0),
    batch_number VARCHAR(100),
    expiry_date DATE,
    reason TEXT,
    reference_id VARCHAR(100),
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Medicine Replenishment Requests Table
CREATE TABLE IF NOT EXISTS medicine_replenishment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) NOT NULL UNIQUE,
    phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    requested_quantity INT NOT NULL CHECK (requested_quantity > 0),
    approved_quantity INT CHECK (approved_quantity >= 0),
    received_quantity INT CHECK (received_quantity >= 0),
    priority VARCHAR(20) NOT NULL DEFAULT 'routine', -- 'routine', 'urgent', 'emergency'
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED', -- 'DRAFT', 'REQUESTED', 'APPROVED', 'REJECTED', 'DISPATCHED', 'RECEIVED', 'CANCELLED'
    reason TEXT,
    suggested_formula_metadata JSONB DEFAULT '{}',
    requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    review_notes TEXT,
    dispatched_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_trans_phc_med ON medicine_stock_transactions(phc_id, medicine_id);
CREATE INDEX IF NOT EXISTS idx_stock_trans_created ON medicine_stock_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replenish_phc_status ON medicine_replenishment_requests(phc_id, status);
CREATE INDEX IF NOT EXISTS idx_replenish_status_created ON medicine_replenishment_requests(status, created_at DESC);

-- Enable RLS
ALTER TABLE medicine_stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_replenishment_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Transactions read policy (PHC staff sees assigned PHC, district admin sees all)
DROP POLICY IF EXISTS "Authorized staff can view stock transactions" ON medicine_stock_transactions;
CREATE POLICY "Authorized staff can view stock transactions" ON medicine_stock_transactions
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'district_admin'
                OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = medicine_stock_transactions.phc_id)
            )
        )
    );

-- RLS: Replenishment requests read policy
DROP POLICY IF EXISTS "Authorized staff can view replenishment requests" ON medicine_replenishment_requests;
CREATE POLICY "Authorized staff can view replenishment requests" ON medicine_replenishment_requests
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'district_admin'
                OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = medicine_replenishment_requests.phc_id)
            )
        )
    );

-- RLS: Replenishment requests update policy
DROP POLICY IF EXISTS "Authorized staff can update replenishment requests" ON medicine_replenishment_requests;
CREATE POLICY "Authorized staff can update replenishment requests" ON medicine_replenishment_requests
    FOR UPDATE
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'district_admin'
                OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = medicine_replenishment_requests.phc_id)
            )
        )
    );


-- ========================================================
-- MIGRATION: 20260822000010_closed_loop_referrals.sql
-- ========================================================

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


-- ========================================================
-- MIGRATION: 20260822000011_doctor_presence.sql
-- ========================================================

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


-- ========================================================
-- MIGRATION: 20260822000012_early_warning_intelligence.sql
-- ========================================================

-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000012_early_warning_intelligence.sql
-- Description: Phase 17 Multi-Source Health Early-Warning Intelligence
-- ==============================================================================

-- 1. Enhance early_warning_signals table with Phase 17 intelligence columns
ALTER TABLE IF EXISTS early_warning_signals 
    ADD COLUMN IF NOT EXISTS severity VARCHAR(50) DEFAULT 'WATCH',
    ADD COLUMN IF NOT EXISTS confidence VARCHAR(50) DEFAULT 'MEDIUM',
    ADD COLUMN IF NOT EXISTS signal_score NUMERIC(5, 2) DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'GENERAL',
    ADD COLUMN IF NOT EXISTS resolution_category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS algorithm_version VARCHAR(50) DEFAULT 'v1.0-deterministic',
    ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- 2. External Health Observations Table (Aggregated Feeds)
CREATE TABLE IF NOT EXISTS external_health_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(100) NOT NULL, -- 'weather', 'community_report', 'pharmacy_aggregate'
    facility_id UUID REFERENCES phcs(id) ON DELETE SET NULL,
    district VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    observed_value NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Composite Indexes for Fast Performance
CREATE INDEX IF NOT EXISTS idx_early_warning_signals_severity_status ON early_warning_signals(severity, status);
CREATE INDEX IF NOT EXISTS idx_early_warning_signals_phc_date ON early_warning_signals(phc_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_external_health_obs_lookup ON external_health_observations(district, source_type, observed_at DESC);

-- 4. Row Level Security for External Observations
ALTER TABLE external_health_observations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authorized health staff can view external observations" ON external_health_observations;
CREATE POLICY "Authorized health staff can view external observations" ON external_health_observations
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
            )
        )
    );

DROP POLICY IF EXISTS "System jobs and admins can insert external observations" ON external_health_observations;
CREATE POLICY "System jobs and admins can insert external observations" ON external_health_observations
    FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin')
        )
    );


-- ========================================================
-- MIGRATION: 20260822000013_citizen_feedback_intelligence.sql
-- ========================================================

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


-- ========================================================
-- MIGRATION: 20260822000014_referral_continuity_intelligence.sql
-- ========================================================

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


-- ========================================================
-- MIGRATION: 20260822000015_medicine_stockout_prediction.sql
-- ========================================================

-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000015_medicine_stockout_prediction.sql
-- Description: AI-Assisted Medicine Stockout Prediction, Lead Time, Safety Stock & Alert Management
-- ==============================================================================

-- 1. Extend medicine_inventory with lead time and safety stock configuration
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicine_inventory' AND column_name = 'replenishment_lead_time_days'
    ) THEN
        ALTER TABLE medicine_inventory 
        ADD COLUMN replenishment_lead_time_days INT NOT NULL DEFAULT 5 CHECK (replenishment_lead_time_days >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicine_inventory' AND column_name = 'safety_stock_quantity'
    ) THEN
        ALTER TABLE medicine_inventory 
        ADD COLUMN safety_stock_quantity INT NOT NULL DEFAULT 50 CHECK (safety_stock_quantity >= 0);
    END IF;
END $$;

-- 2. Extend medicine_forecasts with rolling averages, threshold dates, and algorithm metadata
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicine_forecasts' AND column_name = 'estimated_threshold_date'
    ) THEN
        ALTER TABLE medicine_forecasts 
        ADD COLUMN estimated_threshold_date DATE,
        ADD COLUMN estimated_stockout_date DATE,
        ADD COLUMN days_of_stock NUMERIC(6, 1),
        ADD COLUMN reorder_recommended BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN recommended_reorder_date DATE,
        ADD COLUMN rolling_avg_7d NUMERIC(8, 2),
        ADD COLUMN rolling_avg_14d NUMERIC(8, 2),
        ADD COLUMN rolling_avg_30d NUMERIC(8, 2),
        ADD COLUMN data_sufficiency VARCHAR(50) NOT NULL DEFAULT 'INSUFFICIENT_DATA',
        ADD COLUMN algorithm_version VARCHAR(50) NOT NULL DEFAULT 'stockout-v1';
    END IF;
END $$;

-- 3. Create Medicine Inventory Alerts Table for proactive stockout warnings
CREATE TABLE IF NOT EXISTS medicine_inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID NOT NULL REFERENCES phcs(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'LOW_STOCK', 'CRITICAL_STOCKOUT', 'OUT_OF_STOCK', 'CONSUMPTION_SPIKE', 'REORDER_DUE'
    risk_level VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'OUT_OF_STOCK', 'INSUFFICIENT_DATA'
    current_quantity INT NOT NULL CHECK (current_quantity >= 0),
    days_remaining NUMERIC(6, 1),
    status VARCHAR(50) NOT NULL DEFAULT 'NEW', -- 'NEW', 'UNDER_REVIEW', 'ACKNOWLEDGED', 'RESOLVED', 'CLOSED'
    dedup_key VARCHAR(255) NOT NULL UNIQUE,
    acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance & query optimization
CREATE INDEX IF NOT EXISTS idx_inv_alerts_phc_status ON medicine_inventory_alerts(phc_id, status);
CREATE INDEX IF NOT EXISTS idx_inv_alerts_risk_created ON medicine_inventory_alerts(risk_level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inv_alerts_medicine_id ON medicine_inventory_alerts(medicine_id);
CREATE INDEX IF NOT EXISTS idx_inv_alerts_dedup ON medicine_inventory_alerts(dedup_key);

-- Enable RLS
ALTER TABLE medicine_inventory_alerts ENABLE ROW LEVEL SECURITY;

-- RLS: Read policy for inventory alerts
DROP POLICY IF EXISTS "Authorized staff can view inventory alerts" ON medicine_inventory_alerts;
CREATE POLICY "Authorized staff can view inventory alerts" ON medicine_inventory_alerts
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role IN ('district_admin', 'doctor')
                OR (profiles.role = 'phc_staff' AND profiles.assigned_phc_id = medicine_inventory_alerts.phc_id)
            )
        )
    );

-- RLS: Update policy for inventory alerts (Acknowledge & Resolve)
DROP POLICY IF EXISTS "Authorized staff can update inventory alerts" ON medicine_inventory_alerts;
CREATE POLICY "Authorized staff can update inventory alerts" ON medicine_inventory_alerts
    FOR UPDATE
    USING (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'district_admin'
                OR (profiles.role IN ('phc_staff', 'doctor') AND profiles.assigned_phc_id = medicine_inventory_alerts.phc_id)
            )
        )
    );


-- ========================================================
-- MIGRATION: 20260822000016_doctor_attendance_integrity.sql
-- ========================================================

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


-- ========================================================
-- MIGRATION: 20260822000017_referral_continuity_lifecycle.sql
-- ========================================================

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


-- ========================================================
-- MIGRATION: 20260822000018_medicine_inventory_forecasting.sql
-- ========================================================

-- Migration 20260822000018_medicine_inventory_forecasting.sql
-- JeevanSetu Phase 23: Medicine Inventory & AI Demand Forecasting

-- 1. Extend medicine_forecasts with multi-window averages and accuracy metrics
ALTER TABLE medicine_forecasts ADD COLUMN IF NOT EXISTS rolling_avg_90d NUMERIC(10,2);
ALTER TABLE medicine_forecasts ADD COLUMN IF NOT EXISTS mae_score NUMERIC(10,2);
ALTER TABLE medicine_forecasts ADD COLUMN IF NOT EXISTS mape_score NUMERIC(10,2);
ALTER TABLE medicine_forecasts ADD COLUMN IF NOT EXISTS forecast_bias NUMERIC(10,2);
ALTER TABLE medicine_forecasts ADD COLUMN IF NOT EXISTS is_actual_evaluated BOOLEAN DEFAULT FALSE;
ALTER TABLE medicine_forecasts ADD COLUMN IF NOT EXISTS model_version VARCHAR(50) DEFAULT 'v1.0';
ALTER TABLE medicine_forecasts ADD COLUMN IF NOT EXISTS forecast_date DATE DEFAULT CURRENT_DATE;

-- 2. Ensure stock transaction movement types and performance indexes
CREATE INDEX IF NOT EXISTS idx_med_forecasts_model_version ON medicine_forecasts(model_version);
CREATE INDEX IF NOT EXISTS idx_med_forecasts_phc_date ON medicine_forecasts(phc_id, forecast_date DESC);
CREATE INDEX IF NOT EXISTS idx_med_stock_tx_created ON medicine_stock_transactions(phc_id, medicine_id, created_at DESC);

-- 3. Row Level Security Policies (RLS)
-- PHC staff isolated strictly to assigned facility
-- District admin and supply officers have district-wide visibility
-- Patients are completely forbidden from writing or altering inventory


-- ========================================================
-- MIGRATION: 20260822000019_doctor_presence_accountability.sql
-- ========================================================

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


-- ========================================================
-- MIGRATION: 20260822000020_citizen_feedback_system.sql
-- ========================================================

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


-- ========================================================
-- MIGRATION: 20260822000021_public_health_early_warning.sql
-- ========================================================

-- ==============================================================================
-- JeevanSetu Database Schema Migration
-- Version: 20260822000021_public_health_early_warning.sql
-- Description: Phase 27 Public Health Early Warning & Outbreak Intelligence
-- ==============================================================================

-- 1. Create public_health_early_warnings table
CREATE TABLE IF NOT EXISTS public_health_early_warnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    geographic_scope VARCHAR(50) NOT NULL DEFAULT 'phc', -- 'phc', 'taluka', 'district', 'village'
    location_id VARCHAR(100) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL DEFAULT 'Gadchiroli',
    taluka VARCHAR(100),
    village VARCHAR(100),
    signal_type VARCHAR(100) NOT NULL DEFAULT 'MULTI_SOURCE_SIGNAL',
    category VARCHAR(100) DEFAULT 'GENERAL',
    severity VARCHAR(50) NOT NULL DEFAULT 'INFO', -- 'INFO', 'LOW', 'MEDIUM', 'HIGH'
    confidence VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
    status VARCHAR(50) NOT NULL DEFAULT 'DETECTED', -- 'DETECTED', 'UNDER_REVIEW', 'VERIFIED', 'DISMISSED', 'RESOLVED'
    data_quality VARCHAR(50) NOT NULL DEFAULT 'HIGH', -- 'HIGH', 'MEDIUM', 'LOW', 'UNAVAILABLE', 'DATA_STALE'
    baseline_value NUMERIC(10, 2) DEFAULT 0.0,
    current_value NUMERIC(10, 2) DEFAULT 0.0,
    deviation_percentage NUMERIC(10, 2) DEFAULT 0.0,
    z_score NUMERIC(5, 2) DEFAULT 0.0,
    evidence JSONB DEFAULT '[]',
    contributing_sources TEXT[] DEFAULT '{}',
    ai_summary TEXT,
    ai_explanations JSONB DEFAULT '[]',
    ai_limitations JSONB DEFAULT '[]',
    recommended_review_questions JSONB DEFAULT '[]',
    reviewed_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_action VARCHAR(50),
    resolution_category VARCHAR(100),
    resolution_notes TEXT,
    dedup_key VARCHAR(255) UNIQUE,
    is_stale BOOLEAN DEFAULT FALSE,
    algorithm_version VARCHAR(50) DEFAULT 'v2.0-deterministic',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create community_asha_reports table (Structured community observations)
CREATE TABLE IF NOT EXISTS community_asha_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id VARCHAR(100),
    area_name VARCHAR(150) NOT NULL,
    village VARCHAR(100),
    taluka VARCHAR(100) DEFAULT 'Chamorshi',
    district VARCHAR(100) NOT NULL DEFAULT 'Gadchiroli',
    observation_type VARCHAR(100) NOT NULL, -- 'FEVER_CLUSTER', 'DIARRHEA_CASES', 'WATER_CONTAMINATION', 'SEASONAL_ILLNESS'
    reported_count INTEGER NOT NULL DEFAULT 1,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    source_role VARCHAR(50) DEFAULT 'ASHA',
    reporter_name VARCHAR(150),
    notes TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create public_health_reviews table (Immutable Supervisory Audit Ledger)
CREATE TABLE IF NOT EXISTS public_health_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warning_id UUID REFERENCES public_health_early_warnings(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'ACKNOWLEDGE', 'REQUEST_INVESTIGATION', 'VERIFY', 'DISMISS', 'RESOLVE', 'ADD_NOTE'
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    resolution_category VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Composite Indexes for Fast Performance & Dashboard Queries
CREATE INDEX IF NOT EXISTS idx_ph_early_warnings_geo ON public_health_early_warnings(district, taluka, location_id);
CREATE INDEX IF NOT EXISTS idx_ph_early_warnings_severity_status ON public_health_early_warnings(severity, status);
CREATE INDEX IF NOT EXISTS idx_ph_early_warnings_date ON public_health_early_warnings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ph_early_warnings_dedup ON public_health_early_warnings(dedup_key);
CREATE INDEX IF NOT EXISTS idx_community_asha_lookup ON community_asha_reports(district, phc_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_ph_reviews_warning_date ON public_health_reviews(warning_id, created_at DESC);

-- 5. Row Level Security (RLS) Enforcement
ALTER TABLE public_health_early_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_asha_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_health_reviews ENABLE ROW LEVEL SECURITY;

-- 5.1 Early Warnings Policies
DROP POLICY IF EXISTS "District Admin full access to public health early warnings" ON public_health_early_warnings;
CREATE POLICY "District Admin full access to public health early warnings" ON public_health_early_warnings
    FOR ALL
    USING (
        auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'district_admin'
        )
    );

DROP POLICY IF EXISTS "PHC Staff view assigned facility early warnings" ON public_health_early_warnings;
CREATE POLICY "PHC Staff view assigned facility early warnings" ON public_health_early_warnings
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('phc_staff', 'doctor')
            AND (profiles.assigned_phc_id::text = public_health_early_warnings.location_id OR public_health_early_warnings.geographic_scope = 'district')
        )
    );

DROP POLICY IF EXISTS "Service role manages early warnings" ON public_health_early_warnings;
CREATE POLICY "Service role manages early warnings" ON public_health_early_warnings
    FOR ALL
    USING (auth.role() = 'service_role');

-- 5.2 Community ASHA Reports Policies
DROP POLICY IF EXISTS "Health staff can read community ASHA reports" ON community_asha_reports;
CREATE POLICY "Health staff can read community ASHA reports" ON community_asha_reports
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
        )
    );

DROP POLICY IF EXISTS "Health workers and admins can submit community reports" ON community_asha_reports;
CREATE POLICY "Health workers and admins can submit community reports" ON community_asha_reports
    FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
        )
    );

-- 5.3 Public Health Reviews Policies
DROP POLICY IF EXISTS "Health staff can view public health review events" ON public_health_reviews;
CREATE POLICY "Health staff can view public health review events" ON public_health_reviews
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
        )
    );

DROP POLICY IF EXISTS "Supervisors can insert public health review events" ON public_health_reviews;
CREATE POLICY "Supervisors can insert public health review events" ON public_health_reviews
    FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('district_admin', 'doctor', 'phc_staff')
        )
    );


-- ========================================================
-- MIGRATION: 20260822000022_automation_n8n_outbox.sql
-- ========================================================

-- ==============================================================================
-- JEEVANSETU PHASE 28: AUTOMATION, N8N & OUTBOX PATTERN MIGRATION
-- ==============================================================================
-- Creates outbox_events, outbox_event_logs, user_notification_preferences,
-- webhook_replay_nonces, and strict Row Level Security (RLS) policies.
-- Invariant: JeevanSetu backend is the source of truth; n8n is an optional orchestration layer.

-- 1. Outbox Events Table
CREATE TABLE IF NOT EXISTS public.outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'RETRYING', 'ABANDONED')),
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    backoff_multiplier INT NOT NULL DEFAULT 2,
    last_attempted_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ DEFAULT NOW(),
    error_category VARCHAR(50),
    error_message TEXT,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    n8n_dispatched BOOLEAN NOT NULL DEFAULT FALSE,
    n8n_response_status VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Outbox Event Logs Table (Immutable Execution History)
CREATE TABLE IF NOT EXISTS public.outbox_event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.outbox_events(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL,
    dispatcher VARCHAR(50) NOT NULL, -- 'DIRECT_PROVIDER', 'N8N_ORCHESTRATOR', 'MANUAL_RETRY'
    target_channel VARCHAR(50),      -- 'SMS', 'EMAIL', 'IVR', 'IN_APP', 'WEBHOOK'
    status VARCHAR(30) NOT NULL,     -- 'SUCCESS', 'FAILED', 'PROVIDER_NOT_CONFIGURED', 'TIMEOUT'
    duration_ms INT,
    response_code VARCHAR(50),
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. User Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enable_sms BOOLEAN NOT NULL DEFAULT TRUE,
    enable_email BOOLEAN NOT NULL DEFAULT TRUE,
    enable_in_app BOOLEAN NOT NULL DEFAULT TRUE,
    enable_ivr_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    enable_referral_updates BOOLEAN NOT NULL DEFAULT TRUE,
    enable_medicine_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    enable_duty_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_notification_preferences UNIQUE (user_id)
);

-- 4. Webhook Replay Protection Nonces Table
CREATE TABLE IF NOT EXISTS public.webhook_replay_nonces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nonce VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(100) NOT NULL DEFAULT 'N8N',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Composite Indexes for High Performance Outbox Processing
CREATE INDEX IF NOT EXISTS idx_outbox_events_status_next_retry 
    ON public.outbox_events (status, next_retry_at) 
    WHERE status IN ('PENDING', 'RETRYING');

CREATE INDEX IF NOT EXISTS idx_outbox_events_event_type 
    ON public.outbox_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_outbox_events_aggregate 
    ON public.outbox_events (aggregate_type, aggregate_id);

CREATE INDEX IF NOT EXISTS idx_outbox_event_logs_event_id 
    ON public.outbox_event_logs (event_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_webhook_nonces_expiry 
    ON public.webhook_replay_nonces (expires_at);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_replay_nonces ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Outbox Events & Logs: Only District Admins and system service role can view
DROP POLICY IF EXISTS "District Admin view outbox events" ON public.outbox_events;
CREATE POLICY "District Admin view outbox events" ON public.outbox_events
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'district_admin'
        )
    );

DROP POLICY IF EXISTS "District Admin view outbox event logs" ON public.outbox_event_logs;
CREATE POLICY "District Admin view outbox event logs" ON public.outbox_event_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'district_admin'
        )
    );

-- User Preferences: Users can manage only their own preferences
DROP POLICY IF EXISTS "Users manage own notification preferences" ON public.user_notification_preferences;
CREATE POLICY "Users manage own notification preferences" ON public.user_notification_preferences
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Webhook nonces: Service role / District Admin read
DROP POLICY IF EXISTS "Admin view webhook nonces" ON public.webhook_replay_nonces;
CREATE POLICY "Admin view webhook nonces" ON public.webhook_replay_nonces
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'district_admin'
        )
    );

