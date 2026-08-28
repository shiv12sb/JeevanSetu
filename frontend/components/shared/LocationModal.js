"use client";

import React, { useState } from "react";
import { useLocation } from "@/context/LocationContext";
import { useLanguage } from "@/context/LanguageContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
} from "lucide-react";

const LOCATION_TEXTS = {
  en: {
    modalTitle: "📍 Maharashtra Healthcare Location & Live GPS Selector",
    gpsBadge: "Live GPS Auto-Detection",
    gpsTitle: "Find nearest healthcare facilities based on your current location",
    gpsDesc: "1-Click GPS automatically detects your closest district to load verified on-duty doctors and ICU beds.",
    gpsBtn: "🎯 Auto-Detect My Location",
    gpsDetecting: "Detecting GPS Location...",
    detectedDistrict: "Detected District:",
    accuracy: "Accuracy:",
    activeDistrictLabel: "Active Selected District:",
    searchPlaceholder: "Search district (e.g. Nagpur, Pune, Amravati, Nashik...)",
    allRegions: "All 36 Districts",
    vidarbha: "Vidarbha",
    westMh: "Western Maharashtra",
    marathwada: "Marathwada",
    northMh: "North Maharashtra",
    konkan: "Konkan",
    noMatch: "No district found matching",
    selectedBadge: "Selected",
    pinLabel: "PIN Prefix:",
  },
  hi: {
    modalTitle: "📍 महाराष्ट्र स्वास्थ्य स्थान एवं लाइव GPS चयन",
    gpsBadge: "स्वचालित लाइव GPS खोज",
    gpsTitle: "अपने वर्तमान स्थान के अनुसार निकटतम अस्पताल एवं डॉक्टर खोजें",
    gpsDesc: "1-क्लिक GPS आपके निकटतम जिले का पता लगाकर सत्यापित ऑन-ड्यूटी डॉक्टर व आईसीयू बेड लोड करता है।",
    gpsBtn: "🎯 लाइव GPS से स्थान खोजें",
    gpsDetecting: "स्थान खोजा जा रहा है...",
    detectedDistrict: "खोजी गई जिला:",
    accuracy: "सटीकता:",
    activeDistrictLabel: "सक्रिय चयनित जिला:",
    searchPlaceholder: "जिला खोजें (उदा. Nagpur, Pune, अमरावती, नासिक...)",
    allRegions: "सभी 36 जिले",
    vidarbha: "विदर्भ",
    westMh: "पश्चिम महाराष्ट्र",
    marathwada: "मराठवाड़ा",
    northMh: "उत्तर महाराष्ट्र",
    konkan: "कोंकण",
    noMatch: "इस नाम से कोई जिला नहीं मिला",
    selectedBadge: "चयनित",
    pinLabel: "पिन कोड:",
  },
  mr: {
    modalTitle: "📍 महाराष्ट्र आरोग्य स्थान व थेट GPS निवड",
    gpsBadge: "स्वयंचलित GPS थेट स्थान",
    gpsTitle: "तुमच्या सध्याच्या लोकेशननुसार जवळचे रुग्णालय व डॉक्टर शोधा",
    gpsDesc: "१-क्लिक GPS द्वारे तुमचा अचूक जिल्हा निवडून तात्काळ ऑन-ड्यूटी डॉक्टर व बेडची माहिती मिळवा.",
    gpsBtn: "🎯 थेट GPS लोकेशन मिळवा",
    gpsDetecting: "GPS शोधत आहे...",
    detectedDistrict: "शोधलेला जिल्हा:",
    accuracy: "अचूकता:",
    activeDistrictLabel: "सध्या निवडलेला जिल्हा:",
    searchPlaceholder: "जिल्हा शोधा (उदा. Nagpur, Pune, अमरावती, नाशिक...)",
    allRegions: "सर्व ३६ जिल्हे",
    vidarbha: "विदर्भ",
    westMh: "पश्चिम महाराष्ट्र",
    marathwada: "मराठवाडा",
    northMh: "उत्तर महाराष्ट्र",
    konkan: "कोकण",
    noMatch: "या नावाने कोणताही जिल्हा आढळला नाही",
    selectedBadge: "निवडलेले",
    pinLabel: "पिन कोड:",
  },
};

