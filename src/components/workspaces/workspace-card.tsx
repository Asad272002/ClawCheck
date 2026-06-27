import Link from "next/link";
import { ArrowRight, Layers3, ShieldCheck, Sparkles } from "lucide-react";

import { FutureWorkspaceAction } from "@/components/workspaces/future-workspace-action";
import { WorkspaceSemanticSignal } from "@/components/workspaces/workspace-semantic-signal";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLatestWorkspaceVersion, getWorkspaceSemanticSummary, getWorkspaceSummary } from "@/lib/db/workspaces";
import type { AgentWorkspace } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

type WorkspaceCardProps = {
  workspace: AgentWorkspace;
};

const semanticPriorityToneClasses = {
  high: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  low: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
} as const;

function HealthPill({ health }: { health: AgentWorkspace["health"] }) {
  const classes =
    health === "Improving"
      ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
      : health === "Stable"
        ? "bg-blue-500/12 text-blue-600 dark:text-blue-400"
        : "bg-amber-500/12 text-amber-600 dark:text-amber-400";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>{health}</span>;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const summary = getWorkspaceSummary(workspace);
  const semanticSummary = getWorkspaceSemanticSummary(workspace);
  const latestVersion = getLatestWorkspaceVersion(workspace);
  const latestEvaluation = [...workspace.evaluations].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )[0];

  return (
    <Card className="section-panel h-full overflow-hidden">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <HealthPill health={workspace.health} />
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {workspace.team}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold tracking-tight text-foreground">{workspace.name}</p>
              <p className="text-sm text-muted-foreground">{workspace.purpose}</p>
            </div>
          </div>
          <div className="subtle-panel flex items-center gap-3 px-3 py-2">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Latest version</p>
              <p className="text-sm font-semibold text-foreground">{latestVersion?.label ?? "Not started"}</p>
            </div>
          </div>
        </div>

        <p className="text-sm leading-6 text-muted-foreground">{workspace.description}</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="subtle-panel px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Current score</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{summary.latestScore}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.scoreDelta >= 0 ? "+" : ""}
              {summary.scoreDelta} vs first iteration
            </p>
          </div>
          <div className="subtle-panel px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Evaluation runs</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{summary.totalEvaluations}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Updated {formatRelativeTime(workspace.lastUpdated)}
            </p>
          </div>
          <div className="subtle-panel px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {semanticSummary.semanticReportsCount > 0 ? "Semantic coverage" : "Repeated weaknesses"}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {semanticSummary.semanticReportsCount > 0 ? `${semanticSummary.averageCoverage}%` : workspace.repeatedWeaknesses.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {semanticSummary.semanticReportsCount > 0
                ? `${semanticSummary.partialChecks} partial and ${semanticSummary.missedChecks} missed review points`
                : `${summary.openRecommendations} next actions queued`}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium text-foreground">Prompt coverage</p>
            <p className="text-muted-foreground">{latestVersion?.promptCoverage ?? 0}%</p>
          </div>
          <Progress value={latestVersion?.promptCoverage ?? 0} className="gap-0" />
        </div>

        <div className="flex flex-wrap gap-2">
          {workspace.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/80 bg-background/75 px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">
              {semanticSummary.semanticReportsCount > 0 ? "Semantic summary" : "Latest run"}
            </p>
            {latestEvaluation ? (
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                <span>{latestEvaluation.category}</span>
                <span className="text-border">/</span>
                <RiskBadge status={latestEvaluation.status} />
                <RiskBadge riskLevel={latestEvaluation.riskLevel} />
              </div>
            ) : (
              <p className="text-muted-foreground">No evaluations yet.</p>
            )}
            {semanticSummary.semanticReportsCount > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {semanticSummary.semanticReportsCount} semantic report{semanticSummary.semanticReportsCount === 1 ? "" : "s"}
                  </span>
                  {workspace.semanticAnalytics?.topSuggestionPriority ? (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${semanticPriorityToneClasses[workspace.semanticAnalytics.topSuggestionPriority]}`}
                    >
                      {workspace.semanticAnalytics.topSuggestionPriority} priority
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {semanticSummary.mostCommonMissedCheck
                    ? `Missed most often: ${semanticSummary.mostCommonMissedCheck}.`
                    : "Persisted semantic analytics are available for this workspace."}
                </p>
                {semanticSummary.latestSuggestionLabel ? (
                  <p className="text-sm text-foreground">{semanticSummary.latestSuggestionLabel}</p>
                ) : null}
              </div>
            ) : latestEvaluation ? (
              <div className="mt-2">
                <WorkspaceSemanticSignal evaluation={latestEvaluation} compact />
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <FutureWorkspaceAction
              label="Compare versions"
              description="Version comparison snapshots will let you inspect rubric deltas across iterations."
              className="rounded-xl"
            />
            <Link href={`/workspaces/${workspace.slug}`}>
              <Button className="rounded-xl">
                Open workspace
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="subtle-panel flex flex-wrap items-start justify-between gap-4 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Primary goal</p>
              <p className="text-sm leading-6 text-muted-foreground">{workspace.primaryGoal}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers3 className="size-4" />
            {workspace.versions.length} tracked versions
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
