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
  const [identifier, setIdentifier] = useState("rameshwar.patil@ruralmail.in");
  const [password, setPassword] = useState("123456");

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
      setIdentifier("dho.nagpur@health.gov.in");
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-left transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="JeevanSetu Logo"
            className="w-12 h-12 rounded-xl object-contain shadow-md bg-white p-0.5 border border-slate-200 dark:border-slate-700"
          />
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Jeevan<span className="text-teal-600 dark:text-teal-400">Setu</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {txt.heading}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {txt.subheading}
        </p>

        {/* Language & Theme Selection Bar */}
        <div className="pt-2 flex items-center justify-center gap-2">
          <ThemeToggle />
          <LanguageSelector variant="pills" />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-teal-700 to-teal-900 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-300" />
                <CardTitle className="text-sm font-bold text-white">
                  {txt.secureTitle}
                </CardTitle>
              </div>
              <span className="text-[11px] bg-teal-800/80 px-2 py-0.5 rounded text-teal-200 font-bold border border-teal-600">
                {txt.badge}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <Alert variant="danger" className="text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              </Alert>
            )}

            {/* Success Message */}
            {successMessage && !errorMessage && (
              <Alert variant="success" className="text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              </Alert>
            )}

            {/* Role Switcher */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {txt.selectRole}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {roleTabs.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleChange(r.id)}
                    className={`py-2 px-1.5 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                      activeRole === r.id
                        ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleDirectLogin} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {txt.passwordLabel}
                  </label>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                    {txt.demoNote}
                  </span>
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
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !identifier || !password}
                className="w-full bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm py-3 shadow-md gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{txt.submitBtn}</span>
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {txt.noAccount}
            </span>
            <Link
              href="/register"
              className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{txt.registerLink}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardFooter>
        </Card>
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
