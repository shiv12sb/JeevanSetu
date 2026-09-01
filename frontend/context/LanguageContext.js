"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "@/lib/i18n/translations";
import { LANGUAGES } from "@/lib/constants";

const LanguageContext = createContext({
  language: "mr",
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  languages: LANGUAGES,
});

export function LanguageProvider({ children }) {
  // Default is strictly Marathi ('mr') as per Maharashtra rural healthcare mandate
  const [language, setLanguageState] = useState("mr");

  // Load language preference from localStorage if available, default to 'mr'
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("jeevansetu_language");
      if (savedLang && (savedLang === "en" || savedLang === "hi" || savedLang === "mr")) {
        setLanguageState(savedLang);
      } else {
        setLanguageState("mr");
        localStorage.setItem("jeevansetu_language", "mr");
      }
    } catch (e) {
      // ignore in ssr
    }
  }, []);

  const setLanguage = (newLang) => {
    if (newLang === "en" || newLang === "hi" || newLang === "mr") {
      setLanguageState(newLang);
      try {
        localStorage.setItem("jeevansetu_language", newLang);
      } catch (e) {
        // ignore
      }
    }
  };

  const t = (key, fallback = "") => {
    const langDict = translations[language] || translations.mr || translations.en;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const defaultDict = translations.mr || translations.en;
    if (defaultDict && defaultDict[key]) {
      return defaultDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export default LanguageContext;
