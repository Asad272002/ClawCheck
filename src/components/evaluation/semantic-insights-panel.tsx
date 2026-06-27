"use client";

import Link from "next/link";
import {
  Activity,
  BrainCircuit,
  CheckCheck,
  ChevronRight,
  CircleAlert,
  Clock3,
  FolderClock,
  Link2,
  Sparkles,
  Target,
} from "lucide-react";

import { RiskBadge } from "@/components/shared/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  EvaluationReport,
  SemanticCoverageCheck,
  SemanticCoverageStatus,
  SemanticSuggestionPriority,
  SemanticSuggestionType,
} from "@/lib/types";

type SemanticInsightsPanelProps = {
  report: EvaluationReport;
};

const coverageToneClasses: Record<SemanticCoverageStatus, string> = {
  covered: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  partial: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  missed: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
};

const coverageStatusLabels: Record<SemanticCoverageStatus, string> = {
  covered: "Covered",
  partial: "Mentioned, but weak",
  missed: "Not clearly covered",
};

const priorityToneClasses: Record<SemanticSuggestionPriority, string> = {
  high: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  medium: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  low: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
};

const coverageCardTones: Record<SemanticCoverageStatus, string> = {
  covered: "border-emerald-500/20 bg-emerald-500/[0.05]",
  partial: "border-amber-500/20 bg-amber-500/[0.05]",
  missed: "border-rose-500/20 bg-rose-500/[0.05]",
};

const suggestionTypeLabels: Record<SemanticSuggestionType, string> = {
  missing_expected_check: "Missing review point",
  partial_expected_check: "Partial review point",
  confidence_gap: "Confidence gap",
  verification_gap: "Verification gap",
  stakeholder_gap: "Stakeholder gap",
  recommendation_gap: "Recommendation gap",
};

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatSimilarity(value: number) {
  return `${Math.round(value * 100)}% match`;
}

function CoverageBadge({ status }: { status: SemanticCoverageStatus }) {
  return (
    <Badge className={cn("rounded-full px-2.5 py-0.5", coverageToneClasses[status])}>
      {coverageStatusLabels[status]}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: SemanticSuggestionPriority }) {
  return (
    <Badge className={cn("rounded-full px-2.5 py-0.5 capitalize", priorityToneClasses[priority])}>
      {priority} priority
    </Badge>
  );
}

function CoverageMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{helper}</p>
    </div>
  );
}

function CoverageCheckCard({ check }: { check: SemanticCoverageCheck }) {
  return (
    <div className={cn("rounded-[1.5rem] border p-4", coverageCardTones[check.status])}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{check.label}</p>
            <CoverageBadge status={check.status} />
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{check.explanation}</p>
        </div>
        <div className="shrink-0 text-sm font-semibold text-foreground">{formatSimilarity(check.similarity)}</div>
      </div>

      {check.bestMatchingChunk ? (
        <div className="mt-4 rounded-2xl border border-border/60 bg-card/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Closest part of the response</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{check.bestMatchingChunk}</p>
        </div>
      ) : null}

      {check.suggestedImprovement ? (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="leading-6">{check.suggestedImprovement}</p>
        </div>
      ) : null}
    </div>
  );
}

