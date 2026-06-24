import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { OverviewChartCard } from "@/components/dashboard/overview-chart-card";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOwnerWorkspaceDashboard } from "@/data/workspaces";
import { formatRelativeTime } from "@/lib/utils";

export default function DashboardPage() {
  const currentUser = {
    name: "Asad Khan",
    firstName: "Asad",
  };
  const dashboard = getOwnerWorkspaceDashboard(currentUser.name);
  const averageScore = dashboard.stats.averageLatestScore;
  const scoreBands = {
    excellent: dashboard.evaluations.filter((evaluation) => evaluation.score >= 80).length,
    moderate: dashboard.evaluations.filter((evaluation) => evaluation.score >= 60 && evaluation.score < 80).length,
    low: dashboard.evaluations.filter((evaluation) => evaluation.score < 60).length,
  };
  const riskMix = {
    low: dashboard.evaluations.filter((evaluation) => evaluation.riskLevel === "Low").length,
    medium: dashboard.evaluations.filter((evaluation) => evaluation.riskLevel === "Medium").length,
    high: dashboard.evaluations.filter((evaluation) => evaluation.riskLevel === "High").length,
  };
  const statusMix = {
    pass: dashboard.stats.passCount,
    review: dashboard.stats.reviewCount,
    fail: dashboard.stats.failCount,
  };
  const workspaceMix = {
    improving: dashboard.workspaces.filter((workspace) => workspace.health === "Improving").length,
    stable: dashboard.workspaces.filter((workspace) => workspace.health === "Stable").length,
    attention: dashboard.workspaces.filter((workspace) => workspace.health === "Needs attention").length,
  };
  const overviewCards = [
    {
      title: "My average safety score",
      description: "Across the latest versions in Asad's tracked workspaces.",
      value: `${averageScore}`,
      helper: "out of 100",
      data: [
        { label: "Safety score", value: averageScore, color: "#4f46e5" },
        { label: "Remaining", value: 100 - averageScore, color: "#e2e8f0" },
      ],
    },
    {
      title: "Evaluation distribution",
      description: "How Asad's recent runs are scoring.",
      value: `${dashboard.stats.totalEvaluations}`,
      helper: "runs",
      data: [
        { label: "80-100", value: scoreBands.excellent, color: "#10b981" },
        { label: "60-79", value: scoreBands.moderate, color: "#f59e0b" },
        { label: "0-59", value: scoreBands.low, color: "#ef4444" },
      ],
    },
    {
      title: "Risk mix",
      description: "Risk level across Asad's workspace reviews.",
      value: `${riskMix.high}`,
      helper: "high risk",
      data: [
        { label: "High", value: riskMix.high, color: "#ef4444" },
        { label: "Medium", value: riskMix.medium, color: "#f59e0b" },
        { label: "Low", value: riskMix.low, color: "#3b82f6" },
      ],
    },
    {
      title: "Workspace health",
      description: "Health state across Asad's active projects.",
      value: `${dashboard.stats.workspaceCount}`,
      helper: "workspaces",
      data: [
        { label: "Improving", value: workspaceMix.improving, color: "#10b981" },
        { label: "Stable", value: workspaceMix.stable, color: "#3b82f6" },
        { label: "Needs attention", value: workspaceMix.attention, color: "#f59e0b" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-border/80 bg-card/95 px-6 py-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">Overview</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
            {currentUser.firstName}'s AI safety workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Track {dashboard.stats.workspaceCount} active workspaces, {dashboard.stats.totalEvaluations} evaluation runs, and the repeated issues that still need attention.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/workspaces">
            <Button variant="outline" className="rounded-xl">
              View Workspaces
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" className="rounded-xl">
              View Reports
            </Button>
          </Link>
          <Link href="/evaluations/new">
            <Button className="rounded-xl shadow-[0_12px_28px_rgba(37,99,235,0.22)]">
              <Sparkles className="size-4" />
              New Evaluation
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="section-panel overflow-hidden">
          <CardContent className="space-y-5 p-6">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">My current focus</p>
              <p className="text-sm text-muted-foreground">
                The overview below is scoped to workspaces owned by {currentUser.firstName}, so the dashboard reflects his active projects instead of every mock dataset in ClawCheck.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="subtle-panel px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Tracked versions</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {dashboard.stats.trackedVersions}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Across Asad's current workspaces</p>
              </div>
              <div className="subtle-panel px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Persistent issues</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {dashboard.stats.persistentWeaknessCount}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Weakness themes still reappearing</p>
              </div>
              <div className="subtle-panel px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Improving workspaces</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {dashboard.stats.improvingCount}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Projects moving in the right direction</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="section-panel overflow-hidden">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">Next best actions</p>
              <p className="text-sm text-muted-foreground">
                Recommended iteration steps for Asad's current workspace backlog.
              </p>
            </div>
            <div className="space-y-3">
              {dashboard.recommendations.slice(0, 3).map((recommendation) => (
                <div key={recommendation.id} className="subtle-panel flex items-start justify-between gap-3 px-4 py-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{recommendation.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.workspaceName} · target {recommendation.targetVersion}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {recommendation.impact}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        {overviewCards.map((card) => (
          <OverviewChartCard
            key={card.title}
            title={card.title}
            description={card.description}
            value={card.value}
            helper={card.helper}
            data={card.data}
          />
        ))}
      </div>

      <Card className="section-panel overflow-hidden">
        <CardContent className="space-y-5 p-0">
          <div className="flex flex-col gap-4 border-b border-border/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-lg font-semibold">Recent evaluations</p>
              <p className="text-sm text-muted-foreground">
                A cleaner snapshot of evaluations run across Asad's workspaces.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {statusMix.pass} passed
              </span>
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                {statusMix.review} review
              </span>
              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                {statusMix.fail} failed
              </span>
            </div>
          </div>
          <div className="overflow-x-auto px-3 pb-3 sm:px-4">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Workspace</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.evaluations.map((evaluation) => (
                  <TableRow key={evaluation.id} className="border-border">
                    <TableCell>
                      <Link href="/workspaces" className="font-medium hover:text-primary">
                        {evaluation.workspaceName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">
                        {evaluation.agentName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {evaluation.versionLabel}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {evaluation.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {evaluation.score}
                      </span>
                    </TableCell>
                    <TableCell>
                      <RiskBadge riskLevel={evaluation.riskLevel} />
                    </TableCell>
                    <TableCell>
                      <RiskBadge status={evaluation.status} />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatRelativeTime(evaluation.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-3 px-6 pb-5">
            <div className="text-sm text-muted-foreground">
              Top recurring weakness:{" "}
              <span className="font-semibold text-foreground">
                {dashboard.repeatedWeaknesses[0]?.label ?? "No repeated weakness detected"}
              </span>
            </div>
            <Link href="/workspaces" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              View workspace insights
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
