import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MapPin, Phone, CheckCircle2, Bed, ArrowUpRight } from "lucide-react";

export function HospitalCard({ hospital, onSelect, className = "" }) {
  if (!hospital) return null;

  return (
    <Card className={`hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-xs transition-all ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-100 dark:border-teal-800">
                {hospital.type}
              </span>
              {hospital.isVerified && (
                <Badge variant="success" size="sm" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Facility
                </Badge>
              )}
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug pt-1">
              {hospital.name}
            </h4>
          </div>

          {hospital.distanceKm !== undefined && (
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                {hospital.distanceKm} km away
              </span>
            </div>
          )}
        </div>

        {/* Location & Contact */}
        <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{hospital.address}</span>
          </div>
          <div className="flex items-center gap-4 pt-0.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{hospital.phone}</span>
            </div>
            {hospital.bedAvailability && (
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                <Bed className="w-3.5 h-3.5" />
                <span>{hospital.bedAvailability.available} General / {hospital.bedAvailability.icuAvailable} ICU Beds</span>
              </div>
            )}
          </div>
        </div>

        {/* Specialties and Facilities Chips */}
        {hospital.specialties && hospital.specialties.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
            {hospital.specialties.slice(0, 4).map((spec) => (
              <span
                key={spec}
                className="text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700"
              >
                {spec}
              </span>
            ))}
            {hospital.specialties.length > 4 && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 self-center px-1">
                +{hospital.specialties.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Card Footer Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Emergency: <strong className="text-slate-800 dark:text-slate-200">{hospital.emergencyHelpline}</strong>
          </span>
          <Button
            size="sm"
            variant="subtle"
            className="text-xs h-8 gap-1"
            onClick={() => onSelect && onSelect(hospital)}
          >
            <span>View Details & Schemes</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
