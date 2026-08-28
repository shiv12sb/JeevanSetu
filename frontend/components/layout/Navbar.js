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
} from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    { href: "/navigate", label: t("navGuide", "Guide") },
    { href: "/resources", label: t("verifiedDirectory", "Directory") },
    { href: "/referrals", label: t("referralTracking", "Referrals") },
    { href: "/inventory", label: t("phcInventory", "Inventory") },
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
    setMobileMenuOpen(false);
    router.push("/");
  };

  const isSecondaryActive = secondaryNavLinks.some((link) => pathname === link.href);

  // Role display label
  const roleLabel = user ? t(`role_${user.role}`, ROLE_LABELS[user.role] || user.role) : "";

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
      {/* Top Emergency, Theme & Language Bar */}
      <div className="bg-teal-950 text-teal-100 text-xs py-1.5 px-4 border-b border-teal-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-left">
            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-xs shrink-0">
              Emergency
            </span>
            <span className="hidden sm:inline font-medium text-teal-200">
              {t("emergencyHelplineText", "National Ambulance / Health Emergency:")}
            </span>
            <strong className="text-white flex items-center gap-1 font-black shrink-0">
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" /> 108 / 104
            </strong>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Location / District Switcher */}
            <LocationSelector isDark />

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/logo.png"
              alt="JeevanSetu Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform bg-white p-0.5 border border-slate-200 dark:border-slate-700"
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
          <nav className="hidden lg:flex items-center gap-1">
            {primaryNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 font-bold"
                      : link.isHighlighted
                      ? "text-teal-900 dark:text-teal-200 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 font-bold hover:bg-teal-100"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
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
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                  isSecondaryActive
                    ? "text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span>{t("communityAwareness", "Community")}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${communityDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {communityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                        className={`flex items-start gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                          isActive ? "bg-teal-50/70 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300" : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5 border border-teal-100 dark:border-teal-800">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="text-xs font-semibold block leading-tight text-slate-900 dark:text-white">
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
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
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
                        <span>{t("healthcarePortal", "Healthcare Portal")}</span>
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
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs text-slate-700 dark:text-slate-300 gap-1.5 font-medium">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t("signIn", "Sign In")}</span>
                  </Button>
                </Link>
                <Link href="/dashboard/patient">
                  <Button size="sm" className="text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1.5 font-bold shadow-xs">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{t("healthcarePortal", "Healthcare Portal")}</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top duration-150 text-left">
          {/* User Status in Mobile */}
          {isAuthenticated && user && (
            <div className="p-3 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</h4>
                  <p className="text-[11px] text-teal-700 dark:text-teal-300">{roleLabel}</p>
                </div>
              </div>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                <Button size="xs" variant="outline" className="text-xs">
                  {t("profile", "Profile")}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Location, Language & Theme Controls */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">📍 Active Location:</span>
              <LocationSelector />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Display / भाषा:</span>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LanguageSelector variant="pills" />
              </div>
            </div>
          </div>

          <div className="space-y-1 text-left">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Core Healthcare Services
            </span>
            {primaryNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium text-left ${
                  pathname === link.href
                    ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-left">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Community & Public Guidance
            </span>
            {secondaryNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left ${
                  pathname === item.href
                    ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <item.icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link href={user.role === "patient" ? "/dashboard/patient" : "/dashboard/doctor"} onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full text-xs bg-teal-600 text-white font-bold">
                    {t("healthcarePortal", "Go to Healthcare Dashboard")}
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      {t("settings", "Settings")}
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full text-xs text-rose-600 border-rose-200 dark:border-rose-900"
                  >
                    {t("signOut", "Sign Out")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    {t("signIn", "Sign In")}
                  </Button>
                </Link>
                <Link href="/dashboard/patient" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full text-xs bg-teal-600 text-white font-bold">
                    {t("healthcarePortal", "Healthcare Portal")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
