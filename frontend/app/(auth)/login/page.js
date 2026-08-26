"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Tabs } from "@/components/ui/Tabs";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Heart, Lock, User, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { USER_ROLES, ROLE_LABELS } from "@/lib/constants";

export function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [activeRole, setActiveRole] = useState(USER_ROLES.PATIENT);
  const [identifier, setIdentifier] = useState("rameshwar.patil@ruralmail.in");
  const [password, setPassword] = useState("••••••••");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const roleTabs = [
    { id: USER_ROLES.PATIENT, label: t("role_patient", "Patient") },
    { id: USER_ROLES.PHC_STAFF, label: t("role_phc_staff", "PHC Staff") },
    { id: USER_ROLES.DOCTOR, label: t("role_doctor", "Doctor") },
    { id: USER_ROLES.HOSPITAL, label: t("role_hospital", "Hospital") },
    { id: USER_ROLES.NGO, label: t("role_ngo", "NGO") },
    { id: USER_ROLES.ADMIN, label: t("role_admin", "Admin") },
  ];

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setErrorMessage("");
    if (role === USER_ROLES.PATIENT) setIdentifier("rameshwar.patil@ruralmail.in");
    else if (role === USER_ROLES.PHC_STAFF) setIdentifier("dr.ananya@phc.maha.gov.in");
    else if (role === USER_ROLES.DOCTOR) setIdentifier("dr.kulkarni@civilhospital.org");
    else if (role === USER_ROLES.HOSPITAL) setIdentifier("referrals@gmc-nagpur.gov.in");
    else if (role === USER_ROLES.NGO) setIdentifier("contact@graminarogya.org");
    else if (role === USER_ROLES.ADMIN) setIdentifier("dho.gadchiroli@health.gov.in");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      await login(activeRole, {
        email: identifier.includes("@") ? identifier : `${identifier.replace(/\s+/g, "")}@jeevansetu.in`,
        password,
        identifier,
      });
      router.push("/");
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMessage(err.message || "Invalid login credentials. Please verify your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentRoleName = t(`role_${activeRole}`, ROLE_LABELS[activeRole]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-left transition-colors">
      {/* Brand Header */}
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
          {t("loginHeading", "Sign In to Healthcare Portal")}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("loginSubheading", "Secure, role-based access for rural patients and healthcare workers.")}
        </p>

        {/* Language & Theme Selection Bar */}
        <div className="pt-2 flex items-center justify-center gap-2">
          <ThemeToggle />
          <LanguageSelector variant="pills" />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-6 space-y-5">
            {/* Error Alert */}
            {errorMessage && (
              <Alert variant="danger" className="text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              </Alert>
            )}

            {/* Role Selection Tabs */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t("roleLabel", "Select Your Role")}
              </label>
              <Tabs
                tabs={roleTabs}
                activeTab={activeRole}
                onChange={handleRoleChange}
              />
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4 pt-1 text-left">
              <Input
                label={
                  activeRole === USER_ROLES.PATIENT
                    ? t("emailOrPhone", "Email Address / Mobile")
                    : t("officialEmailOrId", "Official Email / Medical ID")
                }
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="user@health.gov.in"
              />

              <Input
                label={t("password", "Password")}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-teal-600 focus:ring-teal-500" />
                  <span>{t("rememberMe", "Remember session")}</span>
                </label>
                <a href="#forgot" className="text-teal-700 dark:text-teal-400 font-semibold hover:underline">
                  {t("forgotPassword", "Forgot Password?")}
                </a>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 gap-2"
                isLoading={isLoading}
              >
                <span>{t("signInBtn", "Sign In to Portal")} ({currentRoleName})</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Direct Access Notice */}
            <div className="p-3 bg-teal-50/70 dark:bg-teal-950/60 rounded-xl border border-teal-100 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2 text-left">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong>{t("directAccessNoticeTitle", "Direct Access:")}</strong> {t("directAccessNoticeText", "Click Sign In to immediately access the dedicated portal shell.")} ({currentRoleName})
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">{t("noAccount", "Don't have an account?")}</span>
            <Link href="/register" className="font-semibold text-teal-700 dark:text-teal-400 hover:underline">
              {t("registerNow", "Register New Patient / Facility")}
            </Link>
          </CardFooter>
        </Card>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
            {t("returnHome", "← Return to JeevanSetu Homepage")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
