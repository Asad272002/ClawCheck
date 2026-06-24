import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { OverviewChartCard } from "@/components/dashboard/overview-chart-card";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SAMPLE_REPORTS } from "@/data/sample-reports";
import { TEST_CASES } from "@/data/test-cases";
import { formatRelativeTime } from "@/lib/utils";

export default function DashboardPage() {
  const averageScore = Math.round(SAMPLE_REPORTS.reduce((total, report) => total + report.finalScore, 0) / SAMPLE_REPORTS.length);
  const scoreBands = {
    excellent: SAMPLE_REPORTS.filter((report) => report.finalScore >= 80).length,
    moderate: SAMPLE_REPORTS.filter((report) => report.finalScore >= 60 && report.finalScore < 80).length,
    low: SAMPLE_REPORTS.filter((report) => report.finalScore < 60).length,
  };
  const riskMix = {
    low: SAMPLE_REPORTS.filter((report) => report.riskLevel === "Low").length,
    medium: SAMPLE_REPORTS.filter((report) => report.riskLevel === "Medium").length,
    high: SAMPLE_REPORTS.filter((report) => report.riskLevel === "High").length,
  };
  const statusMix = {
    pass: SAMPLE_REPORTS.filter((report) => report.status === "Pass").length,
    review: SAMPLE_REPORTS.filter((report) => report.status === "Review").length,
    fail: SAMPLE_REPORTS.filter((report) => report.status === "Fail").length,
  };
  const libraryMix = {
    easy: TEST_CASES.filter((testCase) => testCase.difficulty === "Easy").length,
    medium: TEST_CASES.filter((testCase) => testCase.difficulty === "Medium").length,
    hard: TEST_CASES.filter((testCase) => testCase.difficulty === "Hard").length,
  };
  const overviewCards = [
    {
      title: "Average safety score",
      description: "Across the latest evaluation runs.",
      value: `${averageScore}`,
      helper: "out of 100",
      total: 100,
      data: [
        { label: "Safety score", value: averageScore, color: "#4f46e5" },
        { label: "Remaining", value: 100 - averageScore, color: "#e2e8f0" },
      ],
    },
    {
      title: "Score distribution",
      description: "How current reports are scoring.",
      value: `${SAMPLE_REPORTS.length}`,
      helper: "reports",
      total: SAMPLE_REPORTS.length,
      data: [
        { label: "80-100", value: scoreBands.excellent, color: "#10b981" },
        { label: "60-79", value: scoreBands.moderate, color: "#f59e0b" },
        { label: "0-59", value: scoreBands.low, color: "#ef4444" },
      ],
    },
    {
      title: "Risk mix",
      description: "Current spread by risk level.",
      value: `${riskMix.high}`,
      helper: "high risk",
      total: SAMPLE_REPORTS.length,
      data: [
        { label: "High", value: riskMix.high, color: "#ef4444" },
        { label: "Medium", value: riskMix.medium, color: "#f59e0b" },
        { label: "Low", value: riskMix.low, color: "#3b82f6" },
      ],
    },
    {
      title: "Prompt library",
      description: "Difficulty coverage in test cases.",
      value: `${TEST_CASES.length}`,
      helper: "test cases",
      total: TEST_CASES.length,
      data: [
        { label: "Easy", value: libraryMix.easy, color: "#38bdf8" },
        { label: "Medium", value: libraryMix.medium, color: "#8b5cf6" },
        { label: "Hard", value: libraryMix.hard, color: "#fb7185" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-border/80 bg-card/95 px-6 py-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">Overview</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
            AI safety workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Track reports, risk levels, and test coverage without the dashboard feeling crowded.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
                A cleaner snapshot of recent reports, scores, and risk status.
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
                  <TableHead>Agent</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SAMPLE_REPORTS.map((report) => (
                  <TableRow key={report.id} className="border-border">
                    <TableCell>
                      <Link href={`/evaluations/${report.id}`} className="font-medium hover:text-primary">
                        {report.agentName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {report.category}
                      </span>
                    </TableCell>
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
                    <TableCell className="text-right text-muted-foreground">
                      {formatRelativeTime(report.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end px-6 pb-5">
            <Link href="/reports" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              View full report library
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
