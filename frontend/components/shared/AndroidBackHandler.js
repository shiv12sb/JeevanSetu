"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useNavigation } from "@/context/NavigationContext";

export function AndroidBackHandler() {
  const { isDrawerOpen, closeDrawer } = useNavigation();
  const pathname = usePathname();
  const router = useRouter();
  const lastBackPressRef = useRef(0);

  useEffect(() => {
    // 1. Listen for Capacitor native App backButton if @capacitor/app is active
    let removeCapacitorListener = null;

    if (typeof window !== "undefined" && window.Capacitor) {
      try {
        const setupCapacitorBack = async () => {
          const { App } = await import("@capacitor/app").catch(() => ({ App: null }));
          if (App && typeof App.addListener === "function") {
            const listener = await App.addListener("backButton", ({ canGoBack }) => {
              // Priority 1: Close active navigation drawer
              if (isDrawerOpen) {
                closeDrawer();
                return;
              }

              // Priority 2: Check for open modal/dialogs with [data-modal="true"] or role="dialog"
              const openDialog = document.querySelector('[role="dialog"], [data-modal="true"]');
              if (openDialog) {
                const closeBtn = openDialog.querySelector('[aria-label="Close"], [data-close="true"], button.close');
                if (closeBtn) {
                  closeBtn.click();
                  return;
                }
              }

              // Priority 3: Navigate backwards in app history
              if (pathname !== "/" && canGoBack) {
                router.back();
                return;
              }

              // Priority 4: At home screen, require double back within 2s to exit
              const now = Date.now();
              if (now - lastBackPressRef.current < 2000) {
                App.exitApp();
              } else {
                lastBackPressRef.current = now;
                // Show brief subtle toast if possible
                const toast = document.createElement("div");
                toast.innerText = "बाहेर पडण्यासाठी पुन्हा एकदा मागे दाबा (Press Back again to exit)";
                toast.className = "fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-full z-50 shadow-lg pointer-events-none transition-opacity duration-300";
                document.body.appendChild(toast);
                setTimeout(() => {
                  toast.style.opacity = "0";
                  setTimeout(() => toast.remove(), 300);
                }, 1700);
              }
            });
            removeCapacitorListener = () => listener.remove();
          }
        };
        setupCapacitorBack();
      } catch (err) {
        console.debug("Capacitor BackButton handler init notice:", err);
      }
    }

    // 2. Browser history popstate handler for drawer
    const handlePopState = (e) => {
      if (isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      if (removeCapacitorListener) removeCapacitorListener();
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDrawerOpen, closeDrawer, pathname, router]);

  return null;
}

export default AndroidBackHandler;
