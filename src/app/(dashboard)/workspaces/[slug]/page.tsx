import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Target, TriangleAlert } from "lucide-react";

import { FutureWorkspaceAction } from "@/components/workspaces/future-workspace-action";
import { WorkspaceEvaluationTable } from "@/components/workspaces/workspace-evaluation-table";
import { WorkspaceTrendChart } from "@/components/workspaces/workspace-trend-chart";
import { WorkspaceVersionList } from "@/components/workspaces/workspace-version-list";
import { WorkspaceWeaknessInsights } from "@/components/workspaces/workspace-weakness-insights";
import { PageHeading } from "@/components/shared/page-heading";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import { getWorkspaceBySlug, getWorkspaceSummary, getWorkspaceTrendData } from "@/data/workspaces";

type WorkspaceDetailPageProps = {
  params: {
    slug: string;
  };
};

function HealthPill({ health }: { health: "Improving" | "Needs attention" | "Stable" }) {
  const classes =
    health === "Improving"
      ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
      : health === "Stable"
        ? "bg-blue-500/12 text-blue-600 dark:text-blue-400"
        : "bg-amber-500/12 text-amber-600 dark:text-amber-400";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>{health}</span>;
}

export default function WorkspaceDetailPage({ params }: WorkspaceDetailPageProps) {
  const workspace = getWorkspaceBySlug(params.slug);

  if (!workspace) {
    notFound();
  }

  const summary = getWorkspaceSummary(workspace);
  const trendData = getWorkspaceTrendData(workspace);
  const latestEvaluation = [...workspace.evaluations].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/workspaces"
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to workspaces
        </Link>
      </div>

      <PageHeading
        eyebrow="Workspace detail"
        title={workspace.name}
        description={workspace.description}
        action={
          <>
            <FutureWorkspaceAction
              label="Plan next iteration"
              description="Iteration planning will connect to saved work items, owners, and sprint workflows."
              className="rounded-xl"
            />
            <Link href="/evaluations/new">
              <Button className="rounded-xl">
                <Sparkles className="size-4" />
                Run evaluation
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="section-panel p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <HealthPill health={workspace.health} />
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {workspace.team}
                </span>
                <span className="rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  Owner: {workspace.owner}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Agent purpose</p>
                <p className="text-lg font-semibold tracking-tight text-foreground">{workspace.purpose}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Primary improvement goal</p>
                <p className="text-sm leading-6 text-muted-foreground">{workspace.primaryGoal}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {workspace.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/80 bg-card/90 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:min-w-64">
              <div className="subtle-panel px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Latest run</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {latestEvaluation?.category ?? "No runs yet"}
                </p>
                {latestEvaluation ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <RiskBadge status={latestEvaluation.status} />
                    <RiskBadge riskLevel={latestEvaluation.riskLevel} />
                  </div>
                ) : null}
              </div>
              <div className="subtle-panel px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Latest score delta</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {summary.scoreDelta >= 0 ? "+" : ""}
                  {summary.scoreDelta}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Compared with the first tracked version</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="surface-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current score</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {summary.latestScore}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-5" />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Current score for the latest tracked workspace iteration.
            </p>
          </div>
          <div className="surface-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tracked versions</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {workspace.versions.length}
                </p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                <Target className="size-5" />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Each version captures score movement, coverage, and focus areas.
            </p>
          </div>
          <div className="surface-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Evaluation runs</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {summary.totalEvaluations}
                </p>
              </div>
              <div className="rounded-2xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
                <ArrowRight className="size-5" />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Historical runs make progress and regressions easier to explain.
            </p>
          </div>
          <div className="surface-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High-risk runs</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {summary.highRiskRuns}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
                <TriangleAlert className="size-5" />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Use repeated weakness analysis to drive this number down over time.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
        <WorkspaceTrendChart data={trendData} />
        <WorkspaceVersionList versions={workspace.versions} />
      </div>

      <WorkspaceEvaluationTable evaluations={workspace.evaluations} versions={workspace.versions} />

      <WorkspaceWeaknessInsights
        repeatedWeaknesses={workspace.repeatedWeaknesses}
        recommendations={workspace.nextRecommendations}
      />
    </div>
  );
}
