import React from "react";
import { Package, AlertTriangle, Stethoscope, Clock, ShieldCheck, RefreshCw } from "lucide-react";

export function PhcCapabilitiesSection() {
  const phcFeatures = [
    {
      icon: Package,
      title: "Daily Medicine Stock Auditing",
      desc: "Real-time stock balance updating upon dispense, ensuring stock counts always match physical shelf counts.",
    },
    {
      icon: AlertTriangle,
      title: "Dynamic Depletion Forecasting",
      desc: "Instant burn-rate calculation (Current Stock ÷ Average Daily Usage). Triggers visual badges when supply drops under 3 to 5 days.",
    },
    {
      icon: Stethoscope,
      title: "Doctor Attendance & Check-In",
      desc: "Transparent logging of duty medical officers and consultation hours, improving service visibility across the district.",
    },
    {
      icon: RefreshCw,
      title: "One-Click Sub-Depot Reorders",
      desc: "Auto-generates standardized medicine requisition indent slips for District Health Warehouses before stockouts occur.",
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Facility Logistics & Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Strengthening Primary Health Centres from within
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Giving medical officers and pharmacists the visibility needed to prevent drug shortages and track local consultations.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {phcFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-teal-50/40 border border-teal-100 hover:border-teal-300 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
