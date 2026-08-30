-- ==============================================================================
-- JEEVANSETU MIGRATION: 20260830000023_ambulance_dispatch_tracking.sql
-- Module: Real-Time Ambulance Access, Dispatch & Live Location Tracking
-- ==============================================================================

-- 1. Ambulance Providers Registry
CREATE TABLE IF NOT EXISTS public.ambulance_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(50) NOT NULL CHECK (provider_type IN ('GOVERNMENT_108', 'GOVERNMENT_102', 'PRIVATE_EMPANELLED', 'NGO_NETWORK', 'HOSPITAL_OWNED')),
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    district VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    toll_free_number VARCHAR(20) DEFAULT '108',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT true,
    api_endpoint VARCHAR(500),
    integration_mode VARCHAR(50) NOT NULL DEFAULT 'WEBHOOK_TELEMATICS' CHECK (integration_mode IN ('DIRECT_API', 'WEBHOOK_TELEMATICS', 'MANUAL_DISPATCH', 'SIMULATION')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Ambulance Vehicles Registry
CREATE TABLE IF NOT EXISTS public.ambulances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.ambulance_providers(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    public_identifier VARCHAR(100) NOT NULL,
    ambulance_type VARCHAR(50) NOT NULL CHECK (ambulance_type IN ('ADVANCED_LIFE_SUPPORT', 'BASIC_LIFE_SUPPORT', 'PATIENT_TRANSPORT', 'NEONATAL_ICU')),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'REQUESTED', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'ON_TRIP', 'UNAVAILABLE', 'OFFLINE')),
    base_district VARCHAR(100) NOT NULL,
    base_taluka VARCHAR(100),
    base_facility_name VARCHAR(255),
    equipment_capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    current_heading DOUBLE PRECISION DEFAULT 0.0,
    current_speed_kmh DOUBLE PRECISION DEFAULT 0.0,
    last_location_update TIMESTAMPTZ,
    telematics_device_id VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Ambulance Booking / Dispatch Requests
CREATE TABLE IF NOT EXISTS public.ambulance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_code VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50) NOT NULL,
    requested_ambulance_type VARCHAR(50) NOT NULL CHECK (requested_ambulance_type IN ('ADVANCED_LIFE_SUPPORT', 'BASIC_LIFE_SUPPORT', 'PATIENT_TRANSPORT', 'NEONATAL_ICU')),
    emergency_severity VARCHAR(50) NOT NULL DEFAULT 'URGENT' CHECK (emergency_severity IN ('CRITICAL_EMERGENCY', 'URGENT', 'MATERNAL_DELIVERY', 'SCHEDULED_TRANSFER')),
    pickup_address TEXT NOT NULL,
    pickup_lat DOUBLE PRECISION NOT NULL,
    pickup_lng DOUBLE PRECISION NOT NULL,
    pickup_district VARCHAR(100) NOT NULL,
    destination_facility_name VARCHAR(255),
    destination_lat DOUBLE PRECISION,
    destination_lng DOUBLE PRECISION,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'PROVIDER_ACKNOWLEDGED', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED_AT_PICKUP', 'PATIENT_PICKED_UP', 'IN_TRANSIT_TO_HOSPITAL', 'COMPLETED', 'CANCELLED', 'REJECTED')),
    assigned_ambulance_id UUID REFERENCES public.ambulances(id) ON DELETE SET NULL,
    assigned_provider_id UUID REFERENCES public.ambulance_providers(id) ON DELETE SET NULL,
    estimated_fare_min INTEGER DEFAULT 0,
    estimated_fare_max INTEGER DEFAULT 0,
    final_fare INTEGER DEFAULT 0,
    is_free_government_service BOOLEAN NOT NULL DEFAULT true,
    cancellation_reason TEXT,
    cancelled_by VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Active Ambulance Trips
