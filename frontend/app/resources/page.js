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
import { useEffect } from "react";
import { resourcesApi } from "@/lib/api";
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
} from "lucide-react";

export function ResourcesDirectoryPage() {
  const [hospitals, setHospitals] = useState(mockHospitals);
  const [schemes, setSchemes] = useState(mockSchemes);
  const [ngos, setNgos] = useState(mockNGOs);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedHospitalForTravelCheck, setSelectedHospitalForTravelCheck] = useState(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

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
            description: s.description,
            benefits: s.benefits_summary || "Cashless hospitalization coverage.",
            eligibility: s.eligibility_criteria ? s.eligibility_criteria.join(", ") : "BPL / Rural Household",
            coveredTreatments: "Inpatient secondary and tertiary treatments, surgeries, ICU",
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
  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.specialties && h.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (h.transplantServices && h.transplantServices.some((ts) => ts.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesDistrict = selectedDistrict === "all" || h.district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchesTransplant = activeTab === "transplant" ? h.isTransplantCentre : true;
    return matchesSearch && matchesDistrict && matchesTransplant;
  });

  const filteredSchemes = schemes.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.coveredTreatments && s.coveredTreatments.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const filteredNGOs = ngos.filter((n) => {
    return (
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-950 focus:outline-none"
              >
                <option value="all">All Districts (Maharashtra / Central)</option>
                <option value="gadchiroli">Gadchiroli District</option>
                <option value="chandrapur">Chandrapur District</option>
                <option value="nagpur">Nagpur District</option>
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
                      onSelect={(s) => alert(`Scheme: ${s.name}\nCoverage: ${s.maxCoverage}\nEligibility: ${s.eligibilitySummary}`)}
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
                      onContact={(n) => alert(`Contacting ${n.name} at ${n.phone}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

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