export function SemanticInsightsPanel({ report }: SemanticInsightsPanelProps) {
  const semanticInsights = report.semanticInsights;

  if (!semanticInsights) {
    return (
      <Card className="surface-card overflow-hidden">
        <CardHeader className="border-b border-border/80">
          <div className="flex items-center gap-2">
            <BrainCircuit className="size-5 text-primary" />
            <CardTitle>Semantic insights</CardTitle>
          </div>
          <CardDescription>Additional semantic review appears on newer generated reports.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-[1.5rem] border border-dashed border-border/60 bg-background/55 p-4 text-sm text-muted-foreground">
            Semantic insights were not generated for this older report.
          </div>
        </CardContent>
      </Card>
    );
  }

  const { semanticCoverage, semanticSuggestions, similarReports, workspaceMemory, overallSemanticSummary } = semanticInsights;

  return (
    <div className="space-y-6">
      <Card className="surface-card overflow-hidden">
        <CardHeader className="border-b border-border/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BrainCircuit className="size-5 text-primary" />
                <CardTitle>Semantic insights</CardTitle>
              </div>
              <CardDescription>
                A read-only view of what the response covered well, what was mentioned but still weak, and what needs clearer follow-through.
              </CardDescription>
            </div>
            <div className="max-w-xl rounded-[1.5rem] border border-border/70 bg-background/75 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Semantic summary</p>
              <p className="mt-1 leading-6">{overallSemanticSummary}</p>
              {report.semanticWarning ? <p className="mt-2 text-amber-600 dark:text-amber-400">{report.semanticWarning}</p> : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <CoverageMetric label="Expected checks" value={semanticCoverage.totalChecks} helper="Review points tied to this test case." />
            <CoverageMetric label="Covered" value={semanticCoverage.coveredCount} helper="Clearly addressed in the response." />
            <CoverageMetric label="Partial" value={semanticCoverage.partialCount} helper="Mentioned, but not strong enough yet." />
            <CoverageMetric label="Missed" value={semanticCoverage.missedCount} helper="Not clearly covered in the response." />
            <CoverageMetric label="Coverage ratio" value={formatPercent(semanticCoverage.coverageRatio)} helper="Overall progress against the expected review points." />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <Card className="rounded-[1.75rem] border border-border/70 bg-card/92 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCheck className="size-5 text-primary" />
                    <CardTitle>Semantic coverage</CardTitle>
                  </div>
                  <CardDescription>Each review point is matched against the closest part of the response.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {semanticCoverage.checks.map((check) => (
                    <CoverageCheckCard key={`${check.expectedCheckId}-${check.label}`} check={check} />
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem] border border-border/70 bg-card/92 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    <CardTitle>What to fix next</CardTitle>
                  </div>
                  <CardDescription>Practical next steps based on what felt weak or still unclear.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {semanticSuggestions.length > 0 ? (
                    semanticSuggestions.map((suggestion) => (
                      <div key={suggestion.id} className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-foreground">{suggestion.title}</p>
                              <PriorityBadge priority={suggestion.priority} />
                            </div>
                            <p className="text-sm leading-6 text-muted-foreground">{suggestion.description}</p>
                          </div>
                          <Badge className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
                            {suggestionTypeLabels[suggestion.type]}
                          </Badge>
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          <div className="rounded-2xl border border-border/70 bg-card/80 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Related review point</p>
                            <p className="mt-2 text-sm font-medium text-foreground">{suggestion.relatedCheckLabel}</p>
                            <p className="mt-3 text-sm text-muted-foreground">{suggestion.reason}</p>
                          </div>
                          <div className="rounded-2xl border border-border/70 bg-card/80 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">What to fix next</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{suggestion.suggestedAction}</p>
                          </div>
                        </div>

                        {suggestion.evidenceChunk ? (
                          <div className="mt-4 rounded-2xl border border-dashed border-border/80 bg-background/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Closest part of the response</p>
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{suggestion.evidenceChunk}</p>
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                      No semantic suggestions were generated for this report.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-[1.75rem] border border-border/70 bg-card/92 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Link2 className="size-5 text-primary" />
                    <CardTitle>Similar reports</CardTitle>
                  </div>
                  <CardDescription>Past runs that feel close to this response and may be useful comparisons.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {similarReports.length > 0 ? (
                    similarReports.map((similarReport) => (
                      <Link
                        key={similarReport.reportId}
                        href={`/evaluations/${similarReport.reportId}`}
                        className="block rounded-[1.5rem] border border-border/70 bg-background/75 p-4 transition hover:border-primary/30 hover:bg-accent/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <p className="font-medium text-foreground">{similarReport.agentName}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">{similarReport.category}</Badge>
                              <RiskBadge status={similarReport.status as EvaluationReport["status"]} />
                              <RiskBadge riskLevel={similarReport.riskLevel as EvaluationReport["riskLevel"]} />
                            </div>
                          </div>
                          <div className="shrink-0 text-right text-sm">
                            <p className="font-semibold text-foreground">{formatSimilarity(similarReport.similarity)}</p>
                            <p className="text-muted-foreground">Score {similarReport.finalScore}</p>
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">{similarReport.summary}</p>
                        <div className="mt-4 flex items-center justify-between text-sm text-primary">
                          <span>Open report comparison</span>
                          <ChevronRight className="size-4" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                      No similar reports were stored for this run.
                    </div>
                  )}
                </CardContent>
              </Card>

              {workspaceMemory ? (
                <Card className="rounded-[1.75rem] border border-border/70 bg-card/92 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FolderClock className="size-5 text-primary" />
                      <CardTitle>Workspace memory</CardTitle>
                    </div>
                    <CardDescription>Patterns from earlier workspace-linked runs that can help shape the next pass.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Repeated themes</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {workspaceMemory.repeatedThemes.length > 0 ? (
                          workspaceMemory.repeatedThemes.map((theme) => (
                            <Badge key={theme} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
                              {theme}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No repeated themes were stored for this workspace yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Improvement notes</p>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {workspaceMemory.improvementNotes.length > 0 ? (
                          workspaceMemory.improvementNotes.map((note) => (
                            <li key={note} className="flex items-start gap-2">
                              <Activity className="mt-0.5 size-4 shrink-0 text-primary" />
                              <span className="leading-6">{note}</span>
                            </li>
                          ))
                        ) : (
                          <li>No workspace improvement notes were stored for this run.</li>
                        )}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Similar workspace reports</p>
                      {workspaceMemory.similarWorkspaceReports.length > 0 ? (
                        workspaceMemory.similarWorkspaceReports.map((similarReport) => (
                          <Link
                            key={similarReport.reportId}
                            href={`/evaluations/${similarReport.reportId}`}
                            className="flex items-center justify-between rounded-[1.25rem] border border-border/70 bg-background/75 px-4 py-3 text-sm transition hover:border-primary/30 hover:bg-accent/50"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">{similarReport.agentName}</p>
                              <p className="break-words text-muted-foreground">
                                {similarReport.category} - Score {similarReport.finalScore} - {formatSimilarity(similarReport.similarity)}
                              </p>
                            </div>
                            <ChevronRight className="size-4 shrink-0 text-primary" />
                          </Link>
                        ))
                      ) : (
                        <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                          No workspace-linked report memory was stored for this run.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <Card className="rounded-[1.75rem] border border-border/70 bg-card/92 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="size-5 text-primary" />
                    <CardTitle>Semantic metadata</CardTitle>
                  </div>
                  <CardDescription>Stored with the report so this page can load the semantic view instantly.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Model</p>
                    <p className="mt-2 break-words text-sm font-medium text-foreground">{report.semanticModel ?? "Not recorded"}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Generated at</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
                      <Clock3 className="size-4 shrink-0 text-primary" />
                      <span>{report.semanticGeneratedAt ? new Date(report.semanticGeneratedAt).toLocaleString() : "Not recorded"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
