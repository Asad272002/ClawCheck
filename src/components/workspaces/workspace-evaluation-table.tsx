import Link from "next/link";
import { ArrowUpRight, FileSearch, History } from "lucide-react";

import { RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import { WorkspaceSemanticSignal } from "@/components/workspaces/workspace-semantic-signal";
import type { AgentWorkspaceVersion, WorkspaceEvaluationRun } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

type WorkspaceEvaluationTableProps = {
  evaluations: WorkspaceEvaluationRun[];
  versions: AgentWorkspaceVersion[];
};

export function WorkspaceEvaluationTable({ evaluations, versions }: WorkspaceEvaluationTableProps) {
  const versionLabels = Object.fromEntries(versions.map((version) => [version.id, version.label]));
  const sortedEvaluations = [...evaluations].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  return (
    <div className="section-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-foreground">Evaluation history</p>
          <p className="text-sm text-muted-foreground">
            Recent runs for this workspace agent, including generated reports you can open for a deeper review.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <History className="size-3.5" />
          {sortedEvaluations.length} tracked run{sortedEvaluations.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-2">
        {sortedEvaluations.map((evaluation) => {
          const versionLabel = evaluation.versionLabel ?? versionLabels[evaluation.versionId] ?? evaluation.versionId;

          return (
            <div key={evaluation.id} className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {versionLabel}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        Score {evaluation.score}
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">{evaluation.category}</p>
                      <p className="text-sm text-muted-foreground">{formatRelativeTime(evaluation.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge status={evaluation.status} />
                    <RiskBadge riskLevel={evaluation.riskLevel} />
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                  <p className="text-sm leading-6 text-muted-foreground">{evaluation.summary}</p>
                  <div className="mt-3">
                    <WorkspaceSemanticSignal evaluation={evaluation} compact />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Key weakness</p>
                    <p className="mt-2 text-sm text-foreground">
                      {evaluation.weaknesses[0] ?? "No repeated weakness captured"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Suggested next move</p>
                    <p className="mt-2 text-sm text-foreground">
                      {evaluation.semanticTopSuggestionLabel
                        ? `Tighten ${evaluation.semanticTopSuggestionLabel.toLowerCase()}.`
                        : evaluation.improvements[0] ?? "No follow-up recommendation recorded"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileSearch className="size-4" />
                    {evaluation.reportId ? "Detailed generated report available" : "Workspace snapshot only"}
                  </div>
                  {evaluation.reportId ? (
                    <Link href={`/evaluations/${evaluation.reportId}`}>
                      <Button className="rounded-xl">
                        Check report
                        <ArrowUpRight className="size-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" className="rounded-xl" disabled>
                      Snapshot only
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
