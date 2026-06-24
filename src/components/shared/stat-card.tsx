import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  trend?: "up" | "down" | "neutral";
};

export function StatCard({ label, value, helper, trend = "neutral" }: StatCardProps) {
  return (
    <Card className="surface-card h-full overflow-hidden">
      <CardContent className="relative space-y-4 py-6">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {trend === "neutral" ? null : trend === "up" ? (
            <ArrowUpRight className="size-4 text-primary" />
          ) : (
            <ArrowDownRight className="size-4 text-destructive" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-4xl font-semibold tracking-tight">{value}</p>
          <p
            className={cn(
              "text-sm",
              trend === "up"
                ? "text-primary"
                : trend === "down"
                  ? "text-destructive"
                  : "text-muted-foreground"
            )}
          >
            {helper}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