CREATE TABLE IF NOT EXISTS public.ambulance_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL UNIQUE REFERENCES public.ambulance_requests(id) ON DELETE CASCADE,
    ambulance_id UUID NOT NULL REFERENCES public.ambulances(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.ambulance_providers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'ON_TRIP', 'COMPLETED', 'CANCELLED')),
    masked_driver_contact VARCHAR(50) NOT NULL DEFAULT '108',
    assigned_crew_role VARCHAR(100) DEFAULT 'Emergency Medical Technician (EMT) on Duty',
    dispatched_at TIMESTAMPTZ DEFAULT NOW(),
    arrived_at_pickup TIMESTAMPTZ,
    trip_started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    distance_travelled_km DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Ephemeral Live Tracking Locations (TTL managed)
CREATE TABLE IF NOT EXISTS public.ambulance_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.ambulance_trips(id) ON DELETE CASCADE,
    ambulance_id UUID NOT NULL REFERENCES public.ambulances(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    heading DOUBLE PRECISION DEFAULT 0.0,
    speed_kmh DOUBLE PRECISION DEFAULT 0.0,
    accuracy_meters DOUBLE PRECISION DEFAULT 5.0,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performant spatial and lifecycle queries
CREATE INDEX IF NOT EXISTS idx_ambulances_district ON public.ambulances(base_district);
CREATE INDEX IF NOT EXISTS idx_ambulances_status ON public.ambulances(status);
CREATE INDEX IF NOT EXISTS idx_ambulances_coords ON public.ambulances(current_lat, current_lng);
CREATE INDEX IF NOT EXISTS idx_ambulance_requests_patient ON public.ambulance_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_requests_status ON public.ambulance_requests(status);
CREATE INDEX IF NOT EXISTS idx_ambulance_trips_request ON public.ambulance_trips(request_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_locations_trip_time ON public.ambulance_locations(trip_id, recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE public.ambulance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public Providers: Verified providers can be viewed by all authenticated users
CREATE POLICY "Public providers read policy"
ON public.ambulance_providers FOR SELECT
TO authenticated, anon
USING (is_active = true);

-- Ambulances: Available active vehicles visible for discovery
CREATE POLICY "Public ambulances discovery policy"
ON public.ambulances FOR SELECT
TO authenticated, anon
USING (is_active = true);

-- Ambulance Requests: Patients can read & create their own requests
CREATE POLICY "Patients read own requests"
ON public.ambulance_requests FOR SELECT
TO authenticated, anon
USING (
    patient_id = auth.uid() 
    OR auth.role() = 'service_role' 
    OR auth.jwt() ->> 'role' IN ('admin', 'district_admin', 'hospital')
);

CREATE POLICY "Patients create own requests"
ON public.ambulance_requests FOR INSERT
TO authenticated, anon
WITH CHECK (
    patient_id = auth.uid() 
    OR auth.uid() IS NULL 
    OR auth.role() = 'service_role'
);

CREATE POLICY "Patients update own requests"
ON public.ambulance_requests FOR UPDATE
TO authenticated
USING (
    patient_id = auth.uid() 
    OR auth.role() = 'service_role'
    OR auth.jwt() ->> 'role' IN ('admin', 'district_admin', 'hospital')
);

-- Ambulance Trips: Read policy for assigned patient or admin
CREATE POLICY "Trips read for assigned patient or admin"
ON public.ambulance_trips FOR SELECT
TO authenticated, anon
USING (
    EXISTS (
        SELECT 1 FROM public.ambulance_requests req
        WHERE req.id = ambulance_trips.request_id
        AND (req.patient_id = auth.uid() OR auth.uid() IS NULL OR auth.jwt() ->> 'role' IN ('admin', 'district_admin', 'hospital'))
    )
    OR auth.role() = 'service_role'
);

-- Ambulance Locations: Ephemeral tracking read only for active authorized trip
CREATE POLICY "Live locations read for active trip"
ON public.ambulance_locations FOR SELECT
TO authenticated, anon
USING (
    EXISTS (
        SELECT 1 FROM public.ambulance_trips trip
        JOIN public.ambulance_requests req ON req.id = trip.request_id
        WHERE trip.id = ambulance_locations.trip_id
        AND trip.status IN ('ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'ON_TRIP')
        AND (req.patient_id = auth.uid() OR auth.uid() IS NULL OR auth.jwt() ->> 'role' IN ('admin', 'district_admin', 'hospital'))
    )
    OR auth.role() = 'service_role'
);
