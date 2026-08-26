"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Tabs } from "@/components/ui/Tabs";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Heart, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { USER_ROLES, ROLE_LABELS } from "@/lib/constants";

export function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { register } = useAuth();
  
  const [role, setRole] = useState(USER_ROLES.PATIENT);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [district, setDistrict] = useState("Gadchiroli");
  const [state, setState] = useState("Maharashtra");
  const [extraId, setExtraId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const roleTabs = [
    { id: USER_ROLES.PATIENT, label: t("role_patient", "Patient") },
    { id: USER_ROLES.PHC_STAFF, label: t("role_phc_staff", "PHC Staff") },
    { id: USER_ROLES.DOCTOR, label: t("role_doctor", "Doctor") },
    { id: USER_ROLES.HOSPITAL, label: t("role_hospital", "Hospital Desk") },
    { id: USER_ROLES.NGO, label: t("role_ngo", "NGO / Aid Desk") },
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      await register({
        email: email || `${phone.replace(/\D/g, "") || "user"}@jeevansetu.in`,
        password: password || "Password@123",
        name: fullName || (role === USER_ROLES.NGO ? "Gramin Arogya Trust" : "New Healthcare User"),
        phone: phone || "+91 98234 11204",
        role,
        district: district || "Gadchiroli",
        state: state || "Maharashtra",
        abhaId: extraId || "91-4821-3902-8172",
      });
      router.push("/");
    } catch (err) {
      console.error("Registration failed:", err);
      setErrorMessage(err.message || "Registration failed. Please check your information and try again.");
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
          {t("registerHeading", "Create New Healthcare Account")}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("registerSubheading", "Join the rural healthcare coordination and referral network.")}
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
            {errorMessage && (
              <Alert variant="danger" className="text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              </Alert>
            )}

            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t("accountTypeLabel", "Select Account Type")}
              </label>
              <Tabs tabs={roleTabs} activeTab={role} onChange={setRole} />
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5 pt-1 text-left">
              {/* Conditional Name Field */}
              <Input
                label={role === USER_ROLES.NGO ? t("ngoTrustName", "NGO / Trust Name") : t("fullName", "Full Name")}
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={
                  role === USER_ROLES.NGO
                    ? t("ngoTrustPlaceholder", "e.g. Gramin Arogya Sahayog Trust")
                    : t("fullNamePlaceholder", "e.g. Rameshwar Patil")
                }
              />

              {/* Email Address */}
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@health.gov.in or email@domain.com"
              />

              {/* Mobile Phone Number */}
              <Input
                label={role === USER_ROLES.NGO ? "Coordinator Mobile Number" : t("mobileNumber", "Mobile Phone Number")}
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("mobilePlaceholder", "+91 98XXX XXXXX")}
                helperText={t("mobileHelperText", "Used for SMS referral updates and OTP authentication.")}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label={t("stateLabel", "State")}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  options={[
                    { value: "Maharashtra", label: "Maharashtra" },
                    { value: "Madhya Pradesh", label: "Madhya Pradesh" },
                    { value: "Chhattisgarh", label: "Chhattisgarh" },
                  ]}
                />
                <Input
                  label={t("districtLabel", "District / Taluka")}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder={t("districtPlaceholder", "e.g. Gadchiroli")}
                  required
                />
              </div>

              {/* Patient-specific Identification */}
              {role === USER_ROLES.PATIENT && (
                <Input
                  label={t("rationOrAbha", "Ration Card / ABHA Number (Optional)")}
                  value={extraId}
                  onChange={(e) => setExtraId(e.target.value)}
                  placeholder={t("rationHelperText", "For automatic government scheme eligibility verification.")}
                />
              )}

              {/* Hospital / Doctor / PHC Staff Identification */}
              {(role === USER_ROLES.PHC_STAFF || role === USER_ROLES.DOCTOR || role === USER_ROLES.HOSPITAL) && (
                <Input
                  label={t("facilityId", "Facility Code / Registration ID")}
                  value={extraId}
                  onChange={(e) => setExtraId(e.target.value)}
                  placeholder={t("facilityIdPlaceholder", "PHC Code or Medical Council Number")}
                  required
                />
              )}

              {/* NGO-specific Identification & Service Area */}
              {role === USER_ROLES.NGO && (
                <>
                  <Input
                    label={t("ngoDarpanId", "NGO Darpan ID / Trust Reg. No.")}
                    value={extraId}
                    onChange={(e) => setExtraId(e.target.value)}
                    placeholder={t("ngoDarpanPlaceholder", "e.g. MH/2021/0291823")}
                    required
                  />
                  <Select
                    label={t("ngoAidFocus", "Primary Aid & Support Focus")}
                    options={[
                      { value: "transport", label: "Patient Transit & Ambulance Support" },
                      { value: "financial", label: "Treatment & Medicine Financial Grants" },
                      { value: "dialysis", label: "Dialysis & Specialized Care Grants" },
                      { value: "ration", label: "Nutrition & Caregiver Support" },
                    ]}
                  />
                </>
              )}

              <Input
                label={t("createPassword", "Create Password")}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
              />

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 mt-2 gap-2"
                isLoading={isLoading}
              >
                <span>{t("completeRegistrationBtn", "Complete Registration")}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">{t("alreadyRegistered", "Already registered?")}</span>
            <Link href="/login" className="font-semibold text-teal-700 dark:text-teal-400 hover:underline">
              {t("signInHere", "Sign In Here")}
            </Link>
          </CardFooter>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
            {t("returnHome", "← Return to JeevanSetu Homepage")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
