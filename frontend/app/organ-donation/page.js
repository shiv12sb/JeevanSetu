"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import {
  Heart,
  ShieldCheck,
  Info,
  CheckCircle2,
  HelpCircle,
  Eye,
  Activity,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Users,
  Building2,
  Lock,
  Compass,
  MessageCircle,
  Stethoscope,
  PhoneCall,
} from "lucide-react";

export function OrganDonationPage() {
  const [activeIntent, setActiveIntent] = useState("all");
  const { t } = useLanguage();

  const intentCards = [
    {
      id: "donate",
      titleKey: "intentDonate",
      fallbackTitle: "I Want to Donate",
      icon: Heart,
      badge: "Donor Pathway",
      badgeVariant: "danger",
      description: "Learn about the voluntary donation pledge, living vs deceased donation, and official registration.",
    },
    {
      id: "transplant",
      titleKey: "intentTransplant",
      fallbackTitle: "I Need Transplant Information",
      icon: Stethoscope,
      badge: "Recipient Guidance",
      badgeVariant: "info",
      description: "Understand the medical evaluation process, authorized transplant centers, and official waiting list rules.",
    },
    {
      id: "family",
      titleKey: "intentFamily",
      fallbackTitle: "Talk to Your Family",
      icon: Users,
      badge: "Family Discussion",
      badgeVariant: "teal",
      description: "A sensitive conversation guide to help communicate your wishes to family members.",
    },
    {
      id: "learn",
      titleKey: "intentLearn",
      fallbackTitle: "I Want to Learn (Facts & Myths)",
      icon: Compass,
      badge: "Public Education",
      badgeVariant: "success",
      description: "Evidence-aligned clarification on common questions, safety laws, and ethical standards.",
    },
  ];

  const whatCanBeDonated = [
    {
      name: "Kidneys",
      type: "Solid Organ",
      description: "Can assist patients with chronic kidney failure and end-stage renal disease.",
      icon: Activity,
    },
    {
      name: "Liver",
      type: "Solid Organ",
      description: "Crucial for acute liver failure and advanced non-reversible liver conditions.",
      icon: Activity,
    },
    {
      name: "Heart & Lungs",
      type: "Vital Organs",
      description: "Considered in deceased organ donation for patients with irreversible heart failure.",
      icon: Heart,
    },
    {
      name: "Corneas (Eyes)",
      type: "Tissue Donation",
      description: "Can restore sight to individuals suffering from corneal blindness.",
      icon: Eye,
    },
    {
      name: "Skin & Bone Tissues",
      type: "Tissue Donation",
      description: "Used in major burn management and complex orthopedic reconstructive surgeries.",
      icon: ShieldCheck,
    },
  ];

  const transplantPathwaySteps = [
    {
      step: "1",
      title: "Clinical Evaluation",
      desc: "Patient undergoes thorough clinical workup by a specialized medical board.",
    },
    {
      step: "2",
      title: "Authorized Centre Referral",
      desc: "Patient is referred to a state-licensed Government or Empaneled Transplant Hospital.",
    },
    {
      step: "3",
      title: "Official Registry Listing",
      desc: "The authorized hospital registers the patient on the official national/state waiting list.",
    },
    {
      step: "4",
      title: "Transparent Allocation",
      desc: "Organ allocation is strictly automated and governed by authorized medical authorities.",
    },
    {
      step: "5",
      title: "Authorized Transplant",
      desc: "Surgeons at the certified hospital perform the transplant procedure under documented oversight.",
    },
  ];

  const mythsVsFacts = [
    {
      myth: "Myth: Doctors will not try to save my life if they know I pledged to donate organs.",
      fact: "Fact: The emergency ICU team treating you is completely separate from transplant coordination teams. Saving your life is always the first and only clinical priority.",
    },
    {
      myth: "Myth: Organ donation disfigures the body for funeral ceremonies.",
      fact: "Fact: Surgical retrieval is conducted with extreme clinical respect and care, similar to standard surgery, allowing customary open-casket or traditional funeral rites.",
    },
    {
      myth: "Myth: Organs can be bought or sold through private websites or platforms.",
      fact: "Fact: Buying or selling human organs is strictly illegal under the Transplantation of Human Organs and Tissues Act. All donation is non-commercial, voluntary, and ethically governed.",
    },
    {
      myth: "Myth: Living organ donation and deceased body donation are the same thing.",
      fact: "Fact: Organ donation involves specific viable organs/tissues for patient transplantation, whereas whole-body anatomical donation is given to medical colleges for scientific education.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Hero Section */}
        <section className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 fill-teal-600/20" />
              Public Healthcare Education & Navigation
            </span>
            <Badge variant="teal" size="sm">Neutral Information</Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {t("organDonationHeading", "Organ & Tissue Donation Information Hub")}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            {t("organDonationSubheading", "Organ and tissue donation is a voluntary medical contribution that can provide life-saving support for patients with end-stage organ failure. Explore verified information for donors, transplant patients, and families below.")}
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Educational & Non-Coercive
            </span>
            <span className="flex items-center gap-1 text-sky-800 dark:text-sky-300">
              <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Strict Legal & Ethical Alignment
            </span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Zero Commercialization Supported
            </span>
          </div>
        </section>

        {/* User Intent Selection Grid - Single Language Display */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              What Are You Looking For Today?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose your area of inquiry to jump directly to relevant guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {intentCards.map((card) => {
              const Icon = card.icon;
              const isSelected = activeIntent === card.id;
              const translatedTitle = t(card.titleKey, card.fallbackTitle);
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveIntent(isSelected ? "all" : card.id)}
                  className={`p-5 rounded-2xl border text-left transition-all space-y-2 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "bg-teal-50 dark:bg-teal-950/60 border-teal-600 dark:border-teal-400 shadow-md ring-2 ring-teal-600/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs hover:border-teal-300 dark:hover:border-teal-600"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center border border-teal-100 dark:border-teal-800">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant={card.badgeVariant} size="sm">{card.badge}</Badge>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{translatedTitle}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{card.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center justify-between">
                    <span>{isSelected ? "Section Active" : "Explore Section"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* JOURNEY A: "I Want to Donate" (Donor Journey) */}
        {(activeIntent === "all" || activeIntent === "donate") && (
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="space-y-1">
              <Badge variant="danger" size="sm">Donor Pathway</Badge>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                I Want to Donate — The Pledging Pathway
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                How a voluntary pledge works and the difference between deceased and living organ donation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <strong className="text-sm font-bold text-slate-900 dark:text-white block">Deceased Organ Donation</strong>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Occurs when an individual has been medically certified as brain stem dead in an ICU. Next of kin confirm the consent at the hospital before retrieval by authorized government teams.
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tissues such as corneas (eyes) can also be donated following cardiac death at home or at the hospital.
                </p>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <strong className="text-sm font-bold text-slate-900 dark:text-white block">Living Organ Donation</strong>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  A healthy living individual may donate one kidney or a portion of liver to an immediate family member under strict statutory authorization committee approval and clinical testing.
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Living donation is governed strictly to protect donor health and prohibit any commercial transactions.
                </p>
              </div>
            </div>

            {/* Official Government Registration & NOTTO Portal Integration */}
            <div className="p-6 bg-linear-to-r from-teal-950 via-teal-900 to-slate-900 rounded-2xl text-white space-y-4 shadow-md border border-teal-800">
              <div className="space-y-1">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Official Government of India Registry
                </span>
                <h4 className="text-lg sm:text-xl font-bold">National Organ & Tissue Transplant Organisation (NOTTO)</h4>
                <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-3xl">
                  Register your voluntary donor pledge directly on the authorized Government of India NOTTO registry (MoHFW) or via your Ayushman Bharat Health Account (ABHA).
                </p>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-teal-800/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href="https://notto.mohfw.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <span>NOTTO National Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://notto.abdm.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors"
                  >
                    <span>Pledge via ABHA ID</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://rottosottomaharashtra.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-teal-200 text-xs font-bold rounded-xl border border-teal-700/50 transition-colors"
                  >
                    <span>ROTTO-SOTTO Maharashtra</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <a
                  href="tel:1800114477"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-950/50 px-3 py-1.5 rounded-lg border border-amber-500/40 hover:bg-amber-900/60 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Toll-Free Helpline: 1800-11-4477</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* JOURNEY B: "I Need Transplant Information" (Recipient Journey) */}
        {(activeIntent === "all" || activeIntent === "transplant") && (
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-1">
              <Badge variant="info" size="sm">Recipient Guidance</Badge>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                I Need a Transplant — The Patient Journey
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Understanding how patients with chronic organ failure navigate toward authorized transplant centers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {transplantPathwaySteps.map((step) => (
                <div key={step.step} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[11px]">
                    {step.step}
                  </div>
                  <h4 className="font-bold text-slate-900">{step.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-snug">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200 space-y-1 text-xs text-teal-950">
              <strong className="block font-bold">JeevanSetu's Role in Transplant Navigation:</strong>
              <p className="leading-relaxed">
                JeevanSetu helps patients find verified licensed hospitals, check government schemes (PM-JAY, MJPJAY), and organize referral documents. <strong>JeevanSetu does NOT allocate organs, match donors to recipients, or manage waiting lists.</strong> All allocation is strictly handled by authorized government medical registries.
              </p>
            </div>

            <div className="flex justify-end">
              <Link href="/resources">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Discover Verified Hospital Transplant Desks</span>
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* JOURNEY C: "Talk to Your Family" (Family Conversation Guide) */}
        {(activeIntent === "all" || activeIntent === "family") && (
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-1">
              <Badge variant="teal" size="sm">Family Conversation Guide</Badge>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Talk to Your Family About Your Wishes
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                In India, next-of-kin confirmation is required at the hospital during deceased donation. Communicating with your family ensures your wishes are known and respected.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">1. Share Your Reasons</h4>
                <p className="text-slate-600 leading-relaxed">
                  Explain why you wish to donate organs or corneas to help someone with organ failure or blindness.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">2. Answer Common Concerns</h4>
                <p className="text-slate-600 leading-relaxed">
                  Reassure family members that donation is handled with surgical respect and does not interfere with funeral customs.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">3. Provide Official Information</h4>
                <p className="text-slate-600 leading-relaxed">
                  Share official national resources and clarify that no financial transactions are ever involved.
                </p>
              </div>
            </div>

            <Alert variant="info" className="text-xs py-2.5">
              <strong>Educational Tool Notice:</strong> This conversation guide is for family awareness only. It is not a legal consent document or substitute for statutory hospital protocols.
            </Alert>
          </section>
        )}

        {/* Section: What Can Be Donated & Myths vs Facts */}
        {(activeIntent === "all" || activeIntent === "learn") && (
          <>
            {/* What Can Be Donated */}
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  What Organs & Tissues Can Be Donated?
                </h2>
                <p className="text-xs text-slate-500">
                  Informational overview of organs and tissues evaluated in transplant medicine.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {whatCanBeDonated.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-teal-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Myths vs Facts */}
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Myths vs. Facts
                </h2>
                <p className="text-xs text-slate-500">
                  Evidence-aligned clarifications on common organ donation questions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mythsVsFacts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-2xs"
                  >
                    <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-100 text-xs font-semibold text-rose-900">
                      {item.myth}
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                      {item.fact}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Ethical Safety Notice */}
        <Alert variant="safety" className="text-xs py-3.5">
          <strong>Non-Diagnostic & Navigation Disclaimer:</strong> JeevanSetu provides educational and navigation support only. It does not perform medical diagnosis, organ matching, allocation, transplantation, or clinical decision-making. Users must consult authorized healthcare authorities for clinical inquiries.
        </Alert>

      </main>

      <Footer />
    </div>
  );
}

export default OrganDonationPage;
