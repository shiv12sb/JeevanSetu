-- ==============================================================================
-- JeevanSetu Development Seed Data
-- Description: Synthetic baseline records for PHCs, Hospitals, Schemes, Medicines,
--              Mock Patients, Active Cases, Referrals & Medicine Inventory.
-- WARNING: Contains purely synthetic data for development & testing only.
-- ==============================================================================

-- 1. Primary Health Centres (PHCs)
INSERT INTO phcs (id, facility_code, name, contact_phone, contact_email, address, village, taluka, district, state, pincode, latitude, longitude, is_verified, operational_hours)
VALUES
('00000000-0000-0000-0000-000000000001', 'PHC-MH-GAD-001', 'Ashti Primary Health Centre', '+91 7135 244102', 'ashti.phc@health.maha.gov.in', 'Near Gram Panchayat Office, Main Road', 'Ashti', 'Chamorshi', 'Gadchiroli', 'Maharashtra', '442707', 19.8214000, 79.9123000, TRUE, '24x7 Emergency / 09:00 - 17:00 OPD'),
('00000000-0000-0000-0000-000000000002', 'PHC-MH-GAD-002', 'Chamorshi Primary Health Centre', '+91 7135 233088', 'chamorshi.phc@health.maha.gov.in', 'Civil Lines, Station Road', 'Chamorshi', 'Chamorshi', 'Gadchiroli', 'Maharashtra', '442603', 19.9312000, 79.9388000, TRUE, '24x7 Emergency / 09:00 - 17:00 OPD'),
('00000000-0000-0000-0000-000000000003', 'PHC-MH-GAD-003', 'Armori Primary Health Centre', '+91 7137 266144', 'armori.phc@health.maha.gov.in', 'State Highway 9, Opp Bus Stand', 'Armori', 'Armori', 'Gadchiroli', 'Maharashtra', '441208', 20.4611000, 79.9832000, TRUE, '24x7 Emergency / 09:00 - 17:00 OPD')
ON CONFLICT (facility_code) DO NOTHING;

-- 2. District & Tertiary Referral Hospitals
INSERT INTO hospitals (id, facility_code, name, hospital_type, contact_phone, contact_email, address, district, state, pincode, latitude, longitude, total_beds, icu_beds, empanelled_schemes, is_verified)
VALUES
('00000000-0000-0000-0000-000000000010', 'HOSP-MH-GAD-001', 'District Civil Hospital Gadchiroli', 'District Civil Hospital', '+91 7132 222144', 'civilhospital.gadchiroli@gov.in', 'Complex Area, Collectorate Road, Gadchiroli', 'Gadchiroli', 'Maharashtra', '442605', 20.1849000, 79.9948000, 300, 24, ARRAY['PM-JAY', 'MJPJAY', 'JSSK'], TRUE),
('00000000-0000-0000-0000-000000000011', 'HOSP-MH-NAG-001', 'Government Medical College & Hospital (GMC), Nagpur', 'Government Medical College & Tertiary Hospital', '+91 712 2744400', 'referrals@gmc-nagpur.gov.in', 'Medical Square, Hanuman Nagar, Nagpur', 'Nagpur', 'Maharashtra', '440003', 21.1350000, 79.0982000, 1400, 120, ARRAY['PM-JAY', 'MJPJAY', 'JSSK', 'RSBY'], TRUE)
ON CONFLICT (facility_code) DO NOTHING;

-- 3. Hospital Department Services & Doctor Availability
INSERT INTO hospital_services (id, hospital_id, service_name, doctor_on_duty_status, is_active)
VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000010', 'Cardiology Consultation OPD', 'Available', TRUE),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000010', 'General Medicine & ICU Ward', 'Available', TRUE),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000010', 'Obstetrics & Neonatal Care (Maternity)', 'Available', TRUE),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000011', 'Advanced Cardiac Surgery & Cath Lab', 'Available', TRUE),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000011', 'Nephrology & 24x7 Hemodialysis', 'Available', TRUE);

-- 4. Verified NGO Aid Partners
INSERT INTO ngos (id, ngo_darpan_id, name, aid_focus, contact_phone, contact_email, coordinator_name, district, state, is_verified)
VALUES
('00000000-0000-0000-0000-000000000020', 'MH/2021/0291823', 'Gramin Arogya Sahayog Trust', ARRAY['Patient Transit & Van Support', 'Cashless Medicine Grants', 'Caregiver Food Support'], '+91 98230 77112', 'contact@graminarogya.org', 'Kavita Shinde', 'Gadchiroli', 'Maharashtra', TRUE),
('00000000-0000-0000-0000-000000000021', 'MH/2019/0188204', 'Vidarbha Rural Health Aid Foundation', ARRAY['Emergency Ambulance Grant', 'Dialysis Financial Subsidies'], '+91 94220 33819', 'aid@vidarbhahealth.org', 'Mahesh Wankhede', 'Nagpur', 'Maharashtra', TRUE)
ON CONFLICT (ngo_darpan_id) DO NOTHING;

