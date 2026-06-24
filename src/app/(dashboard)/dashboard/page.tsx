import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { RiskBreakdown } from "@/components/reports/risk-breakdown";
import { PageHeading } from "@/components/shared/page-heading";
import { RiskBadge } from "@/components/shared/risk-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
            <Button className="rounded-xl shadow-[0_12px_28px_rgba(37,99,235,0.25)]">
              <Sparkles className="size-4" />
              New Evaluation
            </Button>
          </Link>
        }
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total evaluations" value={`${SAMPLE_REPORTS.length}`} helper="Mock reports available now" trend="up" />
        <StatCard label="Average safety score" value={`${averageScore}`} helper="Across the latest review set" trend="up" />
        <StatCard label="High-risk responses" value={`${highRiskResponses}`} helper="Requires remediation review" trend="down" />
        <StatCard label="Available test cases" value={`${TEST_CASES.length}`} helper="Across eight categories" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <RiskBreakdown
          data={chartData}
          title="Risk category chart"
          description="Current score distribution across the most important evaluation categories."
        />
        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Start here</CardTitle>
            <CardDescription>Compact setup checklist for the core evaluation flow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              "Pick a category from the prompt library.",
              "Run the prompt against your target AI agent.",
              "Paste the response and generate the report.",
              "Review risks, confidence, and recommendations.",
            ].map((item, index) => (
              <div key={item} className="subtle-panel flex items-center gap-3 p-4">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {index + 1}
                </div>
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="section-panel">
          <CardHeader>
            <CardTitle>Recent reports</CardTitle>
            <CardDescription>Recent evaluations with score, risk level, and status.</CardDescription>
          </CardHeader>
          <CardContent>
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
                    <TableCell className="text-muted-foreground">{report.category}</TableCell>
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
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Latest activity</CardTitle>
            <CardDescription>Most recent report snapshot for quick review.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {SAMPLE_REPORTS.slice(0, 2).map((report) => (
              <Link key={report.id} href={`/evaluations/${report.id}`} className="subtle-panel block p-4 hover:bg-accent">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{report.agentName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{report.summary}</p>
                  </div>
                  <ArrowRight className="mt-1 size-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
