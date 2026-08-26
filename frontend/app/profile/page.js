"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, USER_ROLES } from "@/lib/constants";
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Heart,
  Save,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Activity,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, isAuthenticated, updateProfile, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    bloodGroup: "B+",
    age: "48",
    gender: "Male",
    village: "Ashti",
    taluka: "Chamorshi",
    district: "Gadchiroli",
    state: "Maharashtra",
    pincode: "442707",
    primaryPhc: "Ashti Primary Health Centre",
    abhaId: "91-4821-3902-8172",
    rationCard: "RC-MH-2024-81920",
    emergencyContact: "+91 94221 88301 (Spouse)",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || user.full_name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        bloodGroup: user.bloodGroup || user.blood_group || prev.bloodGroup,
        age: user.age ? String(user.age) : prev.age,
        gender: user.gender || prev.gender,
        village: user.village || prev.village,
        taluka: user.taluka || prev.taluka,
        district: user.district || prev.district,
        state: user.state || prev.state,
        primaryPhc: user.primaryPhc || prev.primaryPhc,
        abhaId: user.abhaId || user.abha_id || prev.abhaId,
        rationCard: user.rationCard || user.ration_card_number || prev.rationCard,
        emergencyContact: user.emergencyContact || user.emergency_contact || prev.emergencyContact,
      }));
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (saveSuccess) setSaveSuccess(false);
    if (saveError) setSaveError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");
    try {
      await updateProfile(formData);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setIsSaving(false);
      setSaveError(err.message || "Failed to update profile. Please check your data.");
    }
  };

  const handleSignOutConfirm = async () => {
    await logout();
    setShowSignOutModal(false);
    router.push("/");
  };

  const roleName = user ? t(`role_${user.role}`, ROLE_LABELS[user.role] || user.role) : t("role_patient", "Patient");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-left transition-colors">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Header Banner */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
              {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formData.name || "Healthcare Citizen"}
                </h1>
                <Badge variant="teal" size="sm">{roleName}</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>📞 {formData.phone || "No phone added"}</span>
                <span>•</span>
                <span>📍 {formData.district}, {formData.state}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSignOutModal(true)}
              className="text-xs text-rose-600 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1.5 w-full sm:w-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t("signOut", "Sign Out")}</span>
            </Button>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <Alert variant="success" className="animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t("changesSaved", "Profile details updated successfully!")}</span>
            </div>
          </Alert>
        )}

        {/* Error Alert */}
        {saveError && (
          <Alert variant="danger" className="animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{saveError}</span>
            </div>
          </Alert>
        )}

        {/* Profile Details Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Information */}
          <Card className="shadow-xs border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-5">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {t("personalInfo", "Personal Information")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label={t("fullName", "Full Name")}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
              <Input
                label={t("mobileNumber", "Mobile Phone Number")}
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="optional@domain.com"
              />
              <Select
                label={t("bloodGroup", "Blood Group")}
                value={formData.bloodGroup}
                onChange={(e) => handleChange("bloodGroup", e.target.value)}
                options={[
                  { value: "A+", label: "A+" },
                  { value: "A-", label: "A-" },
                  { value: "B+", label: "B+" },
                  { value: "B-", label: "B-" },
                  { value: "O+", label: "O+" },
                  { value: "O-", label: "O-" },
                  { value: "AB+", label: "AB+" },
                  { value: "AB-", label: "AB-" },
                ]}
              />
              <Input
                label="Age (Years)"
                type="number"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
              />
              <Select
                label="Gender"
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                ]}
              />
            </CardContent>
          </Card>

          {/* Healthcare Identifiers & Schemes */}
          <Card className="shadow-xs border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {t("healthcareIds", "Healthcare Identifiers & Schemes")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="ABHA ID (Ayushman Bharat Health Account)"
                value={formData.abhaId}
                onChange={(e) => handleChange("abhaId", e.target.value)}
                helperText="National digital health ID for linked clinical case records."
              />
              <Input
                label="Ration Card / Scheme Number"
                value={formData.rationCard}
                onChange={(e) => handleChange("rationCard", e.target.value)}
                helperText="Used for automated PM-JAY & MJPJAY cashless eligibility."
              />
              <div className="sm:col-span-2 p-3 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-between text-xs text-teal-900 dark:text-teal-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Scheme Status: <strong>PM-JAY Cashless Hospitalization Pre-Verified</strong></span>
                </div>
                <Badge variant="teal" size="sm">Active Verified</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Residential Location & Primary Health Centre */}
          <Card className="shadow-xs border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {t("locationAndPhc", "Residential & Primary Health Centre (PHC)")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Village / Ward"
                value={formData.village}
                onChange={(e) => handleChange("village", e.target.value)}
              />
              <Input
                label="Taluka / Block"
                value={formData.taluka}
                onChange={(e) => handleChange("taluka", e.target.value)}
              />
              <Input
                label={t("districtLabel", "District")}
                value={formData.district}
                onChange={(e) => handleChange("district", e.target.value)}
              />
              <Input
                label={t("stateLabel", "State")}
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
              />
              <Input
                label="Assigned Primary Health Centre (PHC)"
                value={formData.primaryPhc}
                onChange={(e) => handleChange("primaryPhc", e.target.value)}
                className="sm:col-span-2"
              />
              <Input
                label={t("emergencyContact", "Emergency Contact (Name & Phone)")}
                value={formData.emergencyContact}
                onChange={(e) => handleChange("emergencyContact", e.target.value)}
                className="sm:col-span-3"
                helperText="First responder contact dialed during medical emergency escalations."
              />
            </CardContent>
            <CardFooter className="p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                All profile records are stored securely in local session storage.
              </span>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 gap-2"
                isLoading={isSaving}
              >
                <Save className="w-4 h-4" />
                <span>{t("saveChanges", "Save Changes")}</span>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>

      {/* Sign Out Confirmation Modal */}
      <Modal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        title={t("confirmSignOut", "Are you sure you want to sign out?")}
      >
        <div className="space-y-4 text-left">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t("signOutDesc", "You can sign back in anytime with your mobile number or medical ID.")}
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSignOutModal(false)}
            >
              {t("cancel", "Cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleSignOutConfirm}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {t("signOut", "Sign Out")}
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}

export default ProfilePage;