export function LocationModal({ isOpen, onClose }) {
  const {
    selectedDistrict,
    changeDistrict,
    autoDetectGps,
    isDetectingGps,
    liveGpsDetails,
    allDistricts,
    currentDistrictObj,
  } = useLocation();
  const { language } = useLanguage();

  const txt = LOCATION_TEXTS[language] || LOCATION_TEXTS.en;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const regions = [
    { id: "all", label: txt.allRegions },
    { id: "vidarbha", label: txt.vidarbha },
    { id: "western maharashtra", label: txt.westMh },
    { id: "marathwada", label: txt.marathwada },
    { id: "north maharashtra", label: txt.northMh },
    { id: "konkan", label: txt.konkan },
  ];

  const filteredDistricts = allDistricts.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.marathiName.includes(searchQuery) ||
      d.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hq.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion =
      selectedRegion === "all" || d.region.toLowerCase().includes(selectedRegion);

    return matchesSearch && matchesRegion;
  });

  const handleSelectDistrict = (districtName) => {
    changeDistrict(districtName);
    if (onClose) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={txt.modalTitle}
      size="lg"
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* 1. Live GPS Auto-Detect Banner */}
        <div className="p-4 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl border border-teal-700 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  {txt.gpsBadge}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {txt.gpsTitle}
              </h3>
              <p className="text-[11px] text-teal-200/90 leading-relaxed">
                {txt.gpsDesc}
              </p>
            </div>

            <Button
              type="button"
              onClick={autoDetectGps}
              disabled={isDetectingGps}
              className="bg-teal-500 hover:bg-teal-400 text-teal-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg gap-2 shrink-0 cursor-pointer"
            >
              <Navigation className={`w-4 h-4 ${isDetectingGps ? "animate-spin" : ""}`} />
              <span>{isDetectingGps ? txt.gpsDetecting : txt.gpsBtn}</span>
            </Button>
          </div>

          {/* If Live GPS details are available */}
          {liveGpsDetails && (
            <div className="p-2.5 bg-teal-950/80 rounded-xl border border-teal-600/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-white">{txt.detectedDistrict}</strong> {liveGpsDetails.districtName} ({liveGpsDetails.marathiName})
                  <span className="text-teal-300 text-[11px] ml-2">
                    (Lat: {liveGpsDetails.lat}°, Lng: {liveGpsDetails.lng}°)
                  </span>
                </span>
              </div>
              <Badge variant="teal" size="sm" className="w-fit">
                {txt.accuracy} ~{liveGpsDetails.accuracyMeters}m • {liveGpsDetails.detectedAt}
              </Badge>
            </div>
          )}
        </div>

        {/* 2. Active District Indicator */}
        <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {txt.activeDistrictLabel}
            </span>
            <strong className="text-xs text-teal-800 dark:text-teal-300 font-bold">
              {selectedDistrict} {language !== "en" && `(${currentDistrictObj?.marathiName})`}
            </strong>
          </div>
          <span className="text-[10px] text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-medium">
            {currentDistrictObj?.region}
          </span>
        </div>

        {/* 3. Search & Region Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={txt.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {regions.map((reg) => (
              <button
                key={reg.id}
                type="button"
                onClick={() => setSelectedRegion(reg.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedRegion === reg.id
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Maharashtra 36 Districts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 max-h-72 overflow-y-auto">
          {filteredDistricts.length === 0 ? (
            <div className="col-span-full p-6 text-center text-xs text-slate-500">
              {txt.noMatch} "{searchQuery}".
            </div>
          ) : (
            filteredDistricts.map((dist) => {
              const isSelected =
                selectedDistrict.toLowerCase() === dist.name.toLowerCase() ||
                selectedDistrict.toLowerCase() === dist.id.toLowerCase();

              return (
                <button
                  key={dist.id}
                  type="button"
                  onClick={() => handleSelectDistrict(dist.name)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500 ring-2 ring-teal-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {dist.name}
                      </div>
                      <div className="text-xs text-teal-700 dark:text-teal-400 font-semibold">
                        {language === "en" ? dist.hq : dist.marathiName}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] bg-teal-600 text-white px-1.5 py-0.5 rounded font-bold">
                        {txt.selectedBadge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span>{dist.region}</span>
                    <span>{txt.pinLabel} {dist.pinPrefix}xxx</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}

export default LocationModal;
