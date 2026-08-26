import React from "react";
import { TableRow, TableCell } from "@/components/ui/Table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export function MedicineStockRow({ item, onRestockRequest }) {
  if (!item) return null;

  return (
    <TableRow>
      <TableCell>
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block">{item.name}</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{item.category}</span>
        </div>
      </TableCell>

      <TableCell>
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {item.currentStock.toLocaleString()} {item.unit}
        </span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
          Min threshold: {item.minimumThreshold}
        </span>
      </TableCell>

      <TableCell>
        <span className="text-slate-700 dark:text-slate-300">~{item.averageDailyUsage} / day</span>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-1.5">
          {item.daysOfSupplyLeft <= 3 && (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          )}
          <span
            className={`font-bold ${
              item.daysOfSupplyLeft <= 3
                ? "text-rose-600 dark:text-rose-400"
                : item.daysOfSupplyLeft <= 5
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {item.daysOfSupplyLeft > 0 ? `${item.daysOfSupplyLeft} days` : "Depleted"}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <StatusBadge status={item.status} />
      </TableCell>

      <TableCell>
        <Button
          size="sm"
          variant={item.daysOfSupplyLeft <= 5 ? "danger" : "outline"}
          className="text-xs h-7 gap-1"
          onClick={() => onRestockRequest && onRestockRequest(item)}
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reorder</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default MedicineStockRow;