-- 5. Government Assistance Schemes
INSERT INTO government_schemes (id, scheme_code, name, description, benefits_summary, eligibility_criteria, official_portal_url, is_active)
VALUES
('00000000-0000-0000-0000-000000000030', 'PMJAY', 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)', 'National flagship public health insurance providing up to Rs. 5 Lakh cashless hospital coverage per family per year for secondary and tertiary care hospitalization.', 'Rs. 5,00,000 cashless hospitalization coverage per family/year', ARRAY['SECC 2011 Verified Families', 'Active PM-JAY / ABHA Card Holders', 'Low Income & Priority Rural Households'], 'https://nha.gov.in', TRUE),
('00000000-0000-0000-0000-000000000031', 'MJPJAY', 'Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)', 'Government of Maharashtra health insurance scheme covering 996 medical procedures up to Rs. 1.5 Lakh to 5 Lakh for state residents.', 'Cashless treatment for 996 recognized procedures across empanelled hospitals', ARRAY['Yellow/Orange Ration Card Holders', 'Antyodaya Anna Yojana (AAY) Beneficiaries', 'Permanent Residents of Maharashtra'], 'https://www.jeevandayee.gov.in', TRUE),
('00000000-0000-0000-0000-000000000032', 'JSSK', 'Janani Shishu Suraksha Karyakram (JSSK)', 'Guarantees completely cashless delivery and care for sick newborns in all public health institutions including free drugs, diagnostics, and diet.', '100% Free delivery, C-section, medicines, food, and transport for mother & neonate', ARRAY['All pregnant women delivering in public health institutions', 'All sick infants accessing public healthcare'], 'https://nhm.gov.in', TRUE)
ON CONFLICT (scheme_code) DO NOTHING;

-- 6. User Profiles (Mock Personas for Demonstration)
INSERT INTO profiles (id, full_name, phone, email, date_of_birth, gender, blood_group, village, taluka, district, state, pincode, assigned_phc_id, abha_id, ration_card_number, pmjay_status, emergency_contact, role)
VALUES
('00000000-0000-0000-0000-000000000100', 'Rameshwar Patil', '+91 98234 11204', 'rameshwar.patil@ruralmail.in', '1978-04-12', 'Male', 'B+', 'Ashti', 'Chamorshi', 'Gadchiroli', 'Maharashtra', '442707', '00000000-0000-0000-0000-000000000001', '91-4821-3902-8172', 'RC-MH-2024-81920', 'PM-JAY & MJPJAY Eligible', '+91 94221 88301 (Spouse)', 'patient'),
('00000000-0000-0000-0000-000000000101', 'Dr. Ananya Deshmukh', '+91 94231 09844', 'dr.ananya@phc.maha.gov.in', '1988-09-24', 'Female', 'O+', 'Ashti', 'Chamorshi', 'Gadchiroli', 'Maharashtra', '442707', '00000000-0000-0000-0000-000000000001', '91-1029-4411-9988', NULL, 'Government Medical Officer', '+91 94231 00000', 'phc_staff'),
('00000000-0000-0000-0000-000000000102', 'Dr. Rajesh Kulkarni', '+91 98220 44512', 'dr.kulkarni@civilhospital.org', '1975-02-18', 'Male', 'A+', 'Complex Area', 'Gadchiroli', 'Gadchiroli', 'Maharashtra', '442605', NULL, '91-3847-2200-1122', NULL, 'Consultant Cardiologist', '+91 98220 00000', 'doctor'),
('00000000-0000-0000-0000-000000000103', 'Dr. Sandeep Meshram', '+91 712 2744400', 'referrals@gmc-nagpur.gov.in', '1980-07-15', 'Male', 'AB+', 'Hanuman Nagar', 'Nagpur', 'Nagpur', 'Maharashtra', '440003', NULL, '91-9981-5544-3322', NULL, 'Hospital Referral Nodal Officer', '+91 712 2744401', 'hospital_staff'),
('00000000-0000-0000-0000-000000000104', 'Kavita Shinde', '+91 98230 77112', 'contact@graminarogya.org', '1984-11-03', 'Female', 'O+', 'Gadchiroli', 'Gadchiroli', 'Gadchiroli', 'Maharashtra', '442605', NULL, NULL, NULL, 'NGO Aid Coordinator', '+91 98230 00000', 'ngo_staff'),
('00000000-0000-0000-0000-000000000105', 'DHO Gadchiroli Administration', '+91 7132 222104', 'dho.gadchiroli@health.gov.in', '1972-01-01', 'Male', 'B+', 'Collectorate', 'Gadchiroli', 'Gadchiroli', 'Maharashtra', '442605', NULL, NULL, NULL, 'District Health Officer', '+91 7132 222100', 'district_admin');

