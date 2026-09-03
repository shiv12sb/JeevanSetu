"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LocationSelector } from "@/components/shared/LocationSelector";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useNavigation } from "@/context/NavigationContext";
import {
  Heart,
  Menu,
  X,
  PhoneCall,
  LayoutDashboard,
  LogIn,
  LogOut,
  ChevronDown,
  Activity,
  HeartHandshake,
  MessageSquare,
  Sparkles,
  Compass,
  Building2,
  GitPullRequest,
  Package,
  User,
  Settings,
  Shield,
  Home,
  Stethoscope,
  Truck,
  Bot,
} from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";

export function Navbar() {
  const { isDrawerOpen, toggleDrawer, closeDrawer } = useNavigation();
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const { locationToast, selectedDistrict } = useLocation();

  const primaryNavLinks = [
    { href: "/", label: t("home", "Home") },
    { href: "/doctors", label: t("findDoctor", "Find Doctor") },
    { href: "/ambulance", label: t("ambulance", "Ambulance") },
    { href: "/resources", label: t("verifiedDirectory", "Directory") },
    { href: "/referrals", label: t("referralTracking", "Referrals") },
    { href: "/assistant", label: t("aiAssistant", "Assistant") },
  ];

  const secondaryNavLinks = [
    {
      href: "/organ-donation",
      label: t("organDonation", "Organ Donation Info"),
      description: "Facts, process & official registration guide",
      icon: Heart,
    },
    {
      href: "/health-awareness",
      label: t("healthAwareness", "Health Awareness Hub"),
      description: "Preventive care, maternal & seasonal guidance",
      icon: Activity,
    },
    {
      href: "/call-assistance",
      label: t("voiceAssistance", "Voice & IVR Assistance"),
      description: "Inclusive support for non-smartphone users",
      icon: PhoneCall,
    },
    {
      href: "/feedback",
      label: t("feedback", "Service Feedback"),
      description: "Share your PHC & referral care experience",
      icon: MessageSquare,
    },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCommunityDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    closeDrawer();
    router.push("/");
  };

  const isSecondaryActive = secondaryNavLinks.some((link) => pathname === link.href);

  // Role display label
  const roleLabel = user ? t(`role_${user.role}`, ROLE_LABELS[user.role] || user.role) : "";

  return (
    <header className="sticky top-0 z-40 flex flex-col bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 shadow-md shadow-slate-200/30 dark:shadow-black/40 transition-colors">
      {/* Top Emergency, Theme & Language Bar */}
      <div className="shrink-0 w-full bg-slate-900/95 dark:bg-[#050811] text-teal-100 text-xs py-1.5 px-2.5 sm:px-4 border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 text-left min-w-0">
            <Link
              href="/ambulance"
              id="emergency-ambulance-trigger"
              className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 transition-all text-white font-extrabold text-[11px] sm:text-xs shadow-md shadow-rose-600/30 border border-rose-400/40 cursor-pointer shrink-0"
              title="Click to Open Ambulance Near Me & Live Emergency Dispatch"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
              <PhoneCall className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white animate-bounce shrink-0" />
              <span className="uppercase tracking-wider font-black">108</span>
              <span className="font-semibold text-[11px] sm:text-xs underline decoration-dotted underline-offset-2 hidden xs:inline sm:inline">{t("ambulanceNearMeBtn", "Ambulance")}</span>
            </Link>
            <a
              href="tel:108"
              className="hidden md:inline-flex items-center gap-1 font-mono text-xs text-teal-200 hover:text-white underline decoration-dotted"
              title="Direct Telephone Call to National 108 Emergency Helpline"
            >
              (108 / 104)
            </a>
          </div>

          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Live Location / District Switcher: desktop only; mobile users select in drawer */}
            <div className="hidden sm:block">
              <LocationSelector isDark />
            </div>

            {/* Theme Toggle in Header Bar */}
            <ThemeToggle isDarkVariant />

            {/* Language Selector in Header Bar */}
            <LanguageSelector isDark />
          </div>
        </div>
      </div>

      {/* Floating Location Toast Alert */}
      {locationToast && (
        <div className="bg-teal-600 text-white text-xs font-bold py-1 px-4 text-center animate-in slide-in-from-top-2 duration-200 border-b border-teal-700 shadow-sm flex items-center justify-center gap-2">
          <span>{locationToast}</span>
        </div>
      )}

      {/* Main Navbar */}
      <div className="shrink-0 w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-16 gap-2 lg:gap-3 xl:gap-4 min-w-0">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/logo.png"
              alt="JeevanSetu Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-700"
            />
            <div className="flex flex-col text-left">
              <span className="text-lg font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                Jeevan<span className="text-teal-600 dark:text-teal-400">Setu</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-none">
                Healthcare Bridge
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 xl:gap-1.5 min-w-0 shrink">
            {primaryNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "text-teal-700 dark:text-teal-300 bg-teal-500/15 dark:bg-teal-500/20 border border-teal-500/30 dark:border-teal-500/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Community & Secondary Services Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setCommunityDropdownOpen(!communityDropdownOpen)}
                className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 whitespace-nowrap ${
                  isSecondaryActive
                    ? "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 font-bold border border-teal-200 dark:border-teal-800"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                }`}
              >
                <span>{t("communityAwareness", "Community")}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${communityDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {communityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-slate-900/10 dark:shadow-black/80 border border-slate-200/90 dark:border-white/15 py-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
                  <div className="px-4 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("communityAwareness", "Secondary Services & Guidance")}
                  </div>
                  {secondaryNavLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setCommunityDropdownOpen(false)}
                        className={`flex items-start gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                          isActive ? "bg-teal-500/10 text-teal-700 dark:text-teal-300" : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/20">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="text-xs font-bold block leading-tight text-slate-900 dark:text-white">
                            {item.label}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-snug">
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* User Profile Dropdown OR Sign In Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 xl:gap-2.5 shrink-0">
            {isAuthenticated && user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[120px] truncate">
                      {user.name || "User"}
                    </span>
                    <span className="text-[10px] font-medium text-teal-700 dark:text-teal-400 leading-none">
                      {roleLabel}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.phone || user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                        {roleLabel}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span>{t("myProfile", "My Healthcare Profile")}</span>
                      </Link>

                      <Link
                        href={user.role === "patient" ? "/dashboard/patient" : user.role === "phc_staff" ? "/dashboard/phc" : user.role === "doctor" ? "/dashboard/doctor" : "/dashboard/hospital"}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        <span>{t("healthcarePortal", "Patient Dashboard")}</span>
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span>{t("settings", "Settings")}</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("signOut", "Sign Out")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="shrink-0">
                  <Button variant="ghost" size="sm" className="text-xs text-slate-700 dark:text-slate-300 gap-1.5 font-medium px-2 xl:px-3 whitespace-nowrap">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t("signIn", "Sign In")}</span>
                  </Button>
                </Link>
                <Link href="/dashboard/patient" className="shrink-0">
                  <Button size="sm" className="text-xs bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white gap-1.5 font-bold shadow-xs px-2.5 xl:px-3.5 whitespace-nowrap">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{t("healthcarePortal", "Patient Dashboard")}</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile & Tablet menu toggle button */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleDrawer}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDrawerOpen
                  ? "bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/40 shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent"
              }`}
              aria-label="Toggle All Services & Features"
            >
              {isDrawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
