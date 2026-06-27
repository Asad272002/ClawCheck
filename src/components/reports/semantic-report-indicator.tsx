import { BrainCircuit } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { EvaluationReport, SemanticSuggestionPriority } from "@/lib/types";
import { cn } from "@/lib/utils";

type SemanticReportIndicatorProps = {
  report: EvaluationReport;
  compact?: boolean;
  showFallback?: boolean;
};

const priorityToneClasses: Record<SemanticSuggestionPriority, string> = {
  high: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  medium: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  low: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
};

function formatCoverageSummary(report: EvaluationReport) {
  const semanticCoverage = report.semanticInsights?.semanticCoverage;

  if (!semanticCoverage) {
    return null;
  }

  return `${Math.round(semanticCoverage.coverageRatio * 100)}% coverage - ${semanticCoverage.missedCount} missed`;
}

function getTopSuggestionPriority(report: EvaluationReport) {
  const suggestions = report.semanticInsights?.semanticSuggestions ?? [];

  if (suggestions.length === 0) {
    return null;
  }

  const priorityOrder: Record<SemanticSuggestionPriority, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...suggestions].sort((left, right) => priorityOrder[right.priority] - priorityOrder[left.priority])[0]?.priority ?? null;
}

export function SemanticReportIndicator({
  report,
  compact = false,
  showFallback = true,
}: SemanticReportIndicatorProps) {
  const semanticInsights = report.semanticInsights;

  if (!semanticInsights) {
    if (!showFallback) {
      return null;
    }

    return (
      <div className={cn("flex flex-wrap items-center gap-2", compact && "gap-1.5")}>
        <Badge className="rounded-full border border-border/70 bg-background/60 px-2.5 py-0.5 text-muted-foreground/90" variant="outline">
          Standard
        </Badge>
      </div>
    );
  }

  const coverageSummary = formatCoverageSummary(report);
  const topPriority = getTopSuggestionPriority(report);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", compact && "gap-1.5")}>
      <Badge className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
        <BrainCircuit className="size-3.5" />
        Semantic
      </Badge>
      {coverageSummary ? <span className="text-xs text-muted-foreground">{coverageSummary}</span> : null}
      {topPriority ? (
        <Badge className={cn("rounded-full px-2.5 py-0.5 capitalize", priorityToneClasses[topPriority])}>
          {topPriority} priority
        </Badge>
      ) : null}
    </div>
  );
}
