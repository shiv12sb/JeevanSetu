"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  CreditCard,
  Lock,
  KeyRound,
  Info,
} from "lucide-react";
import { USER_ROLES, ROLE_LABELS } from "@/lib/constants";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const { t } = useLanguage();
  const { register, sendOtp, verifyOtp } = useAuth();
  
  // Registration Mode: 'otp' | 'password'
  const [registerMode, setRegisterMode] = useState("otp");
  const [role, setRole] = useState(USER_ROLES.PATIENT);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [district, setDistrict] = useState("Gadchiroli");
  const [state, setState] = useState("Maharashtra");
  const [abhaId, setAbhaId] = useState("");

  // OTP Verification States
  const [step, setStep] = useState("details"); // 'details' | 'otp'
  const [enteredOtp, setEnteredOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const roleTabs = [
    { id: USER_ROLES.PATIENT, label: t("role_patient", "Patient") },
    { id: USER_ROLES.PHC_STAFF, label: t("role_phc_staff", "PHC Staff") },
    { id: USER_ROLES.DOCTOR, label: t("role_doctor", "Doctor") },
    { id: USER_ROLES.HOSPITAL, label: t("role_hospital", "Hospital Desk") },
    { id: USER_ROLES.NGO, label: t("role_ngo", "NGO / Aid Desk") },
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

  // Mode 1: Send OTP for Verification
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName.trim()) {
      setErrorMessage("कृपया तुमचे पूर्ण नाव टाका. (Please enter your full name.)");
      return;
    }

    const identifier = phone.trim() || email.trim();
    if (!identifier || identifier.length < 6) {
      setErrorMessage("कृपया वैध १०-अंकी मोबाइल नंबर किंवा ईमेल टाका. (Please provide a valid mobile number or email.)");
      return;
    }

    setIsLoading(true);
    try {
      await sendOtp(identifier);
      setStep("otp");
      setResendCooldown(45);
      setSuccessMessage(`📲 तुमच्या ${identifier} या मोबाइल नंबरवर ६-अंकी पडताळणी कोड (OTP) पाठवला आहे.`);
    } catch (err) {
      setErrorMessage(err.message || "Failed to dispatch verification OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mode 1: Verify OTP and Register (ONLY if OTP is correct!)
  const handleCompleteRegistrationWithOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setErrorMessage("कृपया ६-अंकी OTP टाका. (Please enter the 6-digit OTP code.)");
      return;
    }

    setIsLoading(true);
    const identifier = phone.trim() || email.trim();

    try {
      await verifyOtp(identifier, enteredOtp.trim(), role, {
        name: fullName.trim(),
        role,
        district,
        state,
        phone: phone.trim() || "+91 98234 11204",
        email: email.trim() || `${phone.replace(/\D/g, "") || "user"}@jeevansetu.in`,
        abha_id: abhaId.trim() || "91-4821-3902-8172",
      });

      setSuccessMessage("✅ OTP पडताळणी यशस्वी! खाते तयार झाले आहे... (OTP Verified Successfully!)");
      setTimeout(() => {
        router.push(redirectPath);
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || "चुकीचा OTP! कृपया योग्य कोड टाका. (Invalid OTP code)");
    } finally {
      setIsLoading(false);
    }
  };

  // Mode 2: Direct Password-based Registration
  const handlePasswordRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName.trim()) {
      setErrorMessage("कृपया तुमचे पूर्ण नाव टाका. (Please enter your full name.)");
      return;
    }

    const identifier = phone.trim() || email.trim();
    if (!identifier || identifier.length < 6) {
      setErrorMessage("कृपया १०-अंकी मोबाइल नंबर किंवा ईमेल टाका.");
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage("कृपया किमान ४-अंकी पासवर्ड टाका. (Password must be at least 4 characters.)");
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setErrorMessage("पासवर्ड जुळत नाही. कृपया पुन्हा तपासा. (Passwords do not match.)");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: fullName.trim(),
        role,
        district,
        state,
        phone: phone.trim() || "+91 98234 11204",
        email: email.trim() || (identifier.includes("@") ? identifier : `${identifier.replace(/\D/g, "")}@jeevansetu.in`),
        password,
        abha_id: abhaId.trim() || "91-4821-3902-8172",
      });

      setSuccessMessage("✅ खाते यशस्वीरित्या तयार झाले! (Account Created Successfully!)");
      setTimeout(() => {
        router.push(redirectPath);
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 text-left transition-colors">
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
          {t("registerHeading", "Create New Healthcare Account")}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {redirectPath !== "/" && redirectPath !== "/dashboard/patient" ? (
            <span className="text-teal-600 dark:text-teal-400 font-bold">
              🔒 सुरू ठेवण्यासाठी कृपया १ मिनिटात खाते तयार करा
            </span>
          ) : (
            t("registerSubheading", "Join the rural healthcare coordination and referral network.")
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
          {/* Method Selector: OTP vs Password Registration */}
          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 p-1">
            <button
              type="button"
              onClick={() => {
                setRegisterMode("otp");
                setStep("details");
                setErrorMessage("");
              }}
              className={`py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                registerMode === "otp"
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>📱 मोबाइल OTP ने नोंदणी</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRegisterMode("password");
                setErrorMessage("");
              }}
              className={`py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                registerMode === "password"
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>🔑 पासवर्डने थेट नोंदणी</span>
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
                {t("selectRoleLabel", "Select Your Role / भूमिका")}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {roleTabs.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`py-1.5 px-1 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                      role === r.id
                        ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* OPTION 1: Mobile OTP Registration Flow */}
            {registerMode === "otp" && (
              <>
                {step === "details" ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        पूर्ण नाव (Full Name) *
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="उदा. रमेश पाटील / Rameshwar Patil"
                          className="pl-9 text-xs font-medium"
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        १०-अंकी मोबाइल नंबर (Mobile Number) *
                      </label>
                      <div className="relative">
                        <Input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="8605224467"
                          className="pl-9 text-xs font-medium font-mono"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    {/* District Selection */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          जिल्हा (District)
                        </label>
                        <Select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="text-xs"
                        >
                          <option value="Gadchiroli">Gadchiroli (गडचिरोली)</option>
                          <option value="Chandrapur">Chandrapur (चंद्रपूर)</option>
                          <option value="Gondia">Gondia (गोंदिया)</option>
                          <option value="Nagpur">Nagpur (नागपूर)</option>
                          <option value="Pune">Pune (पुणे)</option>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          राज्य (State)
                        </label>
                        <Input
                          type="text"
                          disabled
                          value={state}
                          className="text-xs bg-slate-100 dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !fullName || !phone}
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
                  /* OTP Verification Step */
                  <form onSubmit={handleCompleteRegistrationWithOtp} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          ६-अंकी पडताळणी कोड (Enter 6-Digit OTP)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setStep("details");
                            setEnteredOtp("");
                            setErrorMessage("");
                          }}
                          className="text-[11px] font-bold text-teal-600 hover:underline cursor-pointer"
                        >
                          माहिती बदला (Edit Details)
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                        {phone} या नंबरवर पाठवलेला कोड टाका:
                      </p>

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
                      <span>पडताळणी करा आणि खाते सुरू करा (Verify & Register)</span>
                    </Button>

                    <div className="flex items-center justify-between text-xs pt-1">
                      {resendCooldown > 0 ? (
                        <span className="text-slate-400 font-mono">
                          पुन्हा पाठवा ({resendCooldown}s)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          className="text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>पुन्हा OTP पाठवा (Resend OTP)</span>
                        </button>
                      )}

                      <span className="text-[11px] text-slate-400">
                        SMS कोड किंवा 123456 टाका
                      </span>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* OPTION 2: Password-Based Registration Flow */}
            {registerMode === "password" && (
              <form onSubmit={handlePasswordRegistration} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    पूर्ण नाव (Full Name) *
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="उदा. रमेश पाटील"
                      className="pl-9 text-xs font-medium"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Mobile / Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    मोबाइल नंबर किंवा ईमेल (Phone / Email) *
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="8605224467 किंवा email@domain.com"
                      className="pl-9 text-xs font-medium"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    पासवर्ड तयार करा (Create Password) *
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="किमान ४ अक्षरे / आकडे"
                      className="pl-9 text-xs"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* District Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      जिल्हा (District)
                    </label>
                    <Select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="text-xs"
                    >
                      <option value="Gadchiroli">Gadchiroli (गडचिरोली)</option>
                      <option value="Chandrapur">Chandrapur (चंद्रपूर)</option>
                      <option value="Gondia">Gondia (गोंदिया)</option>
                      <option value="Nagpur">Nagpur (नागपूर)</option>
                      <option value="Pune">Pune (पुणे)</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      राज्य (State)
                    </label>
                    <Input
                      type="text"
                      disabled
                      value={state}
                      className="text-xs bg-slate-100 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !fullName || !phone || !password}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-2.5 shadow-md gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>खाते तयार करा (Create Account with Password)</span>
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-800 text-center flex flex-col gap-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              आधीच खाते आहे?{" "}
              <Link
                href={`/login${redirectPath !== "/" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                येथे लॉगिन करा (Sign In)
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

export default RegisterPage;
