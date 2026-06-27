import { BrainCircuit } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { WorkspaceEvaluationRun } from "@/lib/types";
import { cn } from "@/lib/utils";

type WorkspaceSemanticSignalProps = {
  evaluation: WorkspaceEvaluationRun;
  compact?: boolean;
  showFallback?: boolean;
};

const priorityToneClasses = {
  high: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  medium: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  low: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
} as const;

function formatCoverage(evaluation: WorkspaceEvaluationRun) {
  if (!evaluation.hasSemanticInsights || typeof evaluation.semanticCoverageRatio !== "number") {
    return null;
  }

  return `${Math.round(evaluation.semanticCoverageRatio * 100)}% coverage`;
}

function formatMissedSummary(evaluation: WorkspaceEvaluationRun) {
  if (!evaluation.hasSemanticInsights) {
    return null;
  }

  const partial = evaluation.semanticPartialCount ?? 0;
  const missed = evaluation.semanticMissedCount ?? 0;

  return `${partial} partial - ${missed} missed`;
}

export function WorkspaceSemanticSignal({
  evaluation,
  compact = false,
  showFallback = true,
}: WorkspaceSemanticSignalProps) {
  if (!evaluation.hasSemanticInsights) {
    if (!showFallback) {
      return null;
    }

    return (
      <Badge className="rounded-full border border-border/70 bg-background/60 px-2.5 py-0.5 text-muted-foreground/90" variant="outline">
        Standard
      </Badge>
    );
  }

  const coverage = formatCoverage(evaluation);
  const missedSummary = formatMissedSummary(evaluation);
  const priority = evaluation.semanticTopSuggestionPriority;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", compact && "gap-1.5")}>
      <Badge className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
        <BrainCircuit className="size-3.5" />
        Semantic
      </Badge>
      {coverage ? <span className="text-xs text-muted-foreground">{coverage}</span> : null}
      {missedSummary ? <span className="text-xs text-muted-foreground">{missedSummary}</span> : null}
      {priority ? (
        <Badge className={cn("rounded-full px-2.5 py-0.5 capitalize", priorityToneClasses[priority])}>
          {priority} priority
        </Badge>
      ) : null}
    </div>
  );
}
