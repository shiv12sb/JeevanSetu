import React from "react";
import { ShieldCheck, AlertOctagon, UserCheck, Lock, CheckCircle2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";

export function TrustSafetySection() {
  const boundaries = [
    {
      icon: AlertOctagon,
      title: "No Automated Medical Diagnosis",
      detail:
        "JeevanSetu never tells a patient what disease they have or prescribes medications. All AI recommendations focus exclusively on finding verified healthcare resources, schemes, and doctors.",
    },
    {
      icon: UserCheck,
      title: "Human-in-the-Loop Anomaly Flags",
      desc:
        "Automated system alerts regarding doctor attendance or referral delays are structured as flags for administrative human review, never automated punitive accusations.",
    },
    {
      icon: Lock,
      title: "Strict Patient Privacy & RLS",
      desc:
        "Medical documents and case notes are protected with row-level security (RLS). Patient records are visible only to the patient and verified clinicians involved in the referral chain.",
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Trust & Clinical Safety
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Our Healthcare Safety Boundaries
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Healthcare access requires uncompromising ethics. Here are the core safety commitments embedded in JeevanSetu.
          </p>
        </div>

        {/* Highlighted Safety Banner */}
        <div className="mt-10 max-w-4xl mx-auto">
          <Alert variant="safety" className="p-5">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-teal-950">
                Ethical Healthcare AI Principle
              </h4>
              <p className="text-xs text-teal-900 leading-relaxed">
                JeevanSetu is built to eliminate coordination friction, reduce supply stockouts, and connect underserved patients to verified care. It does not replace medical judgment, nor does it generate speculative medical advice.
              </p>
            </div>
          </Alert>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {boundaries.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {b.detail || b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
