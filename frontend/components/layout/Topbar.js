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
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { notificationsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function Topbar({
  title = "Healthcare Portal",
  currentRole = "patient",
  onOpenMobileMenu,
  alertCount: propAlertCount,
}) {
  const { user } = useAuth();
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
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs transition-colors">
      {/* Left: Mobile menu toggle + Page Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
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
              JeevanSetu Rural Public Health System
            </span>
            <Badge variant="teal" size="sm" className="hidden sm:inline-flex">
              {ROLE_LABELS[currentRole] || "Verified User"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Right: Theme, Language, Notification badge & Quick Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Theme Toggle */}
        <ThemeToggle />

        <LanguageSelector className="hidden sm:inline-flex" />

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) fetchNotifications();
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors relative"
            aria-label="Notifications"
            aria-expanded={isOpen}
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {alertCount}
              </span>
            )}
          </button>

          {/* Notifications Popover Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
              <div className="px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
                  {alertCount > 0 && (
                    <Badge variant="teal" size="sm">
                      {alertCount} new
                    </Badge>
                  )}
                </div>
                {alertCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading && notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p>Checking for healthcare alerts...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">No new healthcare notifications right now.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors flex items-start justify-between gap-3 text-left ${
                        !n.is_read ? "bg-teal-50/40 dark:bg-teal-950/40" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
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
                          className="p-1 rounded-md text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 shrink-0 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Real-time alerts powered by JeevanSetu
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Facility Connectivity Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>PHC Network Live</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
