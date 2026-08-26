import React from "react";
import { CheckCircle2, User, Building2, Shield, HeartHandshake, ArrowRight } from "lucide-react";

export function PatientJourneySection() {
  const journey = [
    {
      actor: "Patient / ASHA Worker",
      title: "1. Intake at Local Health Sub-Centre",
      detail:
        "ASHA worker records symptoms on mobile, captures preliminary vitals, and flags need for specialist cardiology review.",
    },
    {
      actor: "JeevanSetu Grounded Engine",
      title: "2. Automatic Scheme & Facility Matching",
      detail:
        "System verifies patient's BPL card qualifies under Ayushman Bharat PM-JAY and identifies District Hospital Gadchiroli as the nearest facility with an active ICU and Cath Lab.",
    },
    {
      actor: "PHC Medical Officer",
      title: "3. Referral Generation & Direct Sync",
      detail:
        "Medical Officer approves referral. The District Hospital Referral Desk is automatically notified to reserve an OPD consultation slot.",
    },
    {
      actor: "Rural NGO Partner",
      title: "4. Transit Support Coordinated",
      detail:
        "Gramin Arogya Sahayog Trust receives automated notification to provide subsidized transport and attendant food tokens.",
    },
    {
      actor: "Tertiary Hospital Desk",
      title: "5. Admission & Care Completion",
      detail:
        "Patient reaches hospital on scheduled date, undergoes echocardiogram under PM-JAY, and post-discharge recovery instructions sync back to the local PHC.",
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100/80 px-3 py-1 rounded-full border border-teal-200">
            Real-World Impact
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            The Patient Journey: From Symptom to Completed Care
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Follow Rameshwar Patil's journey navigating a severe cardiac referral across the public health network.
          </p>
        </div>

        <div className="mt-12 max-w-4xl mx-auto space-y-4">
          {journey.map((item, idx) => (
            <div
              key={idx}
              className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-teal-300 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                  {item.actor}
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