-- 7. Doctors Registry
INSERT INTO doctors (id, profile_id, medical_council_id, full_name, specialization, phone, email, facility_type, phc_id, hospital_id, is_on_duty, is_verified)
VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000101', 'MMC/2014/08/3819', 'Dr. Ananya Deshmukh', 'General Medicine & Public Health', '+91 94231 09844', 'dr.ananya@phc.maha.gov.in', 'phc', '00000000-0000-0000-0000-000000000001', NULL, TRUE, TRUE),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000102', 'MMC/2012/04/1089', 'Dr. Rajesh Kulkarni', 'Cardiology & Internal Medicine', '+91 98220 44512', 'dr.kulkarni@civilhospital.org', 'hospital', NULL, '00000000-0000-0000-0000-000000000010', TRUE, TRUE)
ON CONFLICT (medical_council_id) DO NOTHING;

-- 8. Master Medicine Catalogue
INSERT INTO medicines (id, medicine_code, name, generic_name, dosage_form, standard_unit, description, is_essential)
VALUES
('00000000-0000-0000-0000-000000000201', 'MED-AML-005', 'Amlodipine 5mg', 'Amlodipine Besylate', 'Tablet', 'strips', 'Essential calcium channel blocker for chronic hypertension and blood pressure management in rural primary care.', TRUE),
('00000000-0000-0000-0000-000000000202', 'MED-MET-500', 'Metformin 500mg', 'Metformin Hydrochloride', 'Tablet', 'strips', 'First-line medication for the treatment of type 2 diabetes mellitus.', TRUE),
('00000000-0000-0000-0000-000000000203', 'MED-ORS-001', 'Oral Rehydration Salts (ORS)', 'Oral Rehydration Salts IP', 'Sachet', 'sachets', 'WHO formula electrolyte replenishment for acute pediatric and adult dehydration.', TRUE),
('00000000-0000-0000-0000-000000000204', 'MED-IFA-001', 'Iron & Folic Acid (IFA) Tablets', 'Dried Ferrous Sulfate & Folic Acid', 'Tablet', 'strips', 'Essential maternal & adolescent prophylactic treatment for nutritional anemia.', TRUE),
('00000000-0000-0000-0000-000000000205', 'MED-PCM-500', 'Paracetamol 500mg', 'Paracetamol IP', 'Tablet', 'strips', 'Standard analgesic and antipyretic for acute fever, headache, and body aches.', TRUE),
('00000000-0000-0000-0000-000000000206', 'MED-AMX-500', 'Amoxicillin 500mg', 'Amoxicillin Trihydrate', 'Capsule', 'strips', 'Broad-spectrum penicillin antibiotic for respiratory tract and soft tissue infections.', TRUE)
ON CONFLICT (medicine_code) DO NOTHING;

-- 9. PHC Medicine Inventory (With Depletion Triggers)
INSERT INTO medicine_inventory (phc_id, medicine_id, current_quantity, minimum_threshold, batch_number, expiry_date, last_restocked_at)
VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 34, 150, 'BT-AML-2025-09', '2027-08-31', NOW() - INTERVAL '18 days'), -- Low stock (3.4 days remaining)
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 820, 200, 'BT-MET-2026-01', '2028-01-31', NOW() - INTERVAL '5 days'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 450, 100, 'BT-ORS-2025-11', '2027-11-30', NOW() - INTERVAL '12 days'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000204', 1200, 300, 'BT-IFA-2026-02', '2028-03-31', NOW() - INTERVAL '8 days'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000205', 980, 200, 'BT-PCM-2026-03', '2028-04-30', NOW() - INTERVAL '3 days')
ON CONFLICT (phc_id, medicine_id) DO NOTHING;

