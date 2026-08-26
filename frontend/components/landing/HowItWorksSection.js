import React from "react";
import { FileText, Sparkles, GitPullRequest, ArrowRight } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      stepNumber: "01",
      icon: FileText,
      title: "Create Healthcare Case",
      description:
        "The patient or PHC healthcare worker enters primary symptoms, vital observations, and attaches clinical test reports.",
    },
    {
      stepNumber: "02",
      icon: Sparkles,
      title: "Grounded AI Recommendation",
      description:
        "JeevanSetu matches verified district hospitals, applicable government schemes (PM-JAY, MJPJAY), and local NGO transport assistance.",
    },
    {
      stepNumber: "03",
      icon: GitPullRequest,
      title: "Track Multi-Stage Referral",
      description:
        "The receiving hospital confirms bed availability, and progress is tracked transparently until treatment is completed.",
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100/70 px-3 py-1 rounded-full border border-teal-200">
            Coordinated Care Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How JeevanSetu connects need to verified support
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            A simple, transparent 3-step pathway from primary health center contact to tertiary hospital resolution.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-200 font-mono">
                      {step.stepNumber}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
