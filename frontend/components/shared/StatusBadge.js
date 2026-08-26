import React from "react";
import { Badge } from "@/components/ui/Badge";

export function StatusBadge({ status, className = "" }) {
  const map = {
    // Inventory & Health
    sufficient: { label: "Sufficient Stock", variant: "success" },
    depleting: { label: "Depleting (< 5 Days)", variant: "warning" },
    critical: { label: "Critical (< 3 Days)", variant: "danger" },
    out_of_stock: { label: "Out of Stock", variant: "danger" },

    // Referral
    created: { label: "Referral Created", variant: "default" },
    notified: { label: "Facility Notified", variant: "info" },
    accepted: { label: "Bed Confirmed / Accepted", variant: "info" },
    hospital_reached: { label: "Patient Arrived", variant: "teal" },
    treatment_started: { label: "Treatment Active", variant: "purple" },
    completed: { label: "Completed", variant: "success" },

    // General & Verification
    active: { label: "Active", variant: "success" },
    active_referral: { label: "Active Referral", variant: "teal" },
    verified: { label: "Verified Facility", variant: "success" },
    pending: { label: "Pending Review", variant: "warning" },
    urgent: { label: "Urgent Priority", variant: "danger" },
    high: { label: "High Priority", variant: "warning" },
    normal: { label: "Normal Priority", variant: "default" },
  };

  const config = map[status?.toLowerCase()] || {
    label: status || "Unknown",
    variant: "default",
  };

  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
}
