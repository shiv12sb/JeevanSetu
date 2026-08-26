import React from "react";
import { AlertTriangle, Clock, MapPinOff, Layers, PackageX } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      icon: MapPinOff,
      title: "Geographic Isolation & Referral Drop-offs",
      description:
        "Patients traveling long distances to tertiary centers frequently arrive unannounced, facing unavailable specialist beds or missing preliminary documents.",
    },
    {
      icon: PackageX,
      title: "Unexpected Medicine Stockouts",
      description:
        "PHCs often experience sudden stockouts of essential maternal, cardiovascular, and emergency drugs due to static monthly quotas and lack of depletion forecasting.",
    },
    {
      icon: Layers,
      title: "Unclaimed Government Schemes",
      description:
        "Eligible BPL and tribal families continue to pay out-of-pocket costs because complex empanelment criteria and required certificates are difficult to navigate.",
    },
    {
      icon: Clock,
      title: "Fragmented Offline Records",
      description:
        "Paper referral slips get damaged or lost during transit, forcing clinicians to repeat basic diagnostics and delaying critical medical care.",
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            The Rural Healthcare Challenge
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Why healthcare delivery breaks down in underserved communities
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Rural healthcare challenges are rarely about lack of medical intent—they stem from gaps in coordination, verified resource awareness, and proactive supply logistics.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-100/70 text-rose-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {prob.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {prob.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
