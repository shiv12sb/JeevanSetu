"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/context/LanguageContext";

const STATUS_LABELS = {
  en: {
    sufficient: "Sufficient Stock",
    depleting: "Depleting (< 5 Days)",
    critical: "Critical (< 3 Days)",
    out_of_stock: "Out of Stock",
    created: "Referral Created",
    notified: "Facility Notified",
    accepted: "Bed Confirmed / Accepted",
    hospital_reached: "Patient Arrived",
    treatment_started: "Treatment Active",
    completed: "Completed",
    active: "Active",
    active_referral: "Active Referral",
    verified: "Verified Facility",
    pending: "Pending Review",
    urgent: "Urgent Priority",
    high: "High Priority",
    normal: "Normal Priority",
    open: "Open Case",
  },
  hi: {
    sufficient: "पर्याप्त स्टॉक",
    depleting: "कम हो रहा है (< 5 दिन)",
    critical: "गंभीर स्थिति (< 3 दिन)",
    out_of_stock: "स्टॉक समाप्त",
    created: "रेफरल बनाया गया",
    notified: "अस्पताल को सूचित किया",
    accepted: "बेड / डॉक्टर पुष्टि",
    hospital_reached: "मरीज अस्पताल पहुंचा",
    treatment_started: "उपचार जारी",
    completed: "सफलतापूर्वक पूर्ण",
    active: "सक्रिय",
    active_referral: "सक्रिय रेफरल",
    verified: "सत्यापित केंद्र",
    pending: "समीक्षा लंबित",
    urgent: "अति-आवश्यक",
    high: "उच्च प्राथमिकता",
    normal: "सामान्य प्राथमिकता",
    open: "सक्रिय केस",
  },
  mr: {
    sufficient: "पुरेसा साठा",
    depleting: "साठा कमी होत आहे (< ५ दिवस)",
    critical: "गंभीर तुटवडा (< ३ दिवस)",
    out_of_stock: "साठा संपला",
    created: "रेफरल नोंदवले",
    notified: "रुग्णालयाला कळवले",
    accepted: "खाट / डॉक्टर निश्चित",
    hospital_reached: "रुग्ण दाखल झाला",
    treatment_started: "उपचार सुरू",
    completed: "पूर्ण झाले",
    active: "सक्रिय",
    active_referral: "सक्रिय रेफरल",
    verified: "प्रमाणित केंद्र",
    pending: "पडताळणी प्रलंबित",
    urgent: "अति-तात्काळ",
    high: "उच्च प्राधान्य",
    normal: "सर्वसाधारण",
    open: "नोंदणीकृत केस",
  },
};

export function StatusBadge({ status, className = "" }) {
  const { language } = useLanguage();

  const variantMap = {
    sufficient: "success",
    depleting: "warning",
    critical: "danger",
    out_of_stock: "danger",
    created: "default",
    notified: "info",
    accepted: "info",
    hospital_reached: "teal",
    treatment_started: "purple",
    completed: "success",
    active: "success",
    active_referral: "teal",
    verified: "success",
    pending: "warning",
    urgent: "danger",
    high: "warning",
    normal: "default",
    open: "teal",
  };

  const key = status?.toLowerCase() || "";
  const langDict = STATUS_LABELS[language] || STATUS_LABELS.en;
  const label = langDict[key] || STATUS_LABELS.en[key] || status || "Unknown";
  const variant = variantMap[key] || "default";

  return (
    <Badge variant={variant} dot className={className}>
      {label}
    </Badge>
  );
}

export default StatusBadge;
