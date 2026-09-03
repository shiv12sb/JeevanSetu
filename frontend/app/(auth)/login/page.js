"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Phone,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { USER_ROLES } from "@/lib/constants";

const LOGIN_TEXTS = {
  en: {
    heading: "Sign In to Healthcare Portal",
    subheading: "Secure, fast, role-based healthcare access.",
    secureTitle: "JeevanSetu Secure Access",
    badge: "Direct Sign In",
    selectRole: "Select Role",
    identifierLabel: "Mobile Number / Email *",
    identifierPlaceholder: "e.g. 9823411204 or email@domain.com",
    passwordLabel: "Password *",
    passwordPlaceholder: "Enter password",
    demoNote: "(Demo: 123456)",
    submitBtn: "Sign In & Continue",
    noAccount: "Don't have an account?",
    registerLink: "Create New Account",
    errIdentifier: "Please enter your mobile number or email.",
    errPassword: "Please enter your password.",
    errFailed: "Sign in failed. Please check credentials.",
    successMsg: "Login Successful! Redirecting...",
    roles: {
      patient: "Patient",
      phc_staff: "PHC Staff",
      doctor: "Doctor",
      hospital: "Hospital Desk",
      ngo: "NGO Desk",
      admin: "Admin",
    },
  },
  hi: {
    heading: "स्वास्थ्य पोर्टल पर लॉगिन करें",
    subheading: "सुरक्षित, तीव्र और भूमिका-आधारित स्वास्थ्य सेवा प्रवेश।",
    secureTitle: "जीवनसेतु सुरक्षित प्रवेश",
    badge: "सीधा लॉगिन",
    selectRole: "भूमिका चुनें",
    identifierLabel: "मोबाइल नंबर या ईमेल *",
    identifierPlaceholder: "उदा. 9823411204 या email@domain.com",
    passwordLabel: "पासवर्ड *",
    passwordPlaceholder: "पासवर्ड दर्ज करें",
    demoNote: "(डेमो: 123456)",
    submitBtn: "लॉगिन करें और जारी रखें",
    noAccount: "खाता नहीं है?",
    registerLink: "नया खाता बनाएं",
    errIdentifier: "कृपया मोबाइल नंबर या ईमेल दर्ज करें।",
    errPassword: "कृपया पासवर्ड दर्ज करें।",
    errFailed: "लॉगिन असफल रहा। कृपया विवरण जांचें।",
    successMsg: "लॉगिन सफल! आगे बढ़ रहे हैं...",
    roles: {
      patient: "मरीज",
      phc_staff: "पीएचसी कर्मचारी",
      doctor: "डॉक्टर",
      hospital: "अस्पताल डेस्क",
      ngo: "एनजीओ",
      admin: "प्रशासक",
    },
  },
  mr: {
    heading: "आरोग्य पोर्टलवर लॉगिन करा",
    subheading: "सुरक्षित, जलद आणि भूमिका-आधारित आरोग्य सेवा प्रवेश.",
    secureTitle: "जीवनसेतु सुरक्षित प्रवेश",
    badge: "झटपट लॉगिन",
    selectRole: "भूमिका निवडा",
    identifierLabel: "मोबाइल नंबर किंवा ईमेल *",
    identifierPlaceholder: "उदा. ९८२३४११२०४ किंवा email@domain.com",
    passwordLabel: "पासवर्ड *",
    passwordPlaceholder: "पासवर्ड टाका",
    demoNote: "(डेमो: १२३४५६)",
    submitBtn: "लॉगिन करा आणि सुरू करा",
    noAccount: "खाते नाही?",
    registerLink: "नवीन खाते तयार करा",
    errIdentifier: "कृपया मोबाइल नंबर किंवा ईमेल टाका.",
    errPassword: "कृपया पासवर्ड टाका.",
    errFailed: "लॉगिन अयशस्वी. कृपया तपशील तपासा.",
    successMsg: "लॉगिन यशस्वी! सुरू करत आहोत...",
    roles: {
      patient: "रुग्ण",
      phc_staff: "आरोग्य कर्मचारी",
      doctor: "डॉक्टर",
      hospital: "रुग्णालय डेस्क",
      ngo: "सामाजिक संस्था",
      admin: "प्रशासक",
    },
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const { language } = useLanguage();
  const { login } = useAuth();

  const txt = LOGIN_TEXTS[language] || LOGIN_TEXTS.en;

  const [activeRole, setActiveRole] = useState(USER_ROLES.PATIENT);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const roleTabs = [
    { id: USER_ROLES.PATIENT, label: txt.roles.patient },
    { id: USER_ROLES.PHC_STAFF, label: txt.roles.phc_staff },
    { id: USER_ROLES.DOCTOR, label: txt.roles.doctor },
    { id: USER_ROLES.HOSPITAL, label: txt.roles.hospital },
    { id: USER_ROLES.NGO, label: txt.roles.ngo },
    { id: USER_ROLES.ADMIN, label: txt.roles.admin },
  ];

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleFillDemo = (role) => {
    setActiveRole(role);
    setErrorMessage("");
    setSuccessMessage("");
    if (role === USER_ROLES.PATIENT) {
      setIdentifier("rameshwar.patil@ruralmail.in");
      setPassword("123456");
    } else if (role === USER_ROLES.PHC_STAFF) {
      setIdentifier("dr.ananya@phc.maha.gov.in");
      setPassword("123456");
    } else if (role === USER_ROLES.DOCTOR) {
      setIdentifier("dr.kulkarni@civilhospital.org");
      setPassword("123456");
    } else if (role === USER_ROLES.HOSPITAL) {
      setIdentifier("referrals@gmc-nagpur.gov.in");
      setPassword("123456");
    } else if (role === USER_ROLES.NGO) {
      setIdentifier("contact@graminarogya.org");
      setPassword("123456");
    } else if (role === USER_ROLES.ADMIN) {
      setIdentifier("dho.gadchiroli@health.gov.in");
      setPassword("123456");
    }
  };

  const handleDirectLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!identifier.trim()) {
      setErrorMessage(txt.errIdentifier);
      return;
    }

    if (!password) {
      setErrorMessage(txt.errPassword);
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier.trim(), password, activeRole);
      setSuccessMessage(`✅ ${txt.successMsg}`);
      setTimeout(() => {
        router.push(redirectPath);
      }, 400);
    } catch (err) {
      setErrorMessage(err.message || txt.errFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-left transition-colors duration-300 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[400px] bg-teal-500/10 dark:bg-teal-500/10 blur-[140px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none -z-0" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 mb-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="JeevanSetu Logo"
            className="w-12 h-12 rounded-2xl object-contain shadow-lg bg-white dark:bg-slate-950 p-1 border border-slate-200 dark:border-white/15 group-hover:scale-105 transition-transform"
          />
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Jeevan<span className="text-teal-600 dark:text-teal-400">Setu</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {txt.heading}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {txt.subheading}
        </p>

        {/* Language & Theme Selection Bar */}
        <div className="pt-2 flex items-center justify-center gap-2">
          <ThemeToggle />
          <LanguageSelector variant="pills" />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="rounded-3xl bg-white dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-2xl overflow-hidden">
          <div className="bg-teal-900 dark:bg-gradient-to-r dark:from-teal-950/90 dark:via-slate-900/90 dark:to-teal-950/90 border-b border-teal-800 dark:border-white/10 text-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-300" />
                <h3 className="text-sm font-bold text-white">
                  {txt.secureTitle}
                </h3>
              </div>
              <span className="text-[11px] bg-teal-400/20 px-2.5 py-0.5 rounded-full text-teal-200 font-bold border border-teal-400/30">
                {txt.badge}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <Alert variant="danger" className="text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              </Alert>
            )}

            {/* Success Message */}
            {successMessage && !errorMessage && (
              <Alert variant="success" className="text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              </Alert>
            )}

            {/* Clean Professional Login Form */}
            <form onSubmit={handleDirectLogin} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1">
                  {txt.identifierLabel}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={txt.identifierPlaceholder}
                    className="pl-9 text-xs font-medium"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-300">
                    {txt.passwordLabel}
                  </label>
                </div>
                <div className="relative">
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={txt.passwordPlaceholder}
                    className="pl-9 text-xs"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !identifier || !password}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm py-3 shadow-lg shadow-teal-500/20 rounded-2xl gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{txt.submitBtn}</span>
              </Button>
            </form>

            {/* Collapsible Demo Testing Credentials for Evaluators */}
            <details className="text-xs pt-2 border-t border-slate-200 dark:border-white/10 group">
              <summary className="font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer list-none flex items-center justify-between py-1">
                <span>🧪 Demo Role Fast Fill (Evaluation)</span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2">
                {roleTabs.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleFillDemo(r.id)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                      activeRole === r.id
                        ? "bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-500/40 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </details>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">
              {txt.noAccount}
            </span>
            <Link
              href="/register"
              className="font-bold text-teal-700 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{txt.registerLink}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