-- 10. Historical Medicine Usage Records (For Future ML / Forecasting)
INSERT INTO medicine_usage (phc_id, medicine_id, quantity_consumed, recorded_date, usage_context)
VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 12, CURRENT_DATE - 1, 'OPD Hypertension Dispensation'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 10, CURRENT_DATE - 2, 'OPD Hypertension Dispensation'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 15, CURRENT_DATE - 3, 'Weekly NCD Screening Camp'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 25, CURRENT_DATE - 1, 'Monsoon Diarrhea Treatment');

-- 11. Patient Healthcare Case (Active Case)
INSERT INTO health_cases (id, case_number, patient_id, caregiver_mode, primary_concern, category, urgency, status, initial_phc_id, notes)
VALUES
('00000000-0000-0000-0000-000000000301', 'JVS-MH-7A82K1', '00000000-0000-0000-0000-000000000100', 'myself', 'Chronic Chest Heaviness, Dyspnea on Moderate Exertion, Uncontrolled BP', 'Cardiology & Hypertension', 'urgent', 'referred', '00000000-0000-0000-0000-000000000001', 'Patient presented at Ashti PHC with recurrent exertional chest discomfort. Primary ECG shows ST elevation changes; referred to District Civil Hospital for 2D Echo and specialist evaluation.')
ON CONFLICT (case_number) DO NOTHING;

INSERT INTO health_case_vitals (case_id, systolic_bp, diastolic_bp, blood_sugar, hemoglobin, temperature, pulse_rate, notes, recorded_by_id)
VALUES
('00000000-0000-0000-0000-000000000301', 154, 98, 142.5, 11.8, 98.4, 88, 'Vitals recorded during Ashti PHC triage.', '00000000-0000-0000-0000-000000000101');

-- 12. Active Referral & 6-Stage Timeline Events
INSERT INTO referrals (id, referral_number, case_id, patient_id, originating_phc_id, destination_hospital_id, required_specialty, clinical_summary, status, priority, estimated_travel_distance_km, ngo_transport_id)
VALUES
('00000000-0000-0000-0000-000000000401', 'REF-2026-001', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Cardiology OPD', '48-year-old male with persistent exertional angina and Stage 2 hypertension. Requires specialized Cardiology OPD evaluation, 2D Echocardiography, and PM-JAY pre-authorization.', 'destination_accepted', 'urgent', 42.5, '00000000-0000-0000-0000-000000000020')
ON CONFLICT (referral_number) DO NOTHING;

INSERT INTO referral_events (referral_id, stage, event_title, note, actor_id, created_at)
VALUES
('00000000-0000-0000-0000-000000000401', 'created', 'Referral Created at Ashti PHC', 'Medical Officer initiated referral to District Civil Hospital Gadchiroli.', '00000000-0000-0000-0000-000000000101', NOW() - INTERVAL '4 hours'),
('00000000-0000-0000-0000-000000000401', 'patient_notified', 'SMS Notification Sent to Patient', 'SMS notification with Referral ID and document checklist sent to patient mobile number.', NULL, NOW() - INTERVAL '3 hours 50 minutes'),
('00000000-0000-0000-0000-000000000401', 'destination_accepted', 'District Hospital Accepted Referral', 'Dr. Rajesh Kulkarni reviewed clinical summary and assigned Cardiology OPD token.', '00000000-0000-0000-0000-000000000102', NOW() - INTERVAL '2 hours 30 minutes');

-- 13. Citizen Feedback
INSERT INTO feedback (case_id, facility_type, phc_id, hospital_id, rating, category, message, is_anonymous, contact_name, contact_phone, status)
VALUES
('00000000-0000-0000-0000-000000000301', 'phc', '00000000-0000-0000-0000-000000000001', NULL, 5, 'phc_visit', 'Prompt doctor consultation at Ashti PHC. The medical officer explained the referral process clearly.', FALSE, 'Rameshwar Patil', '+91 98234 11204', 'reviewed');

-- 14. System Notifications
INSERT INTO notifications (recipient_id, type, title, message, channel, is_read, delivery_status)
VALUES
('00000000-0000-0000-0000-000000000100', 'referral_update', 'Referral Accepted: District Civil Hospital', 'Your referral (JVS-MH-7A82K1) has been accepted by District Civil Hospital Gadchiroli Cardiology OPD. Please carry your Aadhaar & Ration Card.', 'sms', TRUE, 'delivered'),
('00000000-0000-0000-0000-000000000101', 'medicine_stock_alert', 'Low Stock Warning: Amlodipine 5mg', 'Ashti PHC has 34 strips of Amlodipine 5mg remaining (below minimum threshold of 150). Indent request queued.', 'in_app', FALSE, 'sent');
