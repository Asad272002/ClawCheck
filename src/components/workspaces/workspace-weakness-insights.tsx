import { ArrowUpRight, AlertTriangle, ShieldAlert, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import { FutureWorkspaceAction } from "@/components/workspaces/future-workspace-action";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { WorkspaceRecommendation, WorkspaceWeaknessInsight } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

type WorkspaceWeaknessInsightsProps = {
  repeatedWeaknesses: WorkspaceWeaknessInsight[];
  recommendations: WorkspaceRecommendation[];
};

function WeaknessTrendIcon({ trend }: { trend: WorkspaceWeaknessInsight["trend"] }) {
  if (trend === "Improving") {
    return <TrendingUp className="size-4 text-emerald-500" />;
  }

  if (trend === "Worsening") {
    return <TrendingDown className="size-4 text-red-500" />;
  }

  return <AlertTriangle className="size-4 text-amber-500" />;
}

function RecommendationImpactPill({ impact }: { impact: WorkspaceRecommendation["impact"] }) {
  const classes =
    impact === "High"
      ? "bg-red-500/10 text-red-600 dark:text-red-400"
      : impact === "Medium"
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>{impact} impact</span>;
}

export function WorkspaceWeaknessInsights({
  repeatedWeaknesses,
  recommendations,
}: WorkspaceWeaknessInsightsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="section-panel h-full">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">Repeated weaknesses</p>
            <p className="text-sm text-muted-foreground">
              Track which gaps keep resurfacing so the next version can target them directly.
            </p>
          </div>
          <div className="space-y-3">
            {repeatedWeaknesses.map((weakness) => (
              <div key={weakness.label} className="subtle-panel flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{weakness.label}</p>
                    <RiskBadge riskLevel={weakness.severity} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Seen {weakness.count} times, last flagged {formatRelativeTime(weakness.lastSeen)}.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-sm text-muted-foreground">
                  <WeaknessTrendIcon trend={weakness.trend} />
                  {weakness.trend}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="section-panel h-full">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">Recommended next actions</p>
            <p className="text-sm text-muted-foreground">
              A concise plan for the next iteration based on recent evaluation history.
            </p>
          </div>
          <div className="space-y-3">
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className="subtle-panel space-y-3 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                      <Sparkles className="size-4" />
                    </div>
                    <p className="font-medium text-foreground">{recommendation.title}</p>
                  </div>
                  <RecommendationImpactPill impact={recommendation.impact} />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{recommendation.description}</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldAlert className="size-4" />
                    Target version: {recommendation.targetVersion}
                  </div>
                  <FutureWorkspaceAction
                    label="Queue action"
                    description="Workspace action queues will connect to future planning and execution tooling."
                    size="sm"
                    className="rounded-xl"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="subtle-panel flex items-start gap-3 px-4 py-4">
            <ArrowUpRight className="mt-0.5 size-4 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Next iteration principle</p>
              <p className="text-sm text-muted-foreground">
                Prefer focused prompt sets that target one repeated weakness at a time. It makes score movement easier to trust.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
