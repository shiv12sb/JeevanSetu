import React from "react";
import Link from "next/link";
import { Heart, PhoneCall, ShieldCheck, AlertCircle, Info, ExternalLink } from "lucide-react";

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
            <a href="tel:108" className="hover:underline">National Emergency: 108</a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1 lg:col-span-1">
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

          {/* Official Government Health Portals */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider text-teal-400">
              Official Govt Portals
            </h5>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://pmjay.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-300 transition-colors flex items-center gap-1"
                >
                  <span>PM-JAY Ayushman Bharat</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://abha.abdm.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-300 transition-colors flex items-center gap-1"
                >
                  <span>ABHA Card (ABDM Portal)</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://esanjeevani.mohfw.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-300 transition-colors flex items-center gap-1"
                >
                  <span>eSanjeevani Teleconsultation</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://notto.mohfw.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-300 transition-colors flex items-center gap-1"
                >
                  <span>NOTTO Organ Registry</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://eraktkosh.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-300 transition-colors flex items-center gap-1"
                >
                  <span>e-RaktKosh Blood Portal</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.jeevandayee.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-300 transition-colors flex items-center gap-1"
                >
                  <span>MJPJAY Maharashtra</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://mohfw.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-300 transition-colors flex items-center gap-1"
                >
                  <span>MoHFW Central Portal</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                </a>
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
                <a href="tel:108" className="text-rose-400 hover:text-rose-300 font-bold font-mono">108</a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Maternal (JSSK):</span>
                <a href="tel:102" className="text-teal-400 hover:text-teal-300 font-bold font-mono">102</a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">National Health Helpline:</span>
                <a href="tel:104" className="text-teal-400 hover:text-teal-300 font-bold font-mono">104</a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Ayushman PM-JAY:</span>
                <a href="tel:14555" className="text-amber-300 hover:text-amber-200 font-bold font-mono">14555</a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Organ Donation:</span>
                <a href="tel:1800114477" className="text-teal-300 hover:text-teal-200 font-bold font-mono">1800-11-4477</a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Tele-MANAS (Mental):</span>
                <a href="tel:14416" className="text-white hover:text-teal-300 font-bold font-mono">14416</a>
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

export default Footer;

