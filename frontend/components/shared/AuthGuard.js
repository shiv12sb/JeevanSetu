"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Lock,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { USER_ROLES } from "@/lib/constants";

const GUARD_TEXTS = {
  en: {
    loading: "Loading information...",
    authRequired: "Sign In Required",
    authSub: "Authentication Required to Access this Healthcare Feature",
    desc: "To keep patient records, referral tracking, and medicine supply information safe and coordinated, please sign in or register your account.",
    signInBtn: "Sign In",
    signUpBtn: "Create New Account",
    demoAccessTitle: "Quick 1-Click Demo Testing Access:",
    demoPatient: "👤 Patient (Rameshwar Patil)",
    demoPhc: "🏥 PHC Officer (Dr. Ananya)",
    demoDoctor: "🩺 Specialist Doctor (Dr. Kulkarni)",
  },
  hi: {
    loading: "जानकारी लोड हो रही है...",
    authRequired: "लॉगिन या साइन अप आवश्यक है",
    authSub: "इस स्वास्थ्य सेवा सुविधा तक पहुंचने के लिए लॉगिन आवश्यक है",
    desc: "स्वास्थ्य रिकॉर्ड, रेफरल ट्रैकिंग और दवा आपूर्ति डेटा को सुरक्षित रखने के लिए कृपया लॉगिन या नया खाता बनाएं।",
    signInBtn: "लॉगिन करें",
    signUpBtn: "नया खाता बनाएं",
    demoAccessTitle: "परीक्षण हेतु 1-क्लिक डेमो प्रवेश:",
    demoPatient: "👤 मरीज (रामेश्वर पाटिल)",
    demoPhc: "🏥 पीएचसी अधिकारी (डॉ. अनन्या)",
    demoDoctor: "🩺 विशेषज्ञ डॉक्टर (डॉ. कुलकर्णी)",
  },
  mr: {
    loading: "माहिती लोड होत आहे...",
    authRequired: "लॉगिन किंवा नोंदणी आवश्यक आहे",
    authSub: "या आरोग्य सुविधेचा लाभ घेण्यासाठी सुरक्षित प्रवेश आवश्यक आहे",
    desc: "आरोग्य नोंदी, रेफरल ट्रॅकिंग आणि औषध साठ्याची माहिती सुरक्षित ठेवण्यासाठी कृपया प्रथम लॉगिन किंवा नोंदणी करा.",
    signInBtn: "थेट लॉगिन करा",
    signUpBtn: "नवीन खाते तयार करा",
    demoAccessTitle: "चाचणीसाठी तात्काळ १-क्लिक लॉगिन:",
    demoPatient: "👤 नागरिक / रुग्ण (रमेश पाटील)",
    demoPhc: "🏥 PHC अधिकारी (डॉ. अनन्य)",
    demoDoctor: "🩺 तज्ज्ञ डॉक्टर (डॉ. कुलकर्णी)",
  },
};

export function AuthGuard({ children, featureName = "" }) {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);

  const txt = GUARD_TEXTS[language] || GUARD_TEXTS.en;

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 animate-pulse">
          {txt.loading}
        </p>
      </div>
    );
  }

  // If user is authenticated, render the feature normally
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  const handleQuickDemoLogin = async (role = USER_ROLES.PATIENT) => {
    setIsDemoLoggingIn(true);
    try {
      await login(role);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDemoLoggingIn(false);
    }
  };

  const redirectQuery = encodeURIComponent(pathname || "/");

  // Unauthenticated Guard Screen
  return (
    <div className="max-w-2xl mx-auto my-8 px-4 text-center">
      <Card className="shadow-2xl border-2 border-teal-500/30 dark:border-teal-500/20 bg-linear-to-b from-white via-teal-50/30 to-white dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-900 overflow-hidden rounded-3xl">
        <div className="bg-linear-to-r from-teal-600 to-emerald-600 p-6 text-white text-center space-y-2">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-white/30">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {txt.authRequired}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 font-medium">
            {featureName ? `${txt.authSub} (${featureName})` : txt.authSub}
          </p>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6 text-slate-700 dark:text-slate-300">
          <p className="text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            {txt.desc}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/login?redirect=${redirectQuery}`}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold gap-2 shadow-lg cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{txt.signInBtn}</span>
              </Button>
            </Link>

            <Link
              href={`/register?redirect=${redirectQuery}`}
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full font-bold gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-teal-600" />
                <span>{txt.signUpBtn}</span>
              </Button>
            </Link>
          </div>

          {/* 1-Click Quick Demo Sign In for Testing */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {txt.demoAccessTitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={isDemoLoggingIn}
                onClick={() => handleQuickDemoLogin(USER_ROLES.PATIENT)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/40 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
              >
                {txt.demoPatient}
              </button>
              <button
                type="button"
                disabled={isDemoLoggingIn}
                onClick={() => handleQuickDemoLogin(USER_ROLES.PHC_STAFF)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/40 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
              >
                {txt.demoPhc}
              </button>
              <button
                type="button"
                disabled={isDemoLoggingIn}
                onClick={() => handleQuickDemoLogin(USER_ROLES.DOCTOR)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/40 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
              >
                {txt.demoDoctor}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthGuard;
