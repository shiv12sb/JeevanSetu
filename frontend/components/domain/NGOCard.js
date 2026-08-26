import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Phone, CheckCircle2, User } from "lucide-react";

export function NGOCard({ ngo, onContact, className = "" }) {
  if (!ngo) return null;

  return (
    <Card className={`hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-xs transition-all ${className}`}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-100 dark:border-teal-800 uppercase tracking-wider">
                {ngo.focusArea}
              </span>
              {ngo.isVerified && (
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified Aid Partner
                </Badge>
              )}
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {ngo.name}
            </h4>
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Assistance Offered:
          </p>
          <ul className="space-y-1">
            {ngo.services?.map((svc, i) => (
              <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                <span className="text-teal-600 dark:text-teal-400 font-bold leading-none mt-0.5">•</span>
                <span>{svc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact info */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{ngo.contactPerson}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <strong className="text-slate-800 dark:text-slate-200">{ngo.phone}</strong>
            </div>
            <Button
              size="sm"
              variant="subtle"
              className="text-xs h-7"
              onClick={() => onContact && onContact(ngo)}
            >
              Request Support
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NGOCard;
