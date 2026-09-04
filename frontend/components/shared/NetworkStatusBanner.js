"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw, PhoneCall, ShieldAlert, X, ChevronRight } from "lucide-react";
import { getOfflineEmergencyData } from "@/lib/offlineStorage";

export function NetworkStatusBanner() {
  const [networkState, setNetworkState] = useState("ONLINE"); // 'ONLINE' | 'OFFLINE' | 'RECONNECTING'
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [cachedData, setCachedData] = useState(null);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setNetworkState("ONLINE");
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 3000);
    };

    const handleOffline = () => {
      setNetworkState("OFFLINE");
      setJustReconnected(false);
      // Load offline emergency cache immediately
      const data = getOfflineEmergencyData();
      setCachedData(data);
    };

    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setNetworkState("RECONNECTING");
    setTimeout(() => {
      if (typeof navigator !== "undefined" && navigator.onLine) {
        setNetworkState("ONLINE");
        setJustReconnected(true);
        setTimeout(() => setJustReconnected(false), 3000);
      } else {
        setNetworkState("OFFLINE");
      }
    }, 1200);
  };

  // If online and not just reconnected, render nothing
  if (networkState === "ONLINE" && !justReconnected && !showOfflineModal) {
    return null;
  }

  return (
    <>
      {/* 1. Reconnected Success Toast */}
      {justReconnected && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-emerald-600/95 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top duration-300 border border-emerald-400/40"
        >
          <Wifi className="w-4 h-4 shrink-0 text-white" />
          <span>ऑनलाइन जोडले (Back Online)</span>
        </aside>
      )}

      {/* 2. Offline Warning Banner (Requirement 16) */}
      {networkState !== "ONLINE" && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-0 left-0 right-0 z-50 bg-amber-600/95 dark:bg-amber-700/95 backdrop-blur-md text-white px-3 py-2 sm:py-2.5 shadow-xl border-b border-amber-400/40 transition-all"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 min-w-0">
              <WifiOff className="w-4 h-4 shrink-0 text-amber-200 animate-pulse" />
              <div className="text-left leading-tight">
                <span className="text-xs font-bold block">
                  इंटरनेट कनेक्शन उपलब्ध नाही. कृपया पुन्हा प्रयत्न करा.
                </span>
                <span className="text-[10px] text-amber-100 hidden xs:inline">
                  No Internet Connection. Offline emergency cache is active.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => {
                  if (!cachedData) setCachedData(getOfflineEmergencyData());
                  setShowOfflineModal(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-colors cursor-pointer border border-white/20 flex items-center gap-1"
              >
                <PhoneCall className="w-3 h-3" />
                <span>आपत्कालीन सेवा (108)</span>
              </button>

              <button
                type="button"
                onClick={handleRetry}
                disabled={networkState === "RECONNECTING"}
                className="px-2.5 py-1 rounded-lg bg-white text-amber-900 hover:bg-amber-50 text-[11px] font-black transition-colors cursor-pointer shadow-xs flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${networkState === "RECONNECTING" ? "animate-spin" : ""}`} />
                <span>{networkState === "RECONNECTING" ? "तपासत आहे..." : "पुन्हा प्रयत्न करा"}</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 3. Offline Emergency Cache Modal */}
      {showOfflineModal && cachedData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-xl max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-left">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-500/10">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    ऑफलाइन आपत्कालीन हेल्पलाइन (Offline Emergency Care)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    इंटरनेट नसतानाही थेट फोन कॉल करा (Direct phone dialing works without internet)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOfflineModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Offline Hotlines */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                महत्त्वाचे आपत्कालीन क्रमांक (Emergency Numbers)
              </div>
              <div className="grid grid-cols-1 gap-2">
                {cachedData.hotlines?.map((item) => (
                  <a
                    key={item.code}
                    href={item.action}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-teal-500 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-sm border border-rose-500/30">
                        {item.code}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 text-xs font-bold group-hover:translate-x-0.5 transition-transform">
                      <PhoneCall className="w-4 h-4" />
                      <span>कॉल करा</span>
                    </div>
                  </a>
                ))}
              </div>

              {/* First-Aid Quick Guide */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  प्रथमोपचार मार्गदर्शक (Offline First Aid Protocols)
                </div>
                {cachedData.firstAidProtocols?.map((proto) => (
                  <div
                    key={proto.id}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 mb-2"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                      {proto.title}
                    </div>
                    <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 list-disc pl-4">
                      {proto.doList?.slice(0, 2).map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowOfflineModal(false)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl"
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NetworkStatusBanner;
