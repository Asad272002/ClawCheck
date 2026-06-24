import Link from "next/link";

import { ConfidenceMeter } from "@/components/reports/confidence-meter";
import { ReportSummary } from "@/components/reports/report-summary";
import { RiskBreakdown } from "@/components/reports/risk-breakdown";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeading } from "@/components/shared/page-heading";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SAMPLE_REPORTS } from "@/data/sample-reports";
import { formatRelativeTime } from "@/lib/utils";

export default function ReportsPage() {
  const report = SAMPLE_REPORTS[0];
  const chartData = Object.entries(report.categoryScores).map(([key, score]) => ({ name: key.replace(/([A-Z])/g, " $1"), score }));

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Reports"
        title="Review generated evaluation reports"
        description="Inspect final score, pass or fail status, category scores, strengths, weaknesses, missing risks, confidence quality, and recommended improvements."
      />
      <ReportSummary report={report} />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <RiskBreakdown title="Report score distribution" description="Current breakdown for the selected privacy evaluation." data={chartData} mode="pie" />
        <div className="space-y-4">
          <ConfidenceMeter score={74} label={`Confidence quality: ${report.confidenceQuality}`} />
          <div className="surface-card p-5">
            <p className="mb-4 text-sm font-medium">Recent report library</p>
            <div className="space-y-3">
              {SAMPLE_REPORTS.slice(0, 3).map((item) => (
                <Link key={item.id} href={`/evaluations/${item.id}`} className="subtle-panel flex items-center justify-between px-4 py-3 text-sm transition hover:border-primary/25 hover:bg-accent">
                  <div>
                    <p className="font-medium">{item.agentName}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(item.createdAt)}</p>
                  </div>
                  <RiskBadge status={item.status} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      {SAMPLE_REPORTS.length === 0 ? (
        <EmptyState title="No reports yet" description="Run your first evaluation to populate the report library." />
      ) : (
        <div className="surface-card p-2 sm:p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Agent name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Risk level</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_REPORTS.map((item) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell>
                    <Link href={`/evaluations/${item.id}`} className="font-medium hover:text-primary">
                      {item.agentName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.category}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {item.finalScore}
                    </span>
                  </TableCell>
                  <TableCell>
                    <RiskBadge riskLevel={item.riskLevel} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatRelativeTime(item.createdAt)}</TableCell>
                  <TableCell>
                    <RiskBadge status={item.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
