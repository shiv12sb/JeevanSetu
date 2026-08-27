"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Tabs } from "@/components/ui/Tabs";
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
  KeyRound,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { USER_ROLES, ROLE_LABELS } from "@/lib/constants";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const { t } = useLanguage();
  const { login, sendOtp, verifyOtp } = useAuth();

  // Auth Mode: 'otp' | 'password'
  const [authMode, setAuthMode] = useState("otp");
  const [activeRole, setActiveRole] = useState(USER_ROLES.PATIENT);
  
  // OTP Flow States
  const [phoneOrEmail, setPhoneOrEmail] = useState("9823411204");
  const [otpStep, setOtpStep] = useState("input"); // 'input' | 'verify'
  const [enteredOtp, setEnteredOtp] = useState("");
  const [generatedOtpHint, setGeneratedOtpHint] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Password Flow States
  const [identifier, setIdentifier] = useState("rameshwar.patil@ruralmail.in");
  const [password, setPassword] = useState("••••••••");

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const roleTabs = [
    { id: USER_ROLES.PATIENT, label: t("role_patient", "Patient") },
    { id: USER_ROLES.PHC_STAFF, label: t("role_phc_staff", "PHC Staff") },
    { id: USER_ROLES.DOCTOR, label: t("role_doctor", "Doctor") },
    { id: USER_ROLES.HOSPITAL, label: t("role_hospital", "Hospital") },
    { id: USER_ROLES.NGO, label: t("role_ngo", "NGO") },
    { id: USER_ROLES.ADMIN, label: t("role_admin", "Admin") },
  ];

  // Resend Countdown Timer
  useEffect(() => {
    let timer = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setErrorMessage("");
    setSuccessMessage("");
    if (role === USER_ROLES.PATIENT) {
      setPhoneOrEmail("9823411204");
      setIdentifier("rameshwar.patil@ruralmail.in");
    } else if (role === USER_ROLES.PHC_STAFF) {
      setPhoneOrEmail("9423109844");
      setIdentifier("dr.ananya@phc.maha.gov.in");
    } else if (role === USER_ROLES.DOCTOR) {
      setPhoneOrEmail("9822044512");
      setIdentifier("dr.kulkarni@civilhospital.org");
    } else if (role === USER_ROLES.HOSPITAL) {
      setPhoneOrEmail("7122744400");
      setIdentifier("referrals@gmc-nagpur.gov.in");
    } else if (role === USER_ROLES.NGO) {
      setPhoneOrEmail("9823077112");
      setIdentifier("contact@graminarogya.org");
    } else if (role === USER_ROLES.ADMIN) {
      setPhoneOrEmail("7132222104");
      setIdentifier("dho.gadchiroli@health.gov.in");
    }
  };

  // Step 1: Send Genuine OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!phoneOrEmail || phoneOrEmail.trim().length < 6) {
      setErrorMessage("कृपया वैध १०-अंकी मोबाइल नंबर किंवा ईमेल टाका. (Please enter a valid mobile number or email.)");
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendOtp(phoneOrEmail.trim());
      setGeneratedOtpHint(result.otp);
      setOtpStep("verify");
      setResendCooldown(45);
      setSuccessMessage(`📲 तुमच्या ${phoneOrEmail} या मोबाइल नंबरवर ६-अंकी पडताळणी कोड (OTP) पाठवला आहे.`);
    } catch (err) {
      setErrorMessage(err.message || "Failed to dispatch verification OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Genuine OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setErrorMessage("कृपया ६-अंकी OTP टाका. (Please enter the complete 6-digit OTP.)");
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(phoneOrEmail.trim(), enteredOtp.trim(), activeRole, {
        role: activeRole,
      });
      setSuccessMessage("✅ पडताळणी यशस्वी! लॉगिन केले जात आहे... (OTP Verified Successfully!)");
      setTimeout(() => {
        router.push(redirectPath);
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || "चुकीचा OTP! कृपया योग्य ६-अंकी कोड टाका. (Invalid OTP code)");
    } finally {
      setIsLoading(false);
    }
  };

  // Password Login Fallback
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      await login(activeRole, {
        email: identifier.includes("@") ? identifier : `${identifier.replace(/\s+/g, "")}@jeevansetu.in`,
        password,
        identifier,
      });
      router.push(redirectPath);
    } catch (err) {
      setErrorMessage(err.message || "Invalid login credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 text-left transition-colors">
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
          {redirectPath !== "/" && redirectPath !== "/dashboard/patient" ? (
            <span className="text-teal-600 dark:text-teal-400 font-bold">
              🔒 सुरू ठेवण्यासाठी कृपया लॉगिन किंवा साइन अप करा
            </span>
          ) : (
            t("loginSubheading", "Secure, role-based access for rural patients and healthcare workers.")
          )}
        </p>

        {/* Language & Theme Selection Bar */}
        <div className="pt-2 flex items-center justify-center gap-2">
          <ThemeToggle />
          <LanguageSelector variant="pills" />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          {/* Auth Method Selector Tabs: Mobile OTP vs Role Password */}
          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode("otp");
                setErrorMessage("");
              }}
              className={`py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                authMode === "otp"
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>📱 मोबाइल OTP लॉगिन</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("password");
                setErrorMessage("");
              }}
              className={`py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                authMode === "password"
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>🔑 पासवर्ड लॉगिन</span>
            </button>
          </div>

          <CardContent className="p-6 space-y-5">
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
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t("selectRoleLabel", "Select Your Healthcare Role / भूमिका निवडा")}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {roleTabs.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleChange(r.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center border transition-all ${
                      activeRole === r.id
                        ? "bg-teal-600 text-white border-teal-600 shadow-xs scale-102"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MODE 1: Genuine Mobile OTP Login */}
            {authMode === "otp" && (
              <div className="space-y-4 pt-1">
                {otpStep === "input" ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        १०-अंकी मोबाइल नंबर किंवा ईमेल (Mobile / Email)
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          required
                          value={phoneOrEmail}
                          onChange={(e) => setPhoneOrEmail(e.target.value)}
                          placeholder="उदा. 9823411204 किंवा email@domain.com"
                          className="pl-9 text-sm font-medium"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        तुम्हाला ६-अंकी पडताळणी कोड (OTP) पाठवला जाईल.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm py-2.5 shadow-md gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Smartphone className="w-4 h-4" />
                      )}
                      <span>ओटीपी पाठवा (Send Verification OTP)</span>
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          ६-अंकी पडताळणी कोड (Enter 6-Digit OTP)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpStep("input");
                            setEnteredOtp("");
                            setErrorMessage("");
                          }}
                          className="text-[11px] font-bold text-teal-600 hover:underline cursor-pointer"
                        >
                          नंबर बदला (Change)
                        </button>
                      </div>

                      <Input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="• • • • • •"
                        className="text-center tracking-widest text-xl font-mono font-black"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || enteredOtp.length !== 6}
                      className="w-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm py-2.5 shadow-md gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>पडताळणी करून लॉगिन करा (Verify & Login)</span>
                    </Button>

                    <div className="flex items-center justify-between text-xs pt-1">
                      {resendCooldown > 0 ? (
                        <span className="text-slate-400 font-mono">
                          पुन्हा पाठवा ({resendCooldown}s)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>पुन्हा OTP पाठवा (Resend OTP)</span>
                        </button>
                      )}

                      <span className="text-[11px] text-slate-400">
                        SMS प्राप्त झाला नाही?
                      </span>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* MODE 2: Password Login */}
            {authMode === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ईमेल किंवा मोबाइल (Email / Phone)
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="pl-9 text-xs"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    संकेतशब्द (Password)
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 text-xs"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 shadow-sm gap-2"
                >
                  {isLoading ? "Signing in..." : "साइन इन करा (Sign In)"}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-800 text-center flex flex-col gap-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              नवीन वापरकर्ता आहात?{" "}
              <Link
                href={`/register${redirectPath !== "/" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                नवीन खाते तयार करा (Sign Up with OTP)
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

export default LoginPage;
