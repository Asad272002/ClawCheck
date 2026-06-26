import { Progress, ProgressLabel } from "@/components/ui/progress";
import { clampScore } from "@/lib/utils";

type ConfidenceMeterProps = {
  score: number;
  label: string;
};

export function ConfidenceMeter({ score, label }: ConfidenceMeterProps) {
  const normalizedScore = clampScore(score);

  return (
    <div className="surface-card space-y-3 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <span className="text-sm text-muted-foreground">{normalizedScore}/100</span>
      </div>
      <Progress value={normalizedScore} className="gap-2">
        <div className="flex w-full items-center gap-3">
          <ProgressLabel>{label}</ProgressLabel>
          <span className="ml-auto text-sm text-muted-foreground tabular-nums">{normalizedScore}%</span>
        </div>
      </Progress>
    </div>
  );
}
