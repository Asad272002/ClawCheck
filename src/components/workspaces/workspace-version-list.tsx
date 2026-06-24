import { GitBranch, Layers3 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AgentWorkspaceVersion } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

type WorkspaceVersionListProps = {
  versions: AgentWorkspaceVersion[];
};

export function WorkspaceVersionList({ versions }: WorkspaceVersionListProps) {
  return (
    <Card className="section-panel h-full">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-foreground">Version history</p>
          <p className="text-sm text-muted-foreground">
            Each iteration tracks score changes, prompt coverage, and what changed in the agent.
          </p>
        </div>
        <div className="space-y-4">
          {[...versions]
            .sort((left, right) => new Date(right.releasedAt).getTime() - new Date(left.releasedAt).getTime())
            .map((version, index) => (
              <div key={version.id} className="subtle-panel space-y-4 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {version.label}
                      </span>
                      {index === 0 ? (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Current
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm font-medium text-foreground">{version.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      Released {formatRelativeTime(version.releasedAt)}
                    </p>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-3 sm:min-w-44">
                    <div className="rounded-2xl bg-background/80 px-3 py-2">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Score</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{version.safetyScore}</p>
                    </div>
                    <div className="rounded-2xl bg-background/80 px-3 py-2">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Runs</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{version.evaluationCount}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Layers3 className="size-4" />
                      Prompt coverage
                    </div>
                    <span className="font-medium text-foreground">{version.promptCoverage}%</span>
                  </div>
                  <Progress value={version.promptCoverage} className="gap-0" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {version.focusAreas.map((focusArea) => (
                    <span
                      key={focusArea}
                      className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card/90 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                      <GitBranch className="size-3.5" />
                      {focusArea}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
