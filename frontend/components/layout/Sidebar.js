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
      { href: "/navigate", label: t("whatShouldIDo", "What Should I Do Now?"), icon: Compass },
      { href: "/cases", label: "My Health Cases", icon: FileText },
      { href: "/resources", label: t("verifiedDirectory", "Verified Directory"), icon: Building2 },
      { href: "/referrals", label: t("referralTracking", "Referral Tracking"), icon: GitPullRequest },
      { href: "/assistant", label: t("aiAssistant", "AI Healthcare Assistant"), icon: Sparkles },
      { href: "/organ-donation", label: t("organDonation", "Organ Donation Info"), icon: Heart },
      { href: "/health-awareness", label: t("healthAwareness", "Health Awareness"), icon: Activity },
      { href: "/feedback", label: t("feedback", "Service Feedback"), icon: MessageSquare },
    ],
    [USER_ROLES.PHC_STAFF]: [
      { href: "/dashboard/phc", label: "PHC Overview", icon: LayoutDashboard },
      { href: "/inventory", label: t("phcInventory", "Medicine Stock & Alerts"), icon: Package },
      { href: "/referrals", label: "Outgoing Referrals", icon: GitPullRequest },
      { href: "/cases", label: "Registered Patient Cases", icon: FileText },
      { href: "/resources", label: "Hospital Directory", icon: Building2 },
    ],
    [USER_ROLES.DOCTOR]: [
      { href: "/dashboard/doctor", label: "Doctor Portal", icon: Stethoscope },
      { href: "/referrals", label: "Incoming Referrals Queue", icon: GitPullRequest },
      { href: "/cases", label: "Patient Clinical History", icon: FileText },
      { href: "/assistant", label: "Clinical Resource Match", icon: Sparkles },
    ],
    [USER_ROLES.HOSPITAL]: [
      { href: "/dashboard/hospital", label: "Hospital Desk", icon: Building2 },
      { href: "/referrals", label: "Referral Admissions", icon: GitPullRequest },
      { href: "/resources", label: "Scheme Empanelment", icon: ShieldCheck },
    ],
    [USER_ROLES.NGO]: [
      { href: "/dashboard/hospital", label: "NGO Aid Desk", icon: Activity },
      { href: "/referrals", label: "Assistance Requests", icon: GitPullRequest },
      { href: "/resources", label: "Aid Directory", icon: Building2 },
    ],
    [USER_ROLES.ADMIN]: [
      { href: "/dashboard/admin", label: "Admin Control Center", icon: ShieldCheck },
      { href: "/inventory", label: "District Stock Monitor", icon: Package },
      { href: "/referrals", label: "District Referrals Flow", icon: GitPullRequest },
      { href: "/resources", label: "Facility Verification", icon: Building2 },
    ],
  };

  const currentNav = roleNavs[currentRole] || roleNavs[USER_ROLES.PATIENT];

  return (
    <aside
      className={cn(
        "flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full select-none transition-colors",
        isMobile ? "w-72" : "w-64 shrink-0"
      )}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2 group"
        >
          <img
            src="/logo.png"
            alt="JeevanSetu Logo"
            className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-slate-200 dark:border-slate-700"
          />
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              Jeevan<span className="text-teal-600 dark:text-teal-400">Setu</span>
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Healthcare Bridge</p>
          </div>
        </Link>
      </div>

      {/* Role Switcher */}
      <div className="p-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Active Account Role</span>
          <RefreshCw className="w-3 h-3 text-teal-600 dark:text-teal-400 animate-spin-slow" />
        </label>
        <select
          value={currentRole}
          onChange={(e) => onRoleChange && onRoleChange(e.target.value)}
          className="w-full text-xs font-semibold text-teal-950 dark:text-teal-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
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
        <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
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
                "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group",
                isActive
                  ? "bg-teal-600 text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  )}
                />
                <span>{item.label}</span>
              </div>
              <ChevronRight
                className={cn(
                  "w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity",
                  isActive && "opacity-100 text-teal-100"
                )}
              />
            </Link>
          );
        })}
      </div>

      {/* Footer Profile / Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200 dark:border-teal-800">
            {currentRole === "patient" ? "RP" : currentRole === "phc_staff" ? "AD" : "JS"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {currentRole === "patient"
                ? "Rameshwar Patil"
                : currentRole === "phc_staff"
                ? "Dr. Ananya Deshmukh"
                : ROLE_LABELS[currentRole]}
            </p>
            <p className="text-[10px] text-teal-700 dark:text-teal-400 font-medium truncate">
              {ROLE_LABELS[currentRole]}
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit to Public Portal</span>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
