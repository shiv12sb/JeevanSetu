"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useNavigation } from "@/context/NavigationContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { LocationSelector } from "@/components/shared/LocationSelector";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS } from "@/lib/constants";
import {
  X,
  User,
  LayoutDashboard,
  Compass,
  Stethoscope,
  Siren,
  GitPullRequest,
  FileText,
  Bot,
  Building2,
  PhoneCall,
  Activity,
  Heart,
  Package,
  ShieldCheck,
  MessageSquare,
  Settings,
  LogIn,
  LogOut,
  ChevronRight,
  Sparkles,
  MapPin,
  Radio,
} from "lucide-react";

export function AllFeaturesDrawer() {
  const { isDrawerOpen, closeDrawer } = useNavigation();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  if (!isDrawerOpen) return null;

  const roleLabel = user ? t(`role_${user.role}`, ROLE_LABELS[user.role] || user.role) : "";

  const handleSignOut = async () => {
    await logout();
    closeDrawer();
    router.push("/");
  };

  const sections = [
    {
      title: t("patientCitizenServices", "Citizen & Patient Services (नागरिक व रुग्ण सेवा)"),
      items: [
        {
          href: "/dashboard/patient",
          label: t("patientPortal", "Patient Portal / डॅशबोर्ड"),
          desc: "Medical records, referrals & appointments",
          icon: LayoutDashboard,
          badge: "Main",
          badgeColor: "bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30",
        },
        {
          href: "/navigate",
          label: t("whatShouldIDo", "What Should I Do Now? (मार्गदर्शक)"),
          desc: "Step-by-step guidance for your situation",
          icon: Compass,
          badge: "Help",
          badgeColor: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
        },
        {
          href: "/doctors",
          label: t("findDoctor", "Find Doctor (डॉक्टर शोधा)"),
          desc: "Verified MMC/MCIM medical specialists",
          icon: Stethoscope,
        },
        {
          href: "/ambulance",
          label: t("ambulanceNearMe", "108 Emergency Ambulance (रुग्णवाहिका)"),
          desc: "Real-time dispatch, telematics & casualty call",
          icon: Siren,
          badge: "24x7",
          badgeColor: "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30",
        },
        {
          href: "/referrals",
          label: t("referralTracking", "Referral Tracking (रेफरल ट्रॅकिंग)"),
          desc: "PHC to Sub-District & GMC tertiary care",
          icon: GitPullRequest,
        },
        {
          href: "/cases",
          label: t("myCases", "Health Cases & Records (आरोग्य नोंदी)"),
          desc: "Digital prescriptions, diagnosis & tests",
          icon: FileText,
        },
        {
          href: "/assistant",
          label: t("aiAssistant", "AI Healthcare Assistant (एआय सहाय्यक)"),
          desc: "Multi-language voice & text triage",
          icon: Bot,
          badge: "AI",
          badgeColor: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30",
        },
      ],
    },
    {
      title: t("publicHealthRural", "Public Health & Rural Outreach (सार्वजनिक आरोग्य व ग्रामीण सेवा)"),
      items: [
        {
          href: "/resources",
          label: t("verifiedDirectory", "Verified Hospital Directory (रुग्णालये)"),
          desc: "Government GMCs, DH, SDH & PHCs",
          icon: Building2,
        },
        {
          href: "/rural-access",
          label: t("ruralAccess", "Rural Health Access (ग्रामीण पोहोच)"),
          desc: "Non-internet 2G keypad phone voice support",
          icon: Radio,
          badge: "2G",
          badgeColor: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
        },
        {
          href: "/community-health",
          label: t("communityHealth", "Community Campaigns (समुदाय मोहीम)"),
          desc: "Vaccination camps, health drives & ASHA",
          icon: Activity,
        },
        {
          href: "/health-awareness",
          label: t("healthAwareness", "Health Awareness Hub (आरोग्य जागृती)"),
          desc: "Audio guidance, printable posters & prevention",
          icon: Sparkles,
        },
        {
          href: "/organ-donation",
          label: t("organDonation", "Organ Donation (अवयवदान माहिती)"),
          desc: "NOTTO / ROTTO registry & myth-busting facts",
          icon: Heart,
        },
        {
          href: "/call-assistance",
          label: t("voiceAssistance", "Voice & 2G IVR Support (दूरध्वनी)"),
          desc: "Toll-free 1800-108-102 audio navigator",
          icon: PhoneCall,
        },
        {
          href: "/feedback",
          label: t("feedback", "Citizen Feedback (नागरिक अभिप्राय)"),
          desc: "Rate PHC service quality & referral care",
          icon: MessageSquare,
        },
      ],
    },
    {
      title: t("administrationDesks", "Clinical & Administrative Operations (प्रशासन व नियंत्रण)"),
      items: [
        {
          href: "/inventory",
          label: t("phcInventory", "Medicine Stock & Inventory (औषध साठा)"),
          desc: "DVDMS e-Aushadhi & Anti-Snake Venom stock",
          icon: Package,
        },
        {
          href: "/dashboard/phc",
          label: t("phcDesk", "PHC Primary Health Centre Desk"),
          desc: "Rural health centre operations & duty roster",
          icon: ShieldCheck,
        },
        {
          href: "/dashboard/doctor",
          label: t("doctorDesk", "Doctor Clinical Desk"),
          desc: "Specialist OPD schedules & referral review",
          icon: Stethoscope,
        },
        {
          href: "/dashboard/hospital",
          label: t("hospitalDesk", "Hospital Admissions & PM-JAY"),
          desc: "Ayushman Bharat / MJPJAY cashless beds",
          icon: Building2,
        },
        {
          href: "/dashboard/admin",
          label: t("adminControlCenter", "District Admin Control Center"),
          desc: "Civil Surgeon & DHS statewide analytics",
          icon: ShieldCheck,
        },
      ],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="features-drawer-title"
      className="fixed inset-0 z-50 flex justify-end md:hidden animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <aside className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-[#090d1a] h-full shadow-2xl border-l border-slate-200 dark:border-white/10 flex flex-col z-10 overflow-hidden text-left animate-in slide-in-from-right duration-300">
        {/* 1. Header Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
          <Link href="/" onClick={closeDrawer} className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="JeevanSetu Logo"
              className="w-8 h-8 rounded-xl object-contain bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs"
            />
            <div>
              <h2 id="features-drawer-title" className="text-base font-black text-slate-900 dark:text-white leading-tight">
                Jeevan<span className="text-teal-600 dark:text-teal-400">Setu</span>
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase">
                {t("allFeaturesMenu", "All Services & Features")}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeDrawer}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close features menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. User Status Card */}
        <div className="p-3 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 dark:from-teal-950/40 dark:to-emerald-950/40 border-b border-slate-200 dark:border-white/10 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.name || "Healthcare Citizen"}
                  </h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300">
                      {roleLabel}
                    </span>
                    {user.district && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        • {user.district}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link href="/profile" onClick={closeDrawer} className="shrink-0">
                <Button size="xs" variant="outline" className="text-[11px] font-bold h-7 px-2.5">
                  <User className="w-3 h-3 mr-1 text-teal-600 dark:text-teal-400" />
                  {t("profile", "Profile")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t("guestCitizen", "Public Guest Access")}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t("loginForRecords", "Sign in for ABHA & prescriptions")}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link href="/login" onClick={closeDrawer}>
                  <Button size="xs" variant="outline" className="text-xs font-bold h-7">
                    <LogIn className="w-3 h-3 mr-1" />
                    {t("signIn", "Sign In")}
                  </Button>
                </Link>
                <Link href="/dashboard/patient" onClick={closeDrawer}>
                  <Button size="xs" className="text-xs font-bold h-7 bg-teal-600 text-white">
                    {t("patientPortal", "Portal")}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 3. Quick System Controls Strip */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10 space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Location:</span>
            </span>
            <div className="flex-1 max-w-[200px]">
              <LocationSelector />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Display / भाषा:
            </span>
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <LanguageSelector variant="pills" />
            </div>
          </div>
        </div>

        {/* 4. Scrollable Features Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-5">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1.5">
              <h3 className="px-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {sec.title}
              </h3>

              <div className="grid grid-cols-1 gap-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeDrawer}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                        isActive
                          ? "bg-teal-500/15 dark:bg-teal-500/20 text-teal-800 dark:text-teal-200 border border-teal-500/30 font-bold shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isActive
                              ? "bg-teal-600 text-white border-teal-500"
                              : "bg-slate-100 dark:bg-slate-800/80 text-teal-600 dark:text-teal-400 border-slate-200 dark:border-white/10"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold block leading-tight truncate text-slate-900 dark:text-white">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${item.badgeColor}`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight truncate mt-0.5">
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 5. Bottom Drawer Action Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80 shrink-0 flex items-center justify-between gap-2">
          <Link href="/settings" onClick={closeDrawer} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs font-bold gap-1 h-8">
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>{t("settings", "Settings")}</span>
            </Button>
          </Link>

          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex-1 text-xs font-bold text-rose-600 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1 h-8"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t("signOut", "Sign Out")}</span>
            </Button>
          ) : (
            <Link href="/login" onClick={closeDrawer} className="flex-1">
              <Button size="sm" className="w-full text-xs font-bold bg-teal-600 text-white gap-1 h-8">
                <LogIn className="w-3.5 h-3.5" />
                <span>{t("signIn", "Sign In")}</span>
              </Button>
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}

export default AllFeaturesDrawer;
