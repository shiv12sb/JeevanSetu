import React from "react";
import Link from "next/link";
import { Heart, PhoneCall, ShieldCheck, AlertCircle, Info } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      {/* Safety Notice Strip */}
      <div className="bg-slate-950/80 border-b border-slate-800 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              <strong>Healthcare Coordination Principle:</strong> JeevanSetu connects rural patients to verified resources. It is not a diagnostic tool or substitute for medical professionals.
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400 shrink-0 font-semibold">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>National Emergency: 108</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="JeevanSetu Logo"
                className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-slate-700"
              />
              <span className="text-base font-bold text-white tracking-tight">
                Jeevan<span className="text-teal-400">Setu</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-powered rural healthcare access, assistance, referral coordination, and PHC service-monitoring platform.
            </p>
            <p className="text-[11px] text-slate-500">
              Designed for rural, tribal, and underserved healthcare networks across India.
            </p>
          </div>

          {/* Patient Portals */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Patient Services
            </h5>
            <ul className="space-y-1.5">
              <li>
                <Link href="/dashboard/patient" className="hover:text-teal-300 transition-colors">
                  Patient Health Case & Dashboard
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-teal-300 transition-colors">
                  Find Verified Hospitals & Clinics
                </Link>
              </li>
              <li>
                <Link href="/referrals" className="hover:text-teal-300 transition-colors">
                  Track Referral Timeline
                </Link>
              </li>
              <li>
                <Link href="/organ-donation" className="hover:text-teal-300 transition-colors">
                  Organ & Tissue Donation Information
                </Link>
              </li>
              <li>
                <Link href="/health-awareness" className="hover:text-teal-300 transition-colors">
                  Health Awareness & Preventive Care
                </Link>
              </li>
              <li>
                <Link href="/call-assistance" className="hover:text-teal-300 transition-colors">
                  Voice / IVR Call Assistance Guide
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:text-teal-300 transition-colors">
                  Share Service Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Facility & Health Administration */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              PHC & Administration
            </h5>
            <ul className="space-y-1.5">
              <li>
                <Link href="/dashboard/phc" className="hover:text-teal-300 transition-colors">
                  PHC Staff Portal & Daily Log
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="hover:text-teal-300 transition-colors">
                  Medicine Inventory & Stock Prediction
                </Link>
              </li>
              <li>
                <Link href="/dashboard/doctor" className="hover:text-teal-300 transition-colors">
                  Doctor Check-In & Case Queue
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-teal-300 transition-colors">
                  District Health Admin Control Center
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-teal-300 transition-colors">
                  Service Anomaly Flags & Review
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Emergency */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Emergency & Helplines
            </h5>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">National Ambulance:</span>
                <strong className="text-white font-bold">108</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">National Health Helpline:</span>
                <strong className="text-white font-bold">104</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Women Helpline:</span>
                <strong className="text-white font-bold">1091</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Tele-MANAS (Mental Health):</span>
                <strong className="text-white font-bold">14416</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 JeevanSetu Healthcare Platform. Public Health & Digital India Initiative.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Rural Access Focused</span>
            <span>•</span>
            <span className="text-slate-400">Zero Commercial Ads</span>
            <span>•</span>
            <span className="text-slate-400">Open Public Health Stack</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
