"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function LanguageSelector({ variant = "dropdown", className = "", isDark = false }) {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLangObj = languages.find((l) => l.code === language) || languages[0];

  // Pill variant (1-tap direct toggle)
  if (variant === "pills") {
    return (
      <div className={`inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200 ${className}`}>
        <Globe className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0" />
        {languages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                isActive
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white/80"
              }`}
            >
              {lang.label.split(" ")[0]}
            </button>
          );
        })}
      </div>
    );
  }

  // Standard Dropdown variant (Prominent & Accessible)
  return (
    <div className={`relative inline-block text-left select-none ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
          isDark
            ? "bg-teal-800/80 text-white border-teal-600 hover:bg-teal-700"
            : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-teal-400"
        }`}
        aria-expanded={isOpen}
        aria-label="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <span className="font-semibold">{activeLangObj.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
            Choose Language / भाषा चुनें
          </div>
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-teal-50 text-teal-800 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{lang.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
