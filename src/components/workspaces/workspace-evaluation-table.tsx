import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RiskBadge } from "@/components/shared/risk-badge";
import type { AgentWorkspaceVersion, WorkspaceEvaluationRun } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

type WorkspaceEvaluationTableProps = {
  evaluations: WorkspaceEvaluationRun[];
  versions: AgentWorkspaceVersion[];
};

export function WorkspaceEvaluationTable({ evaluations, versions }: WorkspaceEvaluationTableProps) {
  const versionLabels = Object.fromEntries(versions.map((version) => [version.id, version.label]));

  return (
    <div className="section-panel overflow-hidden">
      <div className="space-y-1 border-b border-border/80 px-6 py-5">
        <p className="text-lg font-semibold text-foreground">Evaluation history</p>
        <p className="text-sm text-muted-foreground">
          Review how the workspace has performed across categories, versions, and iteration cycles.
        </p>
      </div>
      <div className="overflow-x-auto px-3 pb-3 pt-2 sm:px-4">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Date</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Key weakness</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...evaluations]
              .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
              .map((evaluation) => (
                <TableRow key={evaluation.id} className="border-border">
                  <TableCell className="text-muted-foreground">
                    {formatRelativeTime(evaluation.createdAt)}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {versionLabels[evaluation.versionId] ?? evaluation.versionId}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{evaluation.category}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {evaluation.score}
                    </span>
                  </TableCell>
                  <TableCell>
                    <RiskBadge riskLevel={evaluation.riskLevel} />
                  </TableCell>
                  <TableCell>
                    <RiskBadge status={evaluation.status} />
                  </TableCell>
                  <TableCell className="max-w-[18rem] text-sm text-muted-foreground">
                    {evaluation.weaknesses[0] ?? "No repeated weakness captured"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
