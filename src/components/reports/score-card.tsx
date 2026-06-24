import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ScoreCardProps = {
  label: string;
  value: string;
  helper: string;
  trend?: "up" | "down" | "neutral";
};

export function ScoreCard({ label, value, helper, trend = "neutral" }: ScoreCardProps) {
  return (
    <Card className="glass-panel relative border-border bg-card/88">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <CardContent className="space-y-4 py-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {trend === "neutral" ? null : trend === "up" ? <ArrowUpRight className="size-4 text-primary" /> : <ArrowDownRight className="size-4 text-destructive" />}
        </div>
        <div className="space-y-1">
          <p className="text-4xl font-semibold tracking-tight">{value}</p>
          <p className={cn("text-sm", trend === "up" ? "text-primary" : trend === "down" ? "text-destructive" : "text-muted-foreground")}>{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}
