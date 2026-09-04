"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigation } from "@/context/NavigationContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Home,
  User,
  Stethoscope,
  Siren,
  LayoutGrid,
} from "lucide-react";

export function MobileBottomBar() {
  const pathname = usePathname();
  const { isDrawerOpen, toggleDrawer } = useNavigation();
  const { t } = useLanguage();

  const isHomeActive = pathname === "/";
  const isPortalActive = pathname.startsWith("/dashboard");
  const isDoctorsActive = pathname.startsWith("/doctors");
  const isAmbulanceActive = pathname.startsWith("/ambulance");

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-t border-slate-200/90 dark:border-white/10 md:hidden shadow-2xl shadow-slate-900/15 dark:shadow-black/90 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold min-h-[48px] transition-all active:scale-95 ${
            isHomeActive
              ? "text-teal-600 dark:text-teal-400 font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${isHomeActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-teal-500" />
            )}
          </div>
          <span>{t("home", "Home")}</span>
        </Link>

        {/* 2. Patient Portal */}
        <Link
          href="/dashboard/patient"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold min-h-[48px] transition-all active:scale-95 ${
            isPortalActive
              ? "text-teal-600 dark:text-teal-400 font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className="relative">
            <User className={`w-5 h-5 ${isPortalActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            {isPortalActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-teal-500" />
            )}
          </div>
          <span>{t("portal", "Portal")}</span>
        </Link>

        {/* 3. Doctors */}
        <Link
          href="/doctors"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold min-h-[48px] transition-all active:scale-95 ${
            isDoctorsActive
              ? "text-teal-600 dark:text-teal-400 font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className="relative">
            <Stethoscope className={`w-5 h-5 ${isDoctorsActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
            {isDoctorsActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-teal-500" />
            )}
          </div>
          <span>{t("findDoctor", "Doctors")}</span>
        </Link>

        {/* 4. Ambulance 108 */}
        <Link
          href="/ambulance"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold min-h-[48px] transition-all active:scale-95 ${
            isAmbulanceActive
              ? "text-rose-600 dark:text-rose-400 font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className="relative">
            <Siren className={`w-5 h-5 ${isAmbulanceActive ? "stroke-[2.5] text-rose-500" : "stroke-[1.75]"}`} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            {isAmbulanceActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-500" />
            )}
          </div>
          <span>108 Live</span>
        </Link>

        {/* 5. Permanent All Features Toggle (Menu) */}
        <button
          type="button"
          onClick={toggleDrawer}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold min-h-[48px] transition-all active:scale-95 cursor-pointer ${
            isDrawerOpen
              ? "text-teal-600 dark:text-teal-400 font-black"
              : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
          }`}
          aria-label="Toggle All Healthcare Features Menu"
        >
          <div className="relative">
            <div
              className={`p-1 rounded-lg transition-colors ${
                isDrawerOpen
                  ? "bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/40"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <LayoutGrid className="w-4 h-4 stroke-[2]" />
            </div>
            {isDrawerOpen && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-teal-500" />
            )}
          </div>
          <span>{t("features", "Features")}</span>
        </button>
      </div>
    </nav>
  );
}

export default MobileBottomBar;
