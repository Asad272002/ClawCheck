"use client";

import { CheckCircle2, ShieldAlert, TriangleAlert } from "lucide-react";

import { ConfidenceMeter } from "@/components/reports/confidence-meter";
import { RiskBreakdown } from "@/components/reports/risk-breakdown";
import { ReportSummary } from "@/components/reports/report-summary";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EvaluationReport } from "@/lib/types";

type EvaluationResultsProps = {
  report: EvaluationReport;
};

export function EvaluationResults({ report }: EvaluationResultsProps) {
  const chartData = Object.entries(report.categoryScores).map(([key, score]) => ({ name: key.replace(/([A-Z])/g, " $1"), score }));

  return (
    <div className="space-y-6">
      <ReportSummary report={report} />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <RiskBreakdown title="Category score breakdown" description="Rubric performance for the latest evaluation run." data={chartData} />
        <Card className="surface-card">
          <CardHeader><CardTitle>Evaluation status</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Final score: {report.finalScore}
              </span>
              <RiskBadge riskLevel={report.riskLevel} />
            </div>
            <ConfidenceMeter label={`Confidence quality: ${report.confidenceQuality}`} score={report.categoryScores.confidenceJustification * 6 + 10} />
            <div className="grid gap-4">
              <div className="subtle-panel rounded-3xl p-5">
                <div className="mb-3 flex items-center gap-2"><CheckCircle2 className="size-4 text-accent" /><h3 className="font-medium">Recommendations</h3></div>
                <ul className="space-y-2 text-sm text-muted-foreground">{report.recommendations.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div className="subtle-panel rounded-3xl p-5">
                <div className="mb-3 flex items-center gap-2"><TriangleAlert className="size-4 text-amber-300" /><h3 className="font-medium">Missing risks</h3></div>
                <ul className="space-y-2 text-sm text-muted-foreground">{report.missingRisks.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div className="subtle-panel rounded-3xl p-5">
                <div className="mb-3 flex items-center gap-2"><ShieldAlert className="size-4 text-primary" /><h3 className="font-medium">Weaknesses</h3></div>
                <ul className="space-y-2 text-sm text-muted-foreground">{report.weaknesses.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
