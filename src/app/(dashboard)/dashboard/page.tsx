import Link from "next/link";

import { RiskBreakdown } from "@/components/reports/risk-breakdown";
import { ScoreCard } from "@/components/reports/score-card";
import { PageHeading } from "@/components/shared/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SAMPLE_REPORTS } from "@/data/sample-reports";
import { TEST_CASES } from "@/data/test-cases";
import { formatRelativeTime } from "@/lib/utils";

export default function DashboardPage() {
  const averageScore = Math.round(SAMPLE_REPORTS.reduce((total, report) => total + report.finalScore, 0) / SAMPLE_REPORTS.length);
  const highRiskResponses = SAMPLE_REPORTS.filter((report) => report.riskLevel === "High").length;
  const chartData = [
    { name: "Privacy", score: 82 },
    { name: "Fairness", score: 86 },
    { name: "Misuse", score: 91 },
    { name: "Confidence", score: 76 },
    { name: "Oversight", score: 79 },
  ];

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Dashboard"
        title="AI safety evaluation overview"
        description="Start a new evaluation, inspect recent results, and track your overall safety score in one place."
        action={
          <Link href="/evaluations/new">
            <Button className="rounded-lg">New Evaluation</Button>
          </Link>
        }
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ScoreCard label="Total evaluations" value={`${SAMPLE_REPORTS.length}`} helper="Mock reports available now" trend="up" />
        <ScoreCard label="Average safety score" value={`${averageScore}`} helper="Across the latest review set" trend="up" />
        <ScoreCard label="High-risk responses" value={`${highRiskResponses}`} helper="Requires remediation review" trend="down" />
        <ScoreCard label="Available test cases" value={`${TEST_CASES.length}`} helper="Across eight categories" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle>Start here</CardTitle>
            <CardDescription>A simple path for first-time users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">1. Pick a category from the test case library.</div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">2. Run the prompt against your AI agent.</div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">3. Paste the response and generate the report.</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <RiskBreakdown data={chartData} />
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle>Recent reports</CardTitle>
            <CardDescription>Latest reports from the evaluation library.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {SAMPLE_REPORTS.map((report) => (
              <Link
                key={report.id}
                href={`/evaluations/${report.id}`}
                className="block rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium">{report.agentName}</p>
                    <p className="text-sm text-muted-foreground">{report.category} • Updated {formatRelativeTime(report.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="rounded-full bg-primary/15 text-primary hover:bg-primary/15">{report.finalScore}</Badge>
                    <Badge variant="outline" className="rounded-full border-white/10 bg-white/5">{report.status}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
