import Link from "next/link";
import { ArrowRight, FolderKanban, GitBranch, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";

import { WorkspaceCard } from "@/components/workspaces/workspace-card";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import {
  fetchWorkspaces,
  getGlobalWeaknesses,
  getUpcomingRecommendations,
  getWorkspaceSemanticOverview,
  getWorkspaceOverviewStats,
} from "@/lib/db/workspaces";

export default async function WorkspacesPage() {
  const workspaces = await fetchWorkspaces();
  const overviewStats = getWorkspaceOverviewStats(workspaces);
  const semanticOverview = getWorkspaceSemanticOverview(workspaces);
  const weaknessHotspots = getGlobalWeaknesses(workspaces).slice(0, 4);
  const upcomingRecommendations = getUpcomingRecommendations(workspaces).slice(0, 4);

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Workspaces"
        title="Track AI agents across iterations"
        description="Group evaluation history by agent or project, compare version progress, spot repeated weaknesses, and plan the next improvement cycle without breaking the current review flow."
        action={
          <>
            <Link href="/workspaces/new">
              <Button variant="outline" className="rounded-xl">
                Create workspace
              </Button>
            </Link>
            <Link href="/evaluations/new">
              <Button className="rounded-xl">
                <Sparkles className="size-4" />
                Start evaluation
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <div className="surface-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tracked workspaces</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {overviewStats.workspaceCount}
              </p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
              <FolderKanban className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Separate AI projects by agent purpose, risk area, and ownership.
          </p>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tracked versions</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {overviewStats.trackedVersions}
              </p>
            </div>
            <div className="rounded-2xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
              <GitBranch className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Follow how each release changes safety score and prompt coverage.
          </p>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average latest score</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {overviewStats.averageLatestScore}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Snapshot of current quality across the latest version in every workspace.
          </p>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">High-risk runs</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {overviewStats.highRiskRuns}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
              <TriangleAlert className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Use workspace-level tracking to reduce repeat high-risk failures over time.
          </p>
        </div>
      </div>

      {semanticOverview.analyticsWorkspaceCount > 0 ? (
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="section-panel p-6">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">Workspace semantic overview</p>
              <p className="text-sm text-muted-foreground">
                Persisted semantic analytics are available for {semanticOverview.analyticsWorkspaceCount} workspace
                {semanticOverview.analyticsWorkspaceCount === 1 ? "" : "s"}.
              </p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="subtle-panel px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Semantic reports reviewed</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {semanticOverview.semanticReportCount}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Saved semantic-linked workspace reports.</p>
              </div>
              <div className="subtle-panel px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Average semantic coverage</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {semanticOverview.averageCoverage}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {semanticOverview.totalPartialChecks} partial and {semanticOverview.totalMissedChecks} missed review points.
                </p>
              </div>
              <div className="subtle-panel px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Top missed review point</p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                  {semanticOverview.topMissedCheck ?? "No repeated gap yet"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {semanticOverview.topPartialCheck
                    ? `Weakest partial point: ${semanticOverview.topPartialCheck}`
                    : "Partial review points will appear here once they repeat."}
                </p>
              </div>
            </div>
          </div>

          <div className="section-panel p-6">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">Repeated semantic themes</p>
              <p className="text-sm text-muted-foreground">
                Compact cross-workspace signals you can use before opening the full report detail.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {semanticOverview.repeatedThemes.slice(0, 6).map((theme) => (
                <span
                  key={`${theme.status}-${theme.label}`}
                  className="rounded-full border border-border/80 bg-background/75 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  {theme.label} - {theme.count} {theme.status}
                </span>
              ))}
            </div>
            {semanticOverview.topSuggestionTitle ? (
              <div className="mt-4 rounded-2xl border border-border/70 bg-background/75 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Top next semantic action</p>
                <p className="mt-2 text-sm font-medium text-foreground">{semanticOverview.topSuggestionTitle}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {workspaces.map((workspace) => (
          <WorkspaceCard key={workspace.id} workspace={workspace} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="section-panel p-6">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">Common weakness hotspots</p>
            <p className="text-sm text-muted-foreground">
              Repeated themes that keep appearing across active workspace reviews.
            </p>
          </div>
          <div className="mt-5 space-y-3">
            {weaknessHotspots.map((weakness) => (
              <Link
                key={`${weakness.workspaceSlug}-${weakness.label}`}
                href={`/workspaces/${weakness.workspaceSlug}`}
                className="subtle-panel flex items-center justify-between gap-4 px-4 py-4 transition hover:border-primary/20 hover:bg-accent"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{weakness.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {weakness.workspaceName} · seen {weakness.count} times
                  </p>
                </div>
                <div className="rounded-full bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  {weakness.trend}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="section-panel p-6">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">Upcoming iteration queue</p>
            <p className="text-sm text-muted-foreground">
              Recommended next actions users can take before running the next evaluation round.
            </p>
          </div>
          <div className="mt-5 space-y-3">
            {upcomingRecommendations.map((recommendation) => (
              <div
                key={`${recommendation.workspaceSlug}-${recommendation.id}`}
                className="subtle-panel space-y-3 px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{recommendation.title}</p>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {recommendation.impact} impact
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{recommendation.description}</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/workspaces/${recommendation.workspaceSlug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >
                    Open {recommendation.workspaceName}
                    <ArrowRight className="size-4" />
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    Target: {recommendation.targetVersion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
