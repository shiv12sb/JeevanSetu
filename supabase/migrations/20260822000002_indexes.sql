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
