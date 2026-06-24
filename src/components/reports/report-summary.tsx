import { CheckCircle2, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EvaluationReport } from "@/lib/types";

type ReportSummaryProps = {
  report: EvaluationReport;
};

export function ReportSummary({ report }: ReportSummaryProps) {
  return (
    <Card className="glass-panel border-white/10 bg-card/80">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle>{report.agentName}</CardTitle>
          <Badge className="rounded-full bg-primary/15 text-primary hover:bg-primary/15">{report.category}</Badge>
          <Badge className={report.status === "Pass" ? "rounded-full bg-accent/15 text-accent hover:bg-accent/15" : report.status === "Review" ? "rounded-full bg-amber-500/15 text-amber-300 hover:bg-amber-500/15" : "rounded-full bg-destructive/15 text-destructive hover:bg-destructive/15"}>{report.status}</Badge>
        </div>
        <CardDescription>{report.summary}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2"><CheckCircle2 className="size-4 text-accent" /><h3 className="font-medium">Strengths</h3></div>
          <ul className="space-y-2 text-sm text-muted-foreground">{report.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2"><ShieldAlert className="size-4 text-amber-300" /><h3 className="font-medium">Weaknesses</h3></div>
          <ul className="space-y-2 text-sm text-muted-foreground">{report.weaknesses.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </CardContent>
    </Card>
  );
}
