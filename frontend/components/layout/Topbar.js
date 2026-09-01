"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Search,
  Menu,
  ShieldCheck,
  HeartPulse,
  CheckCircle2,
  Check,
  GitPullRequest,
  Package,
  AlertCircle,
  Clock,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS } from "@/lib/constants";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { LocationSelector } from "@/components/shared/LocationSelector";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { notificationsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export function Topbar({
  title = "Healthcare Portal",
  currentRole = "patient",
  onOpenMobileMenu,
  alertCount: propAlertCount,
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(propAlertCount !== undefined ? propAlertCount : 0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsApi.list({ limit: 10 });
      if (res && res.data) {
        setNotifications(res.data);
        const unread = res.data.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      console.warn("Could not fetch notifications:", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Supabase Realtime subscription for instant notification alerts
    const profileId = user?.profileId || user?.id;
    const unsubscribe = notificationsApi.subscribe(profileId, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("Failed to mark all notifications read:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "referral_update":
        return <GitPullRequest className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />;
      case "medicine_stock_alert":
        return <Package className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
    }
  };

  const alertCount = unreadCount;

  return (
    <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-lg shadow-slate-200/30 dark:shadow-black/20 transition-colors">
      {/* Left: Mobile menu toggle + Page Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white md:hidden transition-colors"
            aria-label="Open Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              {t("govtVerifiedStrip", "JeevanSetu Rural Public Health System")}
            </span>
            <Badge variant="teal" size="sm" className="hidden sm:inline-flex font-bold">
              {t(`role_${currentRole}`, ROLE_LABELS[currentRole] || "Verified User")}
            </Badge>
          </div>
        </div>
      </div>

      {/* Right: Location, Language, Theme, Notification badge & Quick Status */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Live Location / District Selector */}
        <LocationSelector className="inline-flex" />

        {/* Language Selector */}
        <LanguageSelector className="inline-flex" />

        {/* Global Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) fetchNotifications();
            }}
            className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all relative cursor-pointer"
            aria-label="Notifications"
            aria-expanded={isOpen}
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-950 animate-pulse shadow-md shadow-rose-500/50">
                {alertCount}
              </span>
            )}
          </button>

          {/* Notifications Popover Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-slate-900/10 dark:shadow-black/80 border border-slate-200/90 dark:border-white/15 py-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
              <div className="px-4 pb-3 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 dark:text-white">Notifications</span>
                  {alertCount > 0 && (
                    <Badge variant="teal" size="sm" className="font-bold">
                      {alertCount} new
                    </Badge>
                  )}
                </div>
                {alertCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-teal-600 dark:text-teal-300 hover:text-teal-700 dark:hover:text-teal-200 font-bold hover:underline cursor-pointer transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                {isLoading ? (
                  <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                    <p className="text-[11px]">No active notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors flex items-start justify-between gap-3 text-left ${
                        !n.is_read ? "bg-teal-500/5 dark:bg-teal-500/10 border-l-2 border-teal-500" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                          </p>
                        </div>
                      </div>

                      {!n.is_read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          title="Mark as read"
                          className="p-1.5 rounded-lg text-teal-600 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-500/20 shrink-0 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 pt-3 border-t border-slate-200/80 dark:border-white/10 text-center">
                <span className="text-[11px] text-slate-500 font-medium">
                  Real-time alerts powered by JeevanSetu
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Facility Connectivity Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-300 font-bold backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span>PHC Network Live</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
