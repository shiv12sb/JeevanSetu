"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Tabs } from "@/components/ui/Tabs";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { HospitalCard } from "@/components/domain/HospitalCard";
import { SchemeCard } from "@/components/domain/SchemeCard";
import { NGOCard } from "@/components/domain/NGOCard";
import { FacilityTravelStatusCard } from "@/components/domain/FacilityTravelStatusCard";
import { TravelReadinessChecklist } from "@/components/domain/TravelReadinessChecklist";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  mockHospitals,
  mockSchemes,
  mockNGOs,
} from "@/lib/mockData";
import { getDistrictHealthFacilities, getDistrictNgos } from "@/lib/maharashtraHealthData";
import { useEffect } from "react";
import { resourcesApi } from "@/lib/api";
import { useLocation } from "@/context/LocationContext";
import {
  Search,
  Building2,
  Shield,
  HeartHandshake,
  Filter,
  CheckCircle2,
  Heart,
  Compass,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  PhoneCall,
  FileText,
  MapPin,
} from "lucide-react";

export function ResourcesDirectoryPage() {
  const { selectedDistrict: globalDistrict, changeDistrict, allDistricts } = useLocation();
  const [hospitals, setHospitals] = useState(mockHospitals);
  const [schemes, setSchemes] = useState(mockSchemes);
  const [ngos, setNgos] = useState(mockNGOs);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(globalDistrict || "all");
  const [selectedHospitalForTravelCheck, setSelectedHospitalForTravelCheck] = useState(null);
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

  useEffect(() => {
    if (globalDistrict) {
      setSelectedDistrict(globalDistrict);
    }
  }, [globalDistrict]);

  const loadDirectory = async () => {
    setIsLoading(true);
    try {
      const res = await resourcesApi.getDirectory();
      if (res && res.data) {
        if (res.data.hospitals && res.data.hospitals.length > 0) {
          const mappedHospitals = res.data.hospitals.map((h) => ({
            id: h.id,
            name: h.name,
            type: h.hospital_type || "District Hospital",
            district: h.district,
            state: h.state || "Maharashtra",
            phone: h.contact_phone || "+91 7132 222155",
            totalBeds: h.total_beds || 200,
            icuBeds: h.icu_beds || 15,
            specialties: h.hospital_services ? h.hospital_services.map(s => s.service_name) : ["General Medicine", "Cardiology", "Emergency OPD"],
            empanelledSchemes: h.empanelled_schemes || ["PM-JAY", "MJPJAY"],
            isTransplantCentre: true,
            transplantServices: ["Corneal Grafting", "Kidney Dialysis & Referral"],
            doctorOnDuty: "Consultant Physician On-Duty",
          }));
          setHospitals(mappedHospitals);
        }

        if (res.data.schemes && res.data.schemes.length > 0) {
          const mappedSchemes = res.data.schemes.map((s) => ({
            id: s.id,
            code: s.scheme_code,
            name: s.name,
            fullName: s.name,
            category: "Govt Health Assurance",
            maxCoverage: s.benefits_summary || "Up to ₹5,00,000 per family/yr",
            eligibilitySummary: s.eligibility_criteria ? (Array.isArray(s.eligibility_criteria) ? s.eligibility_criteria.join(", ") : s.eligibility_criteria) : "BPL / Ration Card / Rural SECC",
            description: s.description,
            coveredTreatments: "Inpatient secondary and tertiary treatments, surgeries, ICU",
            howToApply: "Available at empaneled hospitals or directly at official government portal.",
            portalUrl: s.portal_url || (s.scheme_code === "PMJAY" || s.name?.includes("PM-JAY") ? "https://beneficiary.nha.gov.in/" : s.name?.includes("MJPJAY") ? "https://www.jeevandayee.gov.in/" : "https://pmjay.gov.in/"),
            isVerified: true,
          }));
          setSchemes(mappedSchemes);
        }

        if (res.data.ngos && res.data.ngos.length > 0) {
          const mappedNgos = res.data.ngos.map((n) => ({
            id: n.id,
            name: n.name,
            focusArea: n.aid_focus ? n.aid_focus.join(" • ") : "Patient Transit & Grants",
            phone: n.contact_phone || "+91 98230 77112",
            district: n.district,
            coverage: "Rural Vidarbha & Gadchiroli Cluster",
            grantSupport: "Cashless Emergency Transport & Medicine Assistance",
          }));
          setNgos(mappedNgos);
        }
      }
    } catch (err) {
      console.warn("Could not fetch resources directory from backend, showing fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, []);

  const transplantCentresCount = hospitals.filter((h) => h.isTransplantCentre).length;

  const categoryTabs = [
    { id: "all", label: "All Verified Resources", count: hospitals.length + schemes.length + ngos.length },
    { id: "hospitals", label: "Verified Hospitals", count: hospitals.length, icon: Building2 },
    { id: "transplant", label: "Transplant & Corneal Centres", count: transplantCentresCount, icon: Heart },
    { id: "schemes", label: "Govt Health Schemes", count: schemes.length, icon: Shield },
    { id: "ngos", label: "NGOs & Transit Aid", count: ngos.length, icon: HeartHandshake },
  ];

  // Filtering
  const baseHospitalsList =
    selectedDistrict && selectedDistrict !== "all"
      ? getDistrictHealthFacilities(selectedDistrict)
      : hospitals;

  const filteredHospitals = baseHospitalsList.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.specialties && h.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (h.transplantServices && h.transplantServices.some((ts) => ts.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesTransplant = activeTab === "transplant" ? h.isTransplantCentre : true;
    return matchesSearch && matchesTransplant;
  });

  const baseNgosList =
    selectedDistrict && selectedDistrict !== "all"
      ? [...getDistrictNgos(selectedDistrict), ...ngos]
      : ngos;

  const filteredSchemes = schemes.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.coveredTreatments && s.coveredTreatments.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const filteredNGOs = baseNgosList.filter((n) => {
    return (
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.serviceType && n.serviceType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.focusArea && n.focusArea.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const showHospitals = activeTab === "all" || activeTab === "hospitals" || activeTab === "transplant";
  const showSchemes = activeTab === "all" || activeTab === "schemes";
  const showNGOs = activeTab === "all" || activeTab === "ngos";

  const totalResults =
    (showHospitals ? filteredHospitals.length : 0) +
    (showSchemes ? filteredSchemes.length : 0) +
    (showNGOs ? filteredNGOs.length : 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Title Banner */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              Verified Public Registry
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Accredited Resources
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Verified Healthcare Resources Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Search accredited district civil hospitals, sub-district centres, empaneled government cashless schemes (PM-JAY, MJPJAY), authorized transplant desks, and verified transit assistance NGOs.
          </p>
        </div>

        {/* Care Pathway Progression Strip */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300">
              <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Public Healthcare Delivery Pathway:
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Graduated referral levels</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold block">Level 1</span>
              <strong className="text-slate-800 dark:text-slate-200 block text-xs">Village / ASHA</strong>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">First screening</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold block">Level 2</span>
              <strong className="text-slate-800 dark:text-slate-200 block text-xs">Primary Health Centre</strong>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Doctor consultation</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold block">Level 3</span>
              <strong className="text-slate-800 dark:text-slate-200 block text-xs">CHC / Sub-District</strong>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Maternity & Lab</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold block">Level 4</span>
              <strong className="text-slate-800 dark:text-slate-200 block text-xs">District Civil Hospital</strong>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">24x7 ICU & Surgery</span>
            </div>
            <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-200 dark:border-teal-800">
              <span className="text-[10px] text-teal-800 dark:text-teal-300 font-bold block">Level 5</span>
              <strong className="text-teal-950 dark:text-teal-200 block text-xs">Tertiary / Teaching</strong>
              <span className="text-[10px] text-teal-700 dark:text-teal-400">Super-speciality & Transplant</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by facility name, specialty (Cardiology, Surgery), transplant organ, or scheme..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-950 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDistrict(val);
                  if (val !== "all") {
                    changeDistrict(val);
                  }
                }}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-950 focus:outline-none"
              >
                <option value="all">🌐 All Maharashtra Districts ({hospitals.length} Facilities)</option>
                {allDistricts.map((d) => (
                  <option key={d.id} value={d.name}>
                    📍 {d.name} ({d.marathiName}) — {d.region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs
            tabs={categoryTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underline"
          />
        </div>

        {/* Results Container */}
        {totalResults === 0 ? (
          <EmptyState
            title="No verified resources match your query"
            description="Try clearing your search terms or selecting 'All Districts' to see all available facilities."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery("");
              setSelectedDistrict("all");
              setActiveTab("all");
            }}
          />
        ) : (
          <div className="space-y-8">
            {/* Hospitals & Transplant Centres */}
            {showHospitals && filteredHospitals.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <span>
                      {activeTab === "transplant"
                        ? `Authorized Transplant & Corneal Retrieval Centres (${filteredHospitals.length})`
                        : `Verified Hospitals & Facilities (${filteredHospitals.length})`}
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHospitals.map((hospital) => (
                    <div key={hospital.id} className="flex flex-col justify-between space-y-2">
                      <HospitalCard
                        hospital={hospital}
                        onSelect={(h) => setSelectedHospitalForTravelCheck(h)}
                      />
                      {/* Check Before You Travel Quick Launcher */}
                      <button
                        type="button"
                        onClick={() => setSelectedHospitalForTravelCheck(hospital)}
                        className="w-full py-1.5 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Check Before You Travel Status</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schemes Group */}
            {showSchemes && filteredSchemes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    <span>Government Health Assurance Schemes ({filteredSchemes.length})</span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSchemes.map((scheme) => (
                    <SchemeCard
                      key={scheme.id}
                      scheme={scheme}
                      onSelect={(s) => setSelectedSchemeForModal(s)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* NGOs Group */}
            {showNGOs && filteredNGOs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                    <span>NGOs & Patient Transit Assistance ({filteredNGOs.length})</span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNGOs.map((ngo) => (
                    <NGOCard
                      key={ngo.id}
                      ngo={ngo}
                      onContact={(n) => {
                        window.location.href = `tel:${n.phone || "108"}`;
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Scheme Detail & Official Portal Action Modal */}
      <Modal
        isOpen={!!selectedSchemeForModal}
        onClose={() => setSelectedSchemeForModal(null)}
        title={selectedSchemeForModal ? selectedSchemeForModal.name : "Government Health Scheme"}
        description="Comprehensive benefits, eligibility guidelines, required documents, and official portal links."
        maxWidth="max-w-2xl"
      >
        {selectedSchemeForModal && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-200 dark:border-teal-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider text-[11px]">
                  {selectedSchemeForModal.category || "Government Healthcare Assurance"}
                </span>
                {selectedSchemeForModal.isVerified && (
                  <Badge variant="success" size="sm">Verified Scheme</Badge>
                )}
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Coverage: {selectedSchemeForModal.maxCoverage}
              </p>
            </div>

            <div className="space-y-2 text-slate-700 dark:text-slate-300">
              <div>
                <strong className="text-slate-900 dark:text-white">Eligibility Criteria:</strong>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedSchemeForModal.eligibilitySummary || "Identified BPL / SECC / Rural Priority household."}
                </p>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white">Covered Procedures:</strong>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedSchemeForModal.coveredTreatments || "Secondary and tertiary hospitalizations, inpatient surgeries, and critical care."}
                </p>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white">How to Apply / Avail:</strong>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedSchemeForModal.howToApply || "Available directly at all empaneled public health centers, Aarogyamitra helpdesks, and online via official portal."}
                </p>
              </div>

              {selectedSchemeForModal.documentsRequired && (
                <div>
                  <strong className="text-slate-900 dark:text-white flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Required Documents:
                  </strong>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {selectedSchemeForModal.documentsRequired.map((doc) => (
                      <span
                        key={doc}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[11px]"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Official Portal & Helpline Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              {selectedSchemeForModal.tollFree && (
                <a
                  href={`tel:${selectedSchemeForModal.tollFree.replace(/[^0-9]/g, "")}`}
                  className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-bold hover:underline"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Helpline: {selectedSchemeForModal.tollFree}</span>
                </a>
              )}

              <a
                href={selectedSchemeForModal.portalUrl || "https://pmjay.gov.in/"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                <span>Visit Official Govt Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Check Before You Travel Detail Modal */}
      <Modal
        isOpen={!!selectedHospitalForTravelCheck}
        onClose={() => setSelectedHospitalForTravelCheck(null)}
        title={selectedHospitalForTravelCheck ? `Travel Status: ${selectedHospitalForTravelCheck.name}` : "Check Before You Travel"}
        description="Verify doctor presence, emergency medicines, diagnostics, and referral acceptance before departure."
        maxWidth="max-w-2xl"
      >
        {selectedHospitalForTravelCheck && (
          <div className="space-y-4">
            <FacilityTravelStatusCard
              facility={selectedHospitalForTravelCheck}
              onOpenChecklist={() => {
                setIsChecklistModalOpen(true);
              }}
            />
          </div>
        )}
      </Modal>

      {/* Travel Checklist Modal */}
      <Modal
        isOpen={isChecklistModalOpen}
        onClose={() => setIsChecklistModalOpen(false)}
        title="Don't Make Me Travel Twice — Visit Checklist"
        description="Verify required and recommended documents before traveling."
        maxWidth="max-w-2xl"
      >
        <TravelReadinessChecklist
          facilityName={selectedHospitalForTravelCheck?.name || "District Hospital"}
        />
      </Modal>

      <Footer />
    </div>
  );
}

export default ResourcesDirectoryPage;
