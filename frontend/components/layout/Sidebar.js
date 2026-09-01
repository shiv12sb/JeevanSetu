"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  Building2,
  GitPullRequest,
  Package,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Activity,
  FileText,
  MessageSquare,
  Compass,
  LogOut,
  ChevronRight,
  RefreshCw,
  Siren,
} from "lucide-react";
import { USER_ROLES, ROLE_LABELS } from "@/lib/constants";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export function Sidebar({ currentRole = "patient", onRoleChange, isMobile = false, onCloseMobile }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Role-specific navigation links with dynamic translation
  const roleNavs = {
    [USER_ROLES.PATIENT]: [
      { href: "/dashboard/patient", label: t("healthcarePortal", "Patient Dashboard"), icon: LayoutDashboard },
      { href: "/ambulance", label: t("ambulanceNearMe", "Ambulance Near Me"), icon: Siren },
      { href: "/doctors", label: t("findDoctor", "Find Doctor"), icon: Stethoscope },
      { href: "/rural-access", label: t("ruralAccess", "Rural Access"), icon: Compass },
      { href: "/community-health", label: t("communityHealth", "Community Health"), icon: Activity },
      { href: "/navigate", label: t("whatShouldIDo", "What Should I Do Now?"), icon: Compass },
      { href: "/cases", label: t("myCases", "My Health Cases"), icon: FileText },
      { href: "/resources", label: t("verifiedDirectory", "Verified Directory"), icon: Building2 },
      { href: "/referrals", label: t("referralTracking", "Referral Tracking"), icon: GitPullRequest },
      { href: "/assistant", label: t("aiAssistant", "AI Healthcare Assistant"), icon: Sparkles },
      { href: "/organ-donation", label: t("organDonation", "Organ Donation Info"), icon: Heart },
      { href: "/health-awareness", label: t("healthAwareness", "Health Awareness"), icon: Activity },
      { href: "/feedback", label: t("feedback", "Service Feedback"), icon: MessageSquare },
    ],
    [USER_ROLES.PHC_STAFF]: [
      { href: "/dashboard/phc", label: t("phcOverview", "PHC Overview"), icon: LayoutDashboard },
      { href: "/ambulance", label: t("emergencyAmbulanceDispatch", "Ambulance Dispatch"), icon: Siren },
      { href: "/rural-access", label: t("ruralAccess", "Rural Access"), icon: Compass },
      { href: "/community-health", label: t("communityHealth", "Community Health"), icon: Activity },
      { href: "/inventory", label: t("phcInventory", "Medicine Stock & Alerts"), icon: Package },
      { href: "/referrals", label: t("outgoingReferrals", "Outgoing Referrals"), icon: GitPullRequest },
      { href: "/cases", label: t("registeredCases", "Registered Patient Cases"), icon: FileText },
      { href: "/resources", label: t("hospitalDirectory", "Hospital Directory"), icon: Building2 },
    ],
    [USER_ROLES.DOCTOR]: [
      { href: "/dashboard/doctor", label: t("doctorPortal", "Doctor Portal"), icon: Stethoscope },
      { href: "/doctors", label: t("findDoctor", "Find Doctor"), icon: Stethoscope },
      { href: "/referrals", label: t("incomingReferrals", "Incoming Referrals Queue"), icon: GitPullRequest },
      { href: "/cases", label: t("patientHistory", "Patient Clinical History"), icon: FileText },
      { href: "/assistant", label: t("clinicalResourceMatch", "Clinical Resource Match"), icon: Sparkles },
    ],
    [USER_ROLES.HOSPITAL]: [
      { href: "/dashboard/hospital", label: t("hospitalDesk", "Hospital Desk"), icon: Building2 },
      { href: "/doctors", label: t("findDoctor", "Find Doctor"), icon: Stethoscope },
      { href: "/referrals", label: t("referralAdmissions", "Referral Admissions"), icon: GitPullRequest },
      { href: "/resources", label: t("schemeEmpanelment", "Scheme Empanelment"), icon: ShieldCheck },
    ],
    [USER_ROLES.NGO]: [
      { href: "/dashboard/hospital", label: t("ngoAidDesk", "NGO Aid Desk"), icon: Activity },
      { href: "/referrals", label: t("assistanceRequests", "Assistance Requests"), icon: GitPullRequest },
      { href: "/resources", label: t("aidDirectory", "Aid Directory"), icon: Building2 },
    ],
    [USER_ROLES.ADMIN]: [
      { href: "/dashboard/admin", label: t("adminControlCenter", "Admin Control Center"), icon: ShieldCheck },
      { href: "/doctors", label: t("findDoctor", "Find Doctor"), icon: Stethoscope },
      { href: "/community-health", label: t("communityHealth", "Community Health"), icon: Activity },
      { href: "/inventory", label: t("districtStockMonitor", "District Stock Monitor"), icon: Package },
      { href: "/referrals", label: t("districtReferralsFlow", "District Referrals Flow"), icon: GitPullRequest },
      { href: "/resources", label: t("facilityVerification", "Facility Verification"), icon: Building2 },
    ],
  };

  const currentNav = roleNavs[currentRole] || roleNavs[USER_ROLES.PATIENT];

  return (
    <aside
      className={cn(
        "flex flex-col bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/10 h-full select-none transition-colors",
        isMobile ? "w-72" : "w-64 shrink-0"
      )}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2 group"
        >
          <img
            src="/logo.png"
            alt="JeevanSetu Logo"
            className="w-8 h-8 rounded-xl object-contain bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-white/10 shadow-xs"
          />
          <div className="text-left">
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              Jeevan<span className="text-teal-600 dark:text-teal-400">Setu</span>
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Healthcare Bridge</p>
          </div>
        </Link>
      </div>

      {/* Role Switcher */}
      <div className="p-3 bg-slate-50/70 dark:bg-white/5 border-b border-slate-200/60 dark:border-white/5">
        <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Active Account Role</span>
          <RefreshCw className="w-3 h-3 text-teal-600 dark:text-teal-400 animate-spin-slow" />
        </label>
        <select
          value={currentRole}
          onChange={(e) => onRoleChange && onRoleChange(e.target.value)}
          className="w-full text-xs font-bold text-slate-800 dark:text-teal-200 bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
        >
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <option key={key} value={key} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        <span className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 text-left">
          Navigation
        </span>
        {currentNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group",
                isActive
                  ? "bg-teal-500/15 dark:bg-gradient-to-r dark:from-teal-500/25 dark:to-emerald-500/25 text-teal-800 dark:text-teal-300 border border-teal-500/30 dark:border-teal-500/40 shadow-xs shadow-teal-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-transparent"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-teal-600 dark:text-teal-300" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                  )}
                />
                <span>{item.label}</span>
              </div>
              <ChevronRight
                className={cn(
                  "w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity",
                  isActive && "opacity-100 text-teal-600 dark:text-teal-300"
                )}
              />
            </Link>
          );
        })}
      </div>

      {/* Footer Profile / Logout */}
      <div className="p-3 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-black/40 space-y-2">
        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-500/30">
            {currentRole === "patient" ? "RP" : currentRole === "phc_staff" ? "AD" : "JS"}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {currentRole === "patient" ? "Ramesh Patil" : currentRole === "phc_staff" ? "Anjali Deshmukh" : "Dr. S. Kulkarni"}
            </p>
            <p className="text-[10px] text-teal-700 dark:text-teal-400 font-medium truncate">
              {ROLE_LABELS[currentRole] || currentRole}
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs text-slate-500 hover:text-rose-400 transition-colors font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit to Public Portal</span>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
