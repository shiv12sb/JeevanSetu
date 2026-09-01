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
      <div className={`inline-flex items-center gap-1 p-1 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-200/90 dark:border-white/15 shadow-xs ${className}`}>
        <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 ml-1 shrink-0" />
        {languages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer select-none ${
                isActive
                  ? "bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-950 font-black shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
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
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
          isDark
            ? "bg-teal-800/80 text-white border-teal-600 hover:bg-teal-700"
            : "bg-white dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 border-slate-200/90 dark:border-white/15 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-teal-400"
        }`}
        aria-expanded={isOpen}
        aria-label="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
        <span className="font-bold">{activeLangObj.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform text-slate-500 dark:text-slate-400 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200/90 dark:border-white/15 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
          <div className="px-3 py-1 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/10 mb-1">
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
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-teal-50 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
                }`}
              >
                <span>{lang.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
