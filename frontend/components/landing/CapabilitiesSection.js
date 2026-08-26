import React from "react";
import {
  FileText,
  Building2,
  Sparkles,
  GitPullRequest,
  Package,
  TrendingDown,
  Activity,
  ShieldCheck,
} from "lucide-react";

export function CapabilitiesSection() {
  const capabilities = [
    {
      icon: FileText,
      title: "Patient Healthcare Cases",
      desc: "Structured case records capturing symptoms, vital observations, uploaded lab documents, and longitudinal consultation history.",
    },
    {
      icon: Building2,
      title: "Verified Resource Registry",
      desc: "Up-to-date directory of accredited government hospitals, private empaneled clinics, state/national schemes, and verified NGOs.",
    },
    {
      icon: Sparkles,
      title: "AI-Assisted Grounded Matching",
      desc: "Context-aware recommendations grounded in verified facility registries with explicit reasoning and safety boundaries.",
    },
    {
      icon: GitPullRequest,
      title: "6-Stage Referral Tracking",
      desc: "Complete visibility: Created → Notified → Accepted → Hospital Reached → Treatment Started → Completed with SLA status updates.",
    },
    {
      icon: Package,
      title: "PHC Medicine Inventory",
      desc: "Real-time tracking of essential drug stock levels across primary health centers with supplier and batch auditing.",
    },
    {
      icon: TrendingDown,
      title: "Stock Depletion Warnings",
      desc: "Automated depletion alerts calculated from current stock and average daily usage, enabling proactive reorders before stockouts.",
    },
    {
      icon: Activity,
      title: "PHC Service Monitoring",
      desc: "Facility-level activity monitoring, doctor attendance check-ins, and daily patient visit logs for district administrative review.",
    },
    {
      icon: ShieldCheck,
      title: "Admin Anomaly & Alert Hub",
      desc: "Centralized intelligence for district health officers to investigate referral bottlenecks, inventory deficits, and service variances.",
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Built end-to-end for rural healthcare coordination
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Every module directly supports patient access, clinical handover, or public health logistics.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-teal-300 hover:bg-white transition-all space-y-2.5"
              >
                <div className="w-9 h-9 rounded-lg bg-teal-100/70 text-teal-800 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {cap.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
