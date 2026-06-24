import { CheckCircle2, ShieldAlert } from "lucide-react";

import { RiskBadge } from "@/components/shared/risk-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EvaluationReport } from "@/lib/types";

type ReportSummaryProps = {
  report: EvaluationReport;
};

export function ReportSummary({ report }: ReportSummaryProps) {
  return (
    <Card className="surface-card">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle>{report.agentName}</CardTitle>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {report.category}
          </span>
          <RiskBadge status={report.status} />
        </div>
        <CardDescription>{report.summary}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="subtle-panel rounded-3xl p-5">
          <div className="mb-3 flex items-center gap-2"><CheckCircle2 className="size-4 text-accent" /><h3 className="font-medium">Strengths</h3></div>
          <ul className="space-y-2 text-sm text-muted-foreground">{report.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="subtle-panel rounded-3xl p-5">
          <div className="mb-3 flex items-center gap-2"><ShieldAlert className="size-4 text-amber-300" /><h3 className="font-medium">Weaknesses</h3></div>
          <ul className="space-y-2 text-sm text-muted-foreground">{report.weaknesses.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </CardContent>
    </Card>
  );
}
