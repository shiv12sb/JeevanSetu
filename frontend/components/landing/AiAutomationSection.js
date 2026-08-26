import React from "react";
import { Sparkles, ShieldAlert, Cpu, Bell, CheckCircle2, Lock } from "lucide-react";

export function AiAutomationSection() {
  const points = [
    {
      title: "Grounded Context Retrieval",
      desc: "AI models never hallucinate hospital names or government aid numbers. Recommendations are strictly retrieved from verified registry records via secure backend filtering.",
    },
    {
      title: "Structured Outputs & Validation",
      desc: "All AI responses are schema-validated with explicit confidence scores, matched reasons, and actionable next steps before display.",
    },
    {
      title: "Deterministic Stock Prediction",
      desc: "Medicine depletion warnings start with deterministic formula (Current Stock ÷ Average Daily Usage) to guarantee 100% transparency without black-box bias.",
    },
    {
      title: "Automated Escalation Workflows",
      desc: "Integrated background notifications (SMS, WhatsApp, and n8n webhooks) trigger alerts for low stock thresholds and pending referral acknowledgments.",
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-3 py-1 rounded-full border border-sky-200">
            Responsible AI & Automation
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How JeevanSetu uses AI with strict safety guardrails
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            AI is deployed as a coordination assistant, never as an ungrounded medical diagnostic authority.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {points.map((pt, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4 hover:border-teal-300 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">{pt.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{pt.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
