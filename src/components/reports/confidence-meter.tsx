import { Progress, ProgressLabel } from "@/components/ui/progress";

type ConfidenceMeterProps = {
  score: number;
  label: string;
};

export function ConfidenceMeter({ score, label }: ConfidenceMeterProps) {
  return (
    <div className="surface-card space-y-3 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <span className="text-sm text-muted-foreground">{score}/100</span>
      </div>
      <Progress value={score} className="gap-2">
        <div className="flex w-full items-center gap-3">
          <ProgressLabel>{label}</ProgressLabel>
          <span className="ml-auto text-sm text-muted-foreground tabular-nums">{score}%</span>
        </div>
      </Progress>
    </div>
  );
}
