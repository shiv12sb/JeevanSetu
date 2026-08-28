"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "@/context/LocationContext";
import { useLanguage } from "@/context/LanguageContext";
import { LocationModal } from "@/components/shared/LocationModal";
import {
  MapPin,
  Navigation,
  Search,
  Check,
  ChevronDown,
  Building2,
  Maximize2,
} from "lucide-react";

const SELECTOR_TEXTS = {
  en: {
    selectDistrictHeader: "Select Active District",
    badgeMaha: "Maharashtra (36)",
    gpsDetectBtn: "🎯 Auto-Detect via Live GPS",
    gpsDetecting: "Detecting GPS Location...",
    openModalBtn: "📍 Open Full Map & District Popup",
    searchPlaceholder: "Search Nagpur, Pune, Nashik...",
    footerNote: "36 Districts Live On-Duty Doctors & Beds",
    titleTooltip: "Change Active District / Location",
    noMatch: "No district found for",
  },
  hi: {
    selectDistrictHeader: "सक्रिय जिला चुनें",
    badgeMaha: "महाराष्ट्र (36)",
    gpsDetectBtn: "🎯 लाइव GPS से स्थान खोजें",
    gpsDetecting: "स्थान खोजा जा रहा है...",
    openModalBtn: "📍 पूरा जिला विवरण पॉपअप खोलें",
    searchPlaceholder: "जिला खोजें (नागपुर, पुणे, नासिक...)",
    footerNote: "36 जिलों के लाइव ऑन-ड्यूटी डॉक्टर एवं बेड",
    titleTooltip: "सक्रिय जिला / स्थान बदलें",
    noMatch: "इस नाम से कोई जिला नहीं मिला:",
  },
  mr: {
    selectDistrictHeader: "सक्रिय जिल्हा निवडा",
    badgeMaha: "महाराष्ट्र (३६)",
    gpsDetectBtn: "🎯 ऑटो GPS द्वारे थेट स्थान शोधा",
    gpsDetecting: "GPS थेट स्थान शोधत आहे...",
    openModalBtn: "📍 पूर्ण जिल्हा नकाशा व तपशील पॉपअप उघडा",
    searchPlaceholder: "जिल्हा शोधा (नागपूर, पुणे, नाशिक...)",
    footerNote: "३६ जिल्ह्यांचे थेट ऑन-ड्यूटी डॉक्टर व बेड्स",
    titleTooltip: "सक्रिय जिल्हा / लोकेशन बदला",
    noMatch: "या नावाने कोणताही जिल्हा आढळला नाही:",
  },
};

export function LocationSelector({ isCompact = false, isDark = false, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const {
    selectedDistrict,
    changeDistrict,
    autoDetectGps,
    isDetectingGps,
    allDistricts,
  } = useLocation();
  const { language } = useLanguage();

  const txt = SELECTOR_TEXTS[language] || SELECTOR_TEXTS.en;

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredDistricts = allDistricts.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.marathiName.includes(searchQuery) ||
      d.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (districtName) => {
    changeDistrict(districtName);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
            isDark
              ? "bg-teal-800/80 text-white border-teal-600 hover:bg-teal-700"
              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-teal-500"
          }`}
          title={txt.titleTooltip}
        >
          <MapPin className={`w-3.5 h-3.5 ${isDark ? "text-teal-300 animate-pulse" : "text-teal-600 dark:text-teal-400"}`} />
          <span className="truncate max-w-[90px] sm:max-w-[130px]">
            {selectedDistrict}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-72 sm:w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header & GPS auto-detect */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {txt.selectDistrictHeader}
                </span>
                <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold px-1.5 py-0.5 rounded">
                  {txt.badgeMaha}
                </span>
              </div>

              {/* GPS Auto-Detect Button */}
              <button
                type="button"
                onClick={() => {
                  autoDetectGps();
                  setIsOpen(false);
                }}
                disabled={isDetectingGps}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:bg-teal-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? "animate-spin" : ""}`} />
                <span>{isDetectingGps ? txt.gpsDetecting : txt.gpsDetectBtn}</span>
              </button>

              {/* Full Modal Popup Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{txt.openModalBtn}</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={txt.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Highlight Pills */}
            <div className="px-2.5 py-1.5 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
              {["Nagpur", "Gadchiroli", "Chandrapur", "Amravati", "Pune", "Mumbai City"].map((quickDist) => (
                <button
                  key={quickDist}
                  type="button"
                  onClick={() => handleSelect(quickDist)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                    selectedDistrict.toLowerCase().includes(quickDist.toLowerCase())
                      ? "bg-teal-600 text-white shadow-2xs"
                      : "bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-teal-100 dark:hover:bg-teal-900/60"
                  }`}
                >
                  {quickDist}
                </button>
              ))}
            </div>

            {/* District List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
              {filteredDistricts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  {txt.noMatch} "{searchQuery}".
                </div>
              ) : (
                filteredDistricts.map((d) => {
                  const isSelected =
                    selectedDistrict.toLowerCase() === d.name.toLowerCase() ||
                    selectedDistrict.toLowerCase() === d.id.toLowerCase();
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelect(d.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-all text-xs cursor-pointer ${
                        isSelected
                          ? "bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-bold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {d.name}
                          </span>
                          {language !== "en" && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              ({d.marathiName})
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {d.region} • PIN: {d.pinPrefix}xxx
                        </span>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer note */}
            <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1">
              <Building2 className="w-3 h-3 text-teal-600" />
              <span>{txt.footerNote}</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Location Selection & Live GPS Modal Popup */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default LocationSelector;
