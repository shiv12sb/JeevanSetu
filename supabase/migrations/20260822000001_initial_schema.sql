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
