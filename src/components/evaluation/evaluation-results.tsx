"use client";

import { AlertTriangle, BarChart3, CheckCircle2, ClipboardList, FileWarning, ShieldAlert, Target, TriangleAlert } from "lucide-react";

import { ConfidenceMeter } from "@/components/reports/confidence-meter";
import { RiskBreakdown } from "@/components/reports/risk-breakdown";
import { ReportSummary } from "@/components/reports/report-summary";
import { SemanticInsightsPanel } from "@/components/evaluation/semantic-insights-panel";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EvaluationReport } from "@/lib/types";

type EvaluationResultsProps = {
  report: EvaluationReport;
};

const DIMENSION_LABELS: Record<keyof EvaluationReport["categoryScores"], string> = {
  riskIdentification: "Risk identification",
  stakeholderAwareness: "Stakeholder awareness",
  uncertaintyHandling: "Uncertainty handling",
  hallucinationAvoidance: "Hallucination avoidance",
  recommendationQuality: "Recommendation quality",
  confidenceJustification: "Confidence justification",
};

function scoreNarrative(score: number) {
  if (score >= 16) {
    return "Strong coverage";
  }

  if (score >= 10) {
    return "Usable, but worth tightening";
  }

  return "Needs focused iteration";
}

export function EvaluationResults({ report }: EvaluationResultsProps) {
  const chartData = (Object.entries(report.categoryScores) as Array<[keyof EvaluationReport["categoryScores"], number]>).map(([key, score]) => ({
    key,
    name: DIMENSION_LABELS[key],
    score,
  }));
  const sortedDimensions = [...chartData].sort((left, right) => right.score - left.score);
  const confidenceScore = Math.min(100, report.categoryScores.confidenceJustification * 10);
  const promptWordCount = report.testPrompt.trim().split(/\s+/).filter(Boolean).length;
  const responseWordCount = report.agentResponse.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <ReportSummary report={report} />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <RiskBreakdown
            title="Rubric score breakdown"
            description="How the response performed across the main scoring dimensions used in this review."
            data={chartData}
          />

          <Card className="surface-card overflow-hidden">
            <CardHeader className="border-b border-border/80">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" />
                <CardTitle>What the analytics are saying</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-background/75 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <h3 className="font-medium text-foreground">Strongest dimensions</h3>
                  </div>
                  <div className="space-y-3">
                    {sortedDimensions.slice(0, 3).map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-muted-foreground">{scoreNarrative(item.score)}</p>
                        </div>
                        <span className="font-semibold text-foreground">{item.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-border/70 bg-background/75 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="size-4 text-amber-500" />
                    <h3 className="font-medium text-foreground">Weakest dimensions</h3>
                  </div>
                  <div className="space-y-3">
                    {[...sortedDimensions]
                      .reverse()
                      .slice(0, 3)
                      .map((item) => (
                        <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-muted-foreground">{scoreNarrative(item.score)}</p>
                          </div>
                          <span className="font-semibold text-foreground">{item.score}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/75 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <ClipboardList className="size-4 text-primary" />
                  <h3 className="font-medium text-foreground">Dimension-by-dimension reading</h3>
                </div>
                <div className="space-y-3">
                  {sortedDimensions.map((item) => (
                    <div key={item.key} className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                        <span className="text-sm font-semibold text-foreground">{item.score}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{scoreNarrative(item.score)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="surface-card overflow-hidden">
            <CardHeader className="border-b border-border/80">
              <CardTitle>Decision snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Final score: {report.finalScore}
                </span>
                <RiskBadge status={report.status} />
                <RiskBadge riskLevel={report.riskLevel} />
              </div>
              <ConfidenceMeter label={`Confidence quality: ${report.confidenceQuality}`} score={confidenceScore} />
              <p className="text-sm leading-6 text-muted-foreground">
                This run combines the rubric scores, confidence signal, and missing-risk detection into one approval-oriented review.
              </p>
            </CardContent>
          </Card>

          <Card className="surface-card overflow-hidden">
            <CardHeader className="border-b border-border/80">
              <div className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                <CardTitle>How this was tested</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-background/75 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Review type</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{report.category}</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/75 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Evaluation mode</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{report.workspaceId ? "Workspace-linked evaluation" : "General one-time evaluation"}</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/75 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Prompt size</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{promptWordCount} words under test</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/75 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Response size</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{responseWordCount} words reviewed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card overflow-hidden">
            <CardHeader className="border-b border-border/80">
              <div className="flex items-center gap-2">
                <FileWarning className="size-5 text-primary" />
                <CardTitle>What was still missing</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="rounded-3xl border border-border/70 bg-background/75 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <TriangleAlert className="size-4 text-amber-500" />
                  <h3 className="font-medium text-foreground">Missing risks</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {report.missingRisks.length > 0 ? report.missingRisks.map((item) => <li key={item}>{item}</li>) : <li>No missing risks were extracted.</li>}
                </ul>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/75 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldAlert className="size-4 text-primary" />
                  <h3 className="font-medium text-foreground">Weakness detail</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {report.weaknesses.length > 0 ? report.weaknesses.map((item) => <li key={item}>{item}</li>) : <li>No weaknesses were extracted.</li>}
                </ul>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/75 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <h3 className="font-medium text-foreground">Recommended next moves</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {report.recommendations.length > 0 ? report.recommendations.map((item) => <li key={item}>{item}</li>) : <li>No follow-up recommendations were generated.</li>}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SemanticInsightsPanel report={report} />
    </div>
  );
}
