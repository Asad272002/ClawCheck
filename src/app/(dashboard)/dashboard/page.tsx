import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { OverviewChartCard } from "@/components/dashboard/overview-chart-card";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireCurrentUser } from "@/lib/auth/user";
import { getReports } from "@/lib/db/reports";
import { fetchWorkspaces, getAccessibleWorkspaceDashboard } from "@/lib/db/workspaces";
import { formatRelativeTime } from "@/lib/utils";

export default async function DashboardPage() {
  const currentUser = await requireCurrentUser();
  const [workspaces, reports] = await Promise.all([fetchWorkspaces(), getReports()]);
  const dashboard = getAccessibleWorkspaceDashboard(workspaces);
  const firstName = currentUser.name.split(" ")[0] || currentUser.name;
  const workspacesById = new Map(workspaces.map((workspace) => [workspace.id, workspace]));
  const dashboardEvaluationIds = new Set(dashboard.evaluations.map((evaluation) => evaluation.id));
  const linkedReportEvaluations = reports
    .filter((report) => report.workspaceId)
    .filter((report) => !dashboardEvaluationIds.has(report.id))
    .map((report) => {
      const workspace = workspacesById.get(report.workspaceId!);

      if (!workspace) {
        return null;
      }

      return {
        id: report.id,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        agentName: report.agentName,
        versionId: `generated-report:${report.id}`,
        versionLabel: "Generated report",
        createdAt: report.createdAt,
        category: report.category,
        score: report.finalScore,
        riskLevel: report.riskLevel,
        status: report.status,
        summary: report.summary,
        weaknesses: report.weaknesses,
        improvements: report.recommendations,
      };
    })
    .filter((evaluation): evaluation is NonNullable<typeof evaluation> => Boolean(evaluation));
  const combinedEvaluations = [...dashboard.evaluations, ...linkedReportEvaluations].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
  const averageScore =
    combinedEvaluations.length > 0
      ? Math.round(combinedEvaluations.reduce((total, evaluation) => total + evaluation.score, 0) / combinedEvaluations.length)
      : dashboard.stats.averageLatestScore;
  const scoreBands = {
    excellent: combinedEvaluations.filter((evaluation) => evaluation.score >= 80).length,
    moderate: combinedEvaluations.filter((evaluation) => evaluation.score >= 60 && evaluation.score < 80).length,
    low: combinedEvaluations.filter((evaluation) => evaluation.score < 60).length,
  };
  const riskMix = {
    low: combinedEvaluations.filter((evaluation) => evaluation.riskLevel === "Low").length,
    medium: combinedEvaluations.filter((evaluation) => evaluation.riskLevel === "Medium").length,
    high: combinedEvaluations.filter((evaluation) => evaluation.riskLevel === "High").length,
  };
  const statusMix = {
    pass: combinedEvaluations.filter((evaluation) => evaluation.status === "Pass").length,
    review: combinedEvaluations.filter((evaluation) => evaluation.status === "Review").length,
    fail: combinedEvaluations.filter((evaluation) => evaluation.status === "Fail").length,
  };
  const workspaceMix = {
    improving: dashboard.workspaces.filter((workspace) => workspace.health === "Improving").length,
    stable: dashboard.workspaces.filter((workspace) => workspace.health === "Stable").length,
    attention: dashboard.workspaces.filter((workspace) => workspace.health === "Needs attention").length,
  };
  const reportAverageScore =
    reports.length > 0 ? Math.round(reports.reduce((total, report) => total + report.finalScore, 0) / reports.length) : 0;
  const recentReports = reports.slice(0, 5);

  if (dashboard.workspaces.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-border/80 bg-card/95 px-6 py-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">Overview</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
              {`${firstName}'s evaluation workspace`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {reports.length > 0
                ? `You have ${reports.length} generated report${reports.length === 1 ? "" : "s"} already. Create a workspace when you're ready to group them into tracked projects.`
                : "Start with a guided evaluation or create a workspace to begin tracking agents across versions."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/workspaces/new">
              <Button variant="outline" className="rounded-xl">
                Create Workspace
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

        {reports.length > 0 ? (
          <>
            <div className="grid gap-4 lg:grid-cols-4">
              <Card className="section-panel">
                <CardContent className="space-y-2 p-6">
                  <p className="text-sm font-medium text-muted-foreground">Generated reports</p>
                  <p className="text-3xl font-semibold tracking-tight text-foreground">{reports.length}</p>
                  <p className="text-sm text-muted-foreground">Saved to your personal report library.</p>
                </CardContent>
              </Card>
              <Card className="section-panel">
                <CardContent className="space-y-2 p-6">
                  <p className="text-sm font-medium text-muted-foreground">Average score</p>
                  <p className="text-3xl font-semibold tracking-tight text-foreground">{reportAverageScore}</p>
                  <p className="text-sm text-muted-foreground">Across your recent generated evaluations.</p>
                </CardContent>
              </Card>
              <Card className="section-panel">
                <CardContent className="space-y-2 p-6">
                  <p className="text-sm font-medium text-muted-foreground">High-risk reports</p>
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {reports.filter((report) => report.riskLevel === "High").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Runs that likely need another review pass.</p>
                </CardContent>
              </Card>
              <Card className="section-panel">
                <CardContent className="space-y-2 p-6">
                  <p className="text-sm font-medium text-muted-foreground">Latest category</p>
                  <p className="text-lg font-semibold tracking-tight text-foreground">{recentReports[0]?.category}</p>
                  <p className="text-sm text-muted-foreground">Your newest report is ready to inspect.</p>
                </CardContent>
              </Card>
            </div>

            <Card className="section-panel overflow-hidden">
              <CardContent className="space-y-5 p-0">
                <div className="flex flex-col gap-3 border-b border-border/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">Recent reports</p>
                    <p className="text-sm text-muted-foreground">
                      Your evaluations are saving correctly. Add a workspace when you want version tracking and project analytics.
                    </p>
                  </div>
                  <Link href="/reports" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Open full report library
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
                <div className="overflow-x-auto px-3 pb-3 sm:px-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>Agent</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="text-right">Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentReports.map((report) => (
                        <TableRow key={report.id} className="border-border">
                          <TableCell>
                            <Link href={`/evaluations/${report.id}`} className="font-medium hover:text-primary">
                              {report.agentName}
                            </Link>
                          </TableCell>
                          <TableCell>{report.category}</TableCell>
                          <TableCell>
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                              {report.finalScore}
                            </span>
                          </TableCell>
                          <TableCell>
                            <RiskBadge riskLevel={report.riskLevel} />
                          </TableCell>
                          <TableCell>
                            <RiskBadge status={report.status} />
                          </TableCell>
                          <TableCell>
                            <Link href={`/evaluations/${report.id}`}>
                              <Button variant="outline" size="sm" className="rounded-lg">
                                Check report
                              </Button>
                            </Link>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatRelativeTime(report.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="section-panel">
            <CardContent className="space-y-3 p-8 text-center">
              <p className="text-lg font-semibold text-foreground">Nothing has been tracked yet</p>
              <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
                Run an evaluation to generate your first report, then create a workspace to organize future iterations and compare progress over time.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const overviewCards = [
    {
      title: "My average safety score",
      description: `Across the latest versions in ${firstName}'s accessible workspaces.`,
      value: `${averageScore}`,
      helper: "out of 100",
      data: [
        { label: "Safety score", value: averageScore, color: "#4f46e5" },
        { label: "Remaining", value: 100 - averageScore, color: "#e2e8f0" },
      ],
    },
    {
      title: "Evaluation distribution",
      description: `How ${firstName}'s accessible runs are scoring.`,
      value: `${combinedEvaluations.length}`,
      helper: "runs",
      data: [
        { label: "80-100", value: scoreBands.excellent, color: "#10b981" },
        { label: "60-79", value: scoreBands.moderate, color: "#f59e0b" },
        { label: "0-59", value: scoreBands.low, color: "#ef4444" },
      ],
    },
    {
      title: "Risk mix",
      description: `Risk level across ${firstName}'s accessible workspace reviews.`,
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
      description: `Health state across ${firstName}'s active and shared projects.`,
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
            {`${firstName}'s AI safety workspace`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Track {dashboard.stats.workspaceCount} active workspaces, {combinedEvaluations.length} evaluation runs, and the repeated issues that still need attention.
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
                {`The overview below is scoped to workspaces ${firstName} owns or has access to, so shared projects can appear alongside personal ones.`}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="subtle-panel px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Tracked versions</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {dashboard.stats.trackedVersions}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{`Across ${firstName}'s current workspaces`}</p>
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
                {`Recommended iteration steps for ${firstName}'s current workspace backlog.`}
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
                {`A cleaner snapshot of evaluations run across ${firstName}'s workspaces.`}
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
                {combinedEvaluations.map((evaluation) => (
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
