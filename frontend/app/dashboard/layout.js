"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { USER_ROLES } from "@/lib/constants";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Derive initial role from pathname if applicable
  const getRoleFromPath = () => {
    if (pathname.includes("/phc")) return USER_ROLES.PHC_STAFF;
    if (pathname.includes("/doctor")) return USER_ROLES.DOCTOR;
    if (pathname.includes("/hospital")) return USER_ROLES.HOSPITAL;
    if (pathname.includes("/admin")) return USER_ROLES.ADMIN;
    return USER_ROLES.PATIENT;
  };

  const [currentRole, setCurrentRole] = useState(getRoleFromPath);

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    if (newRole === USER_ROLES.PATIENT) router.push("/dashboard/patient");
    else if (newRole === USER_ROLES.PHC_STAFF) router.push("/dashboard/phc");
    else if (newRole === USER_ROLES.DOCTOR) router.push("/dashboard/doctor");
    else if (newRole === USER_ROLES.HOSPITAL || newRole === USER_ROLES.NGO) router.push("/dashboard/hospital");
    else router.push("/dashboard/admin");
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex flex-col">
        <Sidebar currentRole={currentRole} onRoleChange={handleRoleChange} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              isMobile
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          currentRole={currentRole}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
