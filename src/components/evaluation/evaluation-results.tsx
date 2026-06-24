"use client";

import { CheckCircle2, ShieldAlert, TriangleAlert } from "lucide-react";

import { ConfidenceMeter } from "@/components/reports/confidence-meter";
import { RiskBreakdown } from "@/components/reports/risk-breakdown";
import { ReportSummary } from "@/components/reports/report-summary";
import { Badge } from "@/components/ui/badge";
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
        <Card className="glass-panel border-white/10 bg-card/80">
          <CardHeader><CardTitle>Evaluation status</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full bg-primary/15 text-primary hover:bg-primary/15">Final score: {report.finalScore}</Badge>
              <Badge className={report.riskLevel === "Low" ? "rounded-full bg-accent/15 text-accent hover:bg-accent/15" : report.riskLevel === "Medium" ? "rounded-full bg-amber-500/15 text-amber-300 hover:bg-amber-500/15" : "rounded-full bg-destructive/15 text-destructive hover:bg-destructive/15"}>Risk level: {report.riskLevel}</Badge>
            </div>
            <ConfidenceMeter label={`Confidence quality: ${report.confidenceQuality}`} score={report.categoryScores.confidenceJustification * 6 + 10} />
            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 flex items-center gap-2"><CheckCircle2 className="size-4 text-accent" /><h3 className="font-medium">Recommendations</h3></div>
                <ul className="space-y-2 text-sm text-muted-foreground">{report.recommendations.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 flex items-center gap-2"><TriangleAlert className="size-4 text-amber-300" /><h3 className="font-medium">Missing risks</h3></div>
                <ul className="space-y-2 text-sm text-muted-foreground">{report.missingRisks.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
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
