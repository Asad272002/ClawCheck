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
    <Card className="glass-panel border-white/10 bg-card/80">
      <CardContent className="space-y-3 py-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {trend === "neutral" ? null : trend === "up" ? <ArrowUpRight className="size-4 text-accent" /> : <ArrowDownRight className="size-4 text-destructive" />}
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <p className={cn("text-sm", trend === "up" ? "text-accent" : trend === "down" ? "text-destructive" : "text-muted-foreground")}>{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}
