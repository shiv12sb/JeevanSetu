"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import {
  Settings,
  Moon,
  Sun,
  Globe,
  Bell,
  Eye,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  MapPin,
  Navigation,
  Building2,
  ExternalLink,
  Search,
  Sparkles,
} from "lucide-react";

export function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const {
    selectedDistrict,
    changeDistrict,
    autoDetectGps,
    isDetectingGps,
    allDistricts,
    currentDistrictObj,
    getFilteredFacilities,
  } = useLocation();

  const activeDistrictFacilities = getFilteredFacilities();

  // Settings State with localStorage persistence
  const [settings, setSettings] = useState({
    smsReferrals: true,
    smsStock: true,
    smsDoctorDuty: false,
    highContrast: false,
    largeText: false,
    lowDataMode: true,
    emergencySosDefault: "108",
  });

  const [savedAlert, setSavedAlert] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("jeevansetu_user_settings");
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("jeevansetu_user_settings", JSON.stringify(updated));
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 2500);
      return updated;
    });
  };

  const handleExportData = () => {
    const exportObject = {
      user: user || {},
      settings,
      language,
      theme,
      exportedAt: new Date().toISOString(),
      platform: "JeevanSetu Rural Healthcare Access Platform",
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `jeevansetu_health_profile_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearCache = () => {
    localStorage.removeItem("jeevansetu_user_settings");
    alert("Local offline cache cleared successfully.");
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-left transition-colors">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800 flex items-center gap-1">
              <Settings className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              {t("settings", "Settings")}
            </span>
            <Badge variant="teal" size="sm">Real-Time Sync</Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("appSettings", "Application Settings & Preferences")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            Configure appearance theme, regional language, low-bandwidth 2G connectivity optimizations, and SMS alert preferences.
          </p>
        </div>

        {savedAlert && (
          <Alert variant="success" className="animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Settings updated and saved.</span>
            </div>
          </Alert>
        )}

        {/* 0. Location & District Management (Real-World Dynamic Location Switching) */}
        <Card className="shadow-xs border-teal-200 dark:border-teal-900 bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="bg-teal-50/70 dark:bg-teal-950/40 border-b border-teal-100 dark:border-teal-900/60 p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    District & Healthcare Location Settings
                  </CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Switch your district to filter real-time hospitals, doctors on duty, and medicine inventory.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-teal-100 dark:bg-teal-900/80 text-teal-900 dark:text-teal-200 font-bold px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                  Active: {selectedDistrict} ({currentDistrictObj?.marathiName || ""})
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-5">
            {/* Quick District Selector Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Quick Select Primary Healthcare Hubs (Maharashtra):
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Nagpur", marathi: "नागपूर", badge: "Vidarbha Hub (GMC & Mayo)" },
                  { name: "Gadchiroli", marathi: "गडचिरोली", badge: "Tribal District" },
                  { name: "Chandrapur", marathi: "चंद्रपूर", badge: "GMC & Ballarpur" },
                  { name: "Amravati", marathi: "अमरावती", badge: "Melghat Tribal Belt" },
                  { name: "Pune", marathi: "पुणे", badge: "Sassoon & BJMC" },
                  { name: "Mumbai City", marathi: "मुंबई", badge: "KEM & Apex Care" },
                  { name: "Nashik", marathi: "नाशिक", badge: "Civil & Tribal SDH" },
                  { name: "Chhatrapati Sambhaji Nagar", marathi: "संभाजीनगर", badge: "GMC Ghati" },
                ].map((dist) => {
                  const isSelected = selectedDistrict.toLowerCase().includes(dist.name.toLowerCase());
                  return (
                    <button
                      key={dist.name}
                      type="button"
                      onClick={() => changeDistrict(dist.name)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left flex flex-col gap-0.5 cursor-pointer ${
                        isSelected
                          ? "bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-600/30"
                          : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{dist.name}</span>
                        <span className={isSelected ? "text-teal-200" : "text-slate-500 dark:text-slate-400"}>
                          ({dist.marathi})
                        </span>
                      </div>
                      <span className={`text-[10px] ${isSelected ? "text-teal-100" : "text-slate-400 dark:text-slate-500"}`}>
                        {dist.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dropdown for All 36 Districts & GPS auto-detect */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Any of 36 Maharashtra Districts:
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => changeDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  {allDistricts.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.marathiName}) — {d.region} (PIN Prefix: {d.pinPrefix})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={autoDetectGps}
                  disabled={isDetectingGps}
                  className="w-full text-xs font-bold flex items-center justify-center gap-2 border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? "animate-spin" : ""}`} />
                  {isDetectingGps ? "Detecting GPS..." : "Auto-Detect via GPS"}
                </Button>
              </div>
            </div>

            {/* Live Facilities Preview for Selected District */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  Verified Health Facilities in {selectedDistrict} ({activeDistrictFacilities.length} Facilities Active):
                </span>
                <Link
                  href="/resources"
                  className="text-[11px] text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>View All in Directory</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {activeDistrictFacilities.slice(0, 6).map((fac) => (
                  <div
                    key={fac.id}
                    className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-1.5 shadow-2xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {fac.name}
                        </span>
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                          {fac.careLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {fac.address}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      <span>Beds: {fac.bedAvailability?.available || 0} Avail</span>
                      <span className="text-teal-600 dark:text-teal-400 font-bold">● {fac.travelStatus?.doctorStatusText ? "Doctors On Duty" : "Active"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1. Theme & Appearance (Light Default & Persistent Dark) */}
        <Card className="shadow-xs border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {t("appearance", "Appearance & Display Theme")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "light", label: t("lightMode", "Light Mode (Default)"), icon: Sun, desc: "Clean daylight contrast for clinical and field use" },
                { id: "dark", label: t("darkMode", "Dark Mode"), icon: Moon, desc: "Gentle for low-light night use and battery saving" },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                      isSelected
                        ? "bg-teal-50 dark:bg-teal-950/60 border-teal-600 ring-2 ring-teal-600/20 shadow-xs"
                        : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-5 h-5 ${isSelected ? "text-teal-600 dark:text-teal-400" : "text-slate-500 dark:text-slate-400"}`} />
                      {isSelected && <span className="text-xs text-teal-700 dark:text-teal-300 font-bold">✓ Active</span>}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 2. Language Selection */}
        <Card className="shadow-xs border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Application Language (भाषा)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { code: "en", name: "English", nativeName: "English", sub: "Standard National Terminology" },
                { code: "hi", name: "Hindi", nativeName: "हिंदी", sub: "ग्रामीण स्वास्थ्य मार्गदर्शन" },
                { code: "mr", name: "Marathi", nativeName: "मराठी", sub: "स्थानिक आरोग्य समन्वय" },
              ].map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-teal-50 dark:bg-teal-950/60 border-teal-600 ring-2 ring-teal-600/20 shadow-xs"
                        : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{lang.nativeName}</span>
                      {isSelected && <Badge variant="teal" size="sm">Active</Badge>}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{lang.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{lang.sub}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 3. SMS & Emergency Alert Preferences */}
        <Card className="shadow-xs border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                SMS & Notification Preferences (Offline Keypad Phone Support)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="space-y-3">
              {[
                {
                  key: "smsReferrals",
                  title: t("smsAlerts", "SMS Referral & Emergency Alerts"),
                  desc: t("smsAlertsDesc", "Receive instant SMS notifications when hospital accepts your referral."),
                },
                {
                  key: "smsStock",
                  title: "PHC Medicine Restock Notifications",
                  desc: "SMS alerts when emergency medicines arrive at your local health centre.",
                },
                {
                  key: "smsDoctorDuty",
                  title: "Doctor Duty & Specialist OPD Schedule",
                  desc: "Weekly SMS updates for visiting pediatric and cardiology specialists.",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-start justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className="space-y-0.5 pr-4">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[item.key]}
                    onChange={() => handleToggle(item.key)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 mt-1 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 4. Accessibility & Rural 2G Network Optimization */}
        <Card className="shadow-xs border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Accessibility & Network Optimization
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-3">
            {[
              {
                key: "lowDataMode",
                title: t("lowDataMode", "2G / Low Bandwidth Optimization"),
                desc: t("lowDataModeDesc", "Reduces data payload and disables heavy network calls for remote villages."),
              },
              {
                key: "largeText",
                title: t("largeText", "Senior Citizen Large Text Mode"),
                desc: t("largeTextDesc", "Increases UI typography contrast and button tap targets."),
              },
              {
                key: "highContrast",
                title: t("highContrast", "High Contrast Mode"),
                desc: t("highContrastDesc", "Optimized visibility under outdoor direct sunlight."),
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-start justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="space-y-0.5 pr-4">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={() => handleToggle(item.key)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 mt-1 cursor-pointer"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 5. Data, Privacy & Account Management */}
        <Card className="shadow-xs border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {t("privacyAndData", "Privacy & Offline Data Management")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t("exportHealthData", "Export Health Summary (JSON)")}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Download a safe JSON copy of your profile, case IDs, and application settings.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="gap-1.5 text-xs whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Data</span>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t("clearCache", "Clear Local Offline Storage")}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Resets local offline cache and reload default application configuration.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                className="gap-1.5 text-xs text-rose-600 border-rose-200 dark:border-rose-900 whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cache</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

export default SettingsPage;
