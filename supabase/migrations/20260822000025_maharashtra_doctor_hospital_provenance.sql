-- Migration 20260822000025_maharashtra_doctor_hospital_provenance.sql
-- JeevanSetu Phase 45: Maharashtra Verified Doctor & Hospital Directory with Data Provenance

-- 1. Enhance Hospitals Table with Provenance & Verified Contact Fields
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS reception_phone VARCHAR(50);
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS appointment_phone VARCHAR(50);
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(50) DEFAULT '108';
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS official_website VARCHAR(500);
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS source VARCHAR(255) DEFAULT 'Directorate of Medical Education and Research (DMER) / Public Health Department, Govt of Maharashtra';
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS source_url VARCHAR(500);
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS source_type VARCHAR(100) DEFAULT 'GOVERNMENT_DIRECTORY';
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'VERIFIED_STATIC'; -- 'VERIFIED_LIVE', 'VERIFIED_STATIC', 'CALL_TO_CONFIRM', 'NOT_VERIFIED'
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Enhance Doctors Table with Provenance & Academic / Clinical Role
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS sub_specialization VARCHAR(255);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS designation VARCHAR(255);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS reception_phone VARCHAR(50);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS appointment_phone VARCHAR(50);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS official_profile_url VARCHAR(500);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS source VARCHAR(255) DEFAULT 'Maharashtra Medical Council (MMC) / GMC Faculty Directory';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS source_url VARCHAR(500);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS source_type VARCHAR(100) DEFAULT 'GOVERNMENT_MEDICAL_COLLEGE';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'VERIFIED_STATIC'; -- 'VERIFIED_LIVE', 'VERIFIED_STATIC', 'CALL_TO_CONFIRM', 'NOT_VERIFIED'
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Enhance Doctor Facilities Table with Department, Shifts & Provenance
ALTER TABLE doctor_facilities ADD COLUMN IF NOT EXISTS department VARCHAR(150);
ALTER TABLE doctor_facilities ADD COLUMN IF NOT EXISTS shift_timings VARCHAR(100);
ALTER TABLE doctor_facilities ADD COLUMN IF NOT EXISTS source VARCHAR(255) DEFAULT 'Hospital Duty Roster Desk';
ALTER TABLE doctor_facilities ADD COLUMN IF NOT EXISTS source_url VARCHAR(500);
ALTER TABLE doctor_facilities ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'CALL_TO_CONFIRM';
ALTER TABLE doctor_facilities ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE doctor_facilities ADD COLUMN IF NOT EXISTS updated_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 4. Fast Query Indexes for Multi-Param Search
CREATE INDEX IF NOT EXISTS idx_hospitals_district_city ON hospitals(district, city);
CREATE INDEX IF NOT EXISTS idx_hospitals_verification ON hospitals(verification_status, is_verified);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_verification ON doctors(verification_status, is_on_duty);
CREATE INDEX IF NOT EXISTS idx_doc_fac_hosp_status ON doctor_facilities(hospital_id, status);

-- 5. Row-Level Security (RLS) Policies for Hospital Staff Isolation
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_facilities ENABLE ROW LEVEL SECURITY;

-- Public can view verified hospitals and doctors
DROP POLICY IF EXISTS "Public can view verified hospitals" ON hospitals;
CREATE POLICY "Public can view verified hospitals" ON hospitals
    FOR SELECT USING (is_verified = TRUE);

DROP POLICY IF EXISTS "Public can view verified doctors" ON doctors;
CREATE POLICY "Public can view verified doctors" ON doctors
    FOR SELECT USING (is_verified = TRUE);

DROP POLICY IF EXISTS "Public can view doctor facility affiliations" ON doctor_facilities;
CREATE POLICY "Public can view doctor facility affiliations" ON doctor_facilities
    FOR SELECT USING (TRUE);

-- Hospital Staff can update only their own hospital's doctors and duty roster
DROP POLICY IF EXISTS "Hospital staff manage assigned hospital doctors" ON doctors;
CREATE POLICY "Hospital staff manage assigned hospital doctors" ON doctors
    FOR UPDATE USING (
        hospital_id IN (SELECT assigned_hospital_id FROM profiles WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'district_admin')
    );

DROP POLICY IF EXISTS "Hospital staff manage assigned hospital affiliations" ON doctor_facilities;
CREATE POLICY "Hospital staff manage assigned hospital affiliations" ON doctor_facilities
    FOR ALL USING (
        hospital_id IN (SELECT assigned_hospital_id FROM profiles WHERE id = auth.uid())
        OR phc_id IN (SELECT assigned_phc_id FROM profiles WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'district_admin')
    );
