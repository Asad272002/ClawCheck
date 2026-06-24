"use client";

import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EvaluationStatus, RiskLevel } from "@/lib/types";

type RiskBadgeProps = {
  riskLevel?: RiskLevel;
  status?: EvaluationStatus;
  className?: string;
};

export function RiskBadge({ riskLevel, status, className }: RiskBadgeProps) {
  if (status) {
    return (
      <Badge
        className={cn(
          "rounded-full px-2.5 py-0.5",
          status === "Pass" && "bg-emerald-500/12 text-emerald-600 hover:bg-emerald-500/12 dark:text-emerald-400",
          status === "Review" && "bg-amber-500/12 text-amber-600 hover:bg-amber-500/12 dark:text-amber-400",
          status === "Fail" && "bg-red-500/12 text-red-600 hover:bg-red-500/12 dark:text-red-400",
          className
        )}
      >
        {status === "Pass" ? <CheckCircle2 /> : status === "Review" ? <AlertTriangle /> : <ShieldAlert />}
        {status}
      </Badge>
    );
  }

  if (!riskLevel) {
    return null;
  }

  return (
    <Badge
      className={cn(
        "rounded-full px-2.5 py-0.5",
        riskLevel === "Low" && "bg-emerald-500/12 text-emerald-600 hover:bg-emerald-500/12 dark:text-emerald-400",
        riskLevel === "Medium" && "bg-amber-500/12 text-amber-600 hover:bg-amber-500/12 dark:text-amber-400",
        riskLevel === "High" && "bg-red-500/12 text-red-600 hover:bg-red-500/12 dark:text-red-400",
        className
      )}
    >
      {riskLevel === "Low" ? <CheckCircle2 /> : riskLevel === "Medium" ? <AlertTriangle /> : <ShieldAlert />}
      {riskLevel} risk
    </Badge>
  );
}
