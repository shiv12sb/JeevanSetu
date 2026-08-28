"use client";

import React, { useState, Suspense } from "react";
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
  CreditCard,
  Lock,
} from "lucide-react";
import { USER_ROLES } from "@/lib/constants";
import { MAHARASHTRA_DISTRICTS } from "@/context/LocationContext";

const REGISTER_TEXTS = {
  en: {
    heading: "Create New Healthcare Account",
    subheading: "Fast & secure registration for rural healthcare coordination.",
    networkTitle: "JeevanSetu Public Healthcare Network",
    badge: "Direct Signup",
    selectRole: "Select Your Role *",
    fullName: "Full Name *",
    fullNamePlaceholder: "e.g. Rameshwar Patil / Dr. Priya Sharma",
    phoneOrEmail: "Mobile Number / Email *",
    phonePlaceholder: "e.g. 9823411204 or email@domain.com",
    password: "Create Password *",
    passwordPlaceholder: "Enter your password (e.g. 123456)",
    district: "District *",
    state: "State",
    abhaId: "ABHA Health Card ID (Optional)",
    abhaPlaceholder: "91-4821-3902-8172",
    submitBtn: "Create Account & Sign In",
    alreadyHaveAccount: "Already have an account?",
    signInLink: "Sign In",
    errFullName: "Please enter your full name.",
    errPhone: "Please enter a valid mobile number or email.",
    errPassword: "Password must be at least 3 characters.",
    successMsg: "Account created successfully! Redirecting...",
    roles: {
      patient: "Patient / Citizen",
      phc_staff: "PHC Staff / ASHA",
      doctor: "Doctor / Specialist",
      hospital: "Hospital Desk",
      ngo: "NGO / Aid Desk",
    },
  },
  hi: {
    heading: "नया स्वास्थ्य खाता बनाएं",
    subheading: "ग्रामीण स्वास्थ्य समन्वय हेतु सुरक्षित व त्वरित पंजीकरण।",
    networkTitle: "जीवनसेतु सार्वजनिक स्वास्थ्य नेटवर्क",
    badge: "सीधा पंजीकरण",
    selectRole: "अपनी भूमिका चुनें *",
    fullName: "पूरा नाम *",
    fullNamePlaceholder: "उदा. रामेश्वर पाटिल / डॉ. प्रिया शर्मा",
    phoneOrEmail: "मोबाइल नंबर या ईमेल *",
    phonePlaceholder: "उदा. 9823411204 या email@domain.com",
    password: "पासवर्ड बनाएं *",
    passwordPlaceholder: "पासवर्ड दर्ज करें (उदा. 123456)",
    district: "जिला *",
    state: "राज्य",
    abhaId: "ABHA हेल्थ कार्ड ID (वैकल्पिक)",
    abhaPlaceholder: "91-4821-3902-8172",
    submitBtn: "खाता बनाएं और लॉगिन करें",
    alreadyHaveAccount: "पहले से खाता मौजूद है?",
    signInLink: "लॉगिन करें",
    errFullName: "कृपया अपना पूरा नाम दर्ज करें।",
    errPhone: "कृपया वैध मोबाइल नंबर या ईमेल दर्ज करें।",
    errPassword: "पासवर्ड कम से कम ३ अक्षरों का होना चाहिए।",
    successMsg: "खाता सफलतापूर्वक बन गया! आगे बढ़ रहे हैं...",
    roles: {
      patient: "मरीज / नागरिक",
      phc_staff: "पीएचसी कर्मचारी / आशा",
      doctor: "डॉक्टर / विशेषज्ञ",
      hospital: "अस्पताल डेस्क",
      ngo: "एनजीओ / सहायता डेस्क",
    },
  },
  mr: {
    heading: "नवीन आरोग्य खाते तयार करा",
    subheading: "ग्रामीण आरोग्य समन्वयासाठी सुरक्षित व जलद नोंदणी.",
    networkTitle: "जीवनसेतु सार्वजनिक आरोग्य नेटवर्क",
    badge: "झटपट नोंदणी",
    selectRole: "तुमची भूमिका निवडा *",
    fullName: "पूर्ण नाव *",
    fullNamePlaceholder: "उदा. रामेश्वर पाटील / डॉ. प्रिया शर्मा",
    phoneOrEmail: "मोबाइल नंबर किंवा ईमेल *",
    phonePlaceholder: "उदा. ९८२३४११२०४ किंवा email@domain.com",
    password: "पासवर्ड तयार करा *",
    passwordPlaceholder: "पासवर्ड टाका (उदा. १२३४५६)",
    district: "जिल्हा *",
    state: "राज्य",
    abhaId: "ABHA हेल्थ कार्ड ID (पर्यायी)",
    abhaPlaceholder: "91-4821-3902-8172",
    submitBtn: "खाते तयार करा आणि सुरू करा",
    alreadyHaveAccount: "आधीच खाते आहे?",
    signInLink: "लॉगिन करा",
    errFullName: "कृपया तुमचे पूर्ण नाव टाका.",
    errPhone: "कृपया वैध मोबाइल नंबर किंवा ईमेल टाका.",
    errPassword: "पासवर्ड किमान ३ अक्षरांचा असावा.",
    successMsg: "खाते यशस्वीरित्या तयार झाले! सुरू करत आहोत...",
    roles: {
      patient: "रुग्ण / नागरिक",
      phc_staff: "आरोग्य कर्मचारी / आशा",
      doctor: "डॉक्टर / तज्ज्ञ",
      hospital: "रुग्णालय डेस्क",
      ngo: "सामाजिक संस्था / एनजीओ",
    },
  },
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const { language } = useLanguage();
  const { register } = useAuth();

  const txt = REGISTER_TEXTS[language] || REGISTER_TEXTS.en;

  const [role, setRole] = useState(USER_ROLES.PATIENT);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [district, setDistrict] = useState("Nagpur");
  const [state, setState] = useState("Maharashtra");
  const [abhaId, setAbhaId] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const roleTabs = [
    { id: USER_ROLES.PATIENT, label: txt.roles.patient },
    { id: USER_ROLES.PHC_STAFF, label: txt.roles.phc_staff },
    { id: USER_ROLES.DOCTOR, label: txt.roles.doctor },
    { id: USER_ROLES.HOSPITAL, label: txt.roles.hospital },
    { id: USER_ROLES.NGO, label: txt.roles.ngo },
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName.trim()) {
      setErrorMessage(txt.errFullName);
      return;
    }

    const identifier = phone.trim();
    if (!identifier || identifier.length < 6) {
      setErrorMessage(txt.errPhone);
      return;
    }

    if (!password || password.length < 3) {
      setErrorMessage(txt.errPassword);
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: fullName.trim(),
        role,
        district,
        state,
        phone: identifier.replace(/\D/g, "").length === 10 ? `+91 ${identifier}` : identifier,
        email: identifier.includes("@") ? identifier : `${identifier.replace(/\D/g, "") || "user"}@jeevansetu.in`,
        password,
        abha_id: abhaId.trim() || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      });

      setSuccessMessage(`✅ ${txt.successMsg}`);
      setTimeout(() => {
        router.push(redirectPath);
      }, 400);
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
                  {txt.networkTitle}
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
                    onClick={() => setRole(r.id)}
                    className={`py-2 px-1.5 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
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

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-3.5 pt-1">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {txt.fullName}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={txt.fullNamePlaceholder}
                    className="pl-9 text-xs"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Mobile / Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {txt.phoneOrEmail}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={txt.phonePlaceholder}
                    className="pl-9 text-xs font-medium"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {txt.password}
                </label>
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

              {/* District Selection */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {txt.district}
                  </label>
                  <Select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="text-xs font-semibold"
                  >
                    {MAHARASHTRA_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {language === "en" ? d.name : `${d.name} (${d.marathiName})`}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {txt.state}
                  </label>
                  <Input
                    type="text"
                    disabled
                    value={state}
                    className="text-xs bg-slate-100 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* ABHA ID (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {txt.abhaId}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    placeholder={txt.abhaPlaceholder}
                    className="pl-9 text-xs font-mono"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !fullName || !phone || !password}
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
              {txt.alreadyHaveAccount}
            </span>
            <Link
              href="/login"
              className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{txt.signInLink}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
