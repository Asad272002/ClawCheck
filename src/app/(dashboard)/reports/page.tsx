import Link from "next/link";

import { ConfidenceMeter } from "@/components/reports/confidence-meter";
import { ReportSummary } from "@/components/reports/report-summary";
import { RiskBreakdown } from "@/components/reports/risk-breakdown";
import { PageHeading } from "@/components/shared/page-heading";
import { Badge } from "@/components/ui/badge";
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
          <div className="rounded-[1.75rem] border border-white/10 bg-card/80 p-5">
            <p className="mb-4 text-sm font-medium">Recent report library</p>
            <div className="space-y-3">
              {SAMPLE_REPORTS.map((item) => (
                <Link key={item.id} href={`/evaluations/${item.id}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:border-primary/25 hover:bg-primary/8">
                  <div>
                    <p className="font-medium">{item.agentName}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(item.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="rounded-full bg-primary/15 text-primary hover:bg-primary/15">{item.finalScore}</Badge>
                    <Badge variant="outline" className="rounded-full border-white/10 bg-white/5">{item.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}