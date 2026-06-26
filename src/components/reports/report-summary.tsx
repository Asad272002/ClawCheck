import { BrainCircuit, ClipboardCheck, FileSearch, MessageSquareQuote, Sparkles, Target } from "lucide-react";

import { ScoreCard } from "@/components/reports/score-card";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { EvaluationReport } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

type ReportSummaryProps = {
  report: EvaluationReport;
};

function ContextCard({
  icon,
  label,
  title,
  body,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-border/80 bg-card/92 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">{icon}</div>
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{body}</p>
        </div>
      </div>
    </div>
  );
}

function BulletCard({
  title,
  icon,
  items,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  empty: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-border/80 bg-card/92 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} className="rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm leading-6 text-muted-foreground">
              {item}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/65 px-4 py-3 text-sm text-muted-foreground">
            {empty}
          </div>
        )}
      </div>
    </div>
  );
}

export function ReportSummary({ report }: ReportSummaryProps) {
  return (
    <div className="space-y-6">
      <Card className="section-panel overflow-hidden">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Evaluation report
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  Generated {formatRelativeTime(report.createdAt)}
                </span>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2.25rem]">
                  {report.agentName}
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{report.summary}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {report.category}
                </span>
                <RiskBadge status={report.status} />
                <RiskBadge riskLevel={report.riskLevel} />
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 xl:max-w-2xl">
              <ScoreCard
                label="Final score"
                value={`${report.finalScore}`}
                helper={report.finalScore >= 80 ? "Ready for acceptance" : report.finalScore >= 60 ? "Needs another pass" : "Requires major revision"}
                trend={report.finalScore >= 80 ? "up" : report.finalScore < 60 ? "down" : "neutral"}
              />
              <ScoreCard
                label="Risk level"
                value={report.riskLevel}
                helper={report.status === "Pass" ? "Lower immediate concern" : "Review before approval"}
                trend={report.riskLevel === "Low" ? "up" : report.riskLevel === "High" ? "down" : "neutral"}
              />
              <ScoreCard
                label="Confidence"
                value={report.confidenceQuality}
                helper="How justified the answer felt"
                trend={report.confidenceQuality === "High" ? "up" : report.confidenceQuality === "Low" ? "down" : "neutral"}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ContextCard
              icon={<BrainCircuit className="size-4" />}
              label="Agent profile"
              title={`${report.agentType} - ${report.agentName}`}
              body={report.agentPurpose}
            />
            <ContextCard
              icon={<Target className="size-4" />}
              label="What we tested"
              title={report.category}
              body={report.testPrompt}
            />
            <ContextCard
              icon={<MessageSquareQuote className="size-4" />}
              label="Agent response"
              title="Submitted answer under review"
              body={report.agentResponse}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <BulletCard
          title="What went well"
          icon={<Sparkles className="size-4" />}
          items={report.strengths}
          empty="No strengths were extracted for this run."
        />
        <BulletCard
          title="Where it broke down"
          icon={<FileSearch className="size-4" />}
          items={report.weaknesses}
          empty="No weaknesses were extracted for this run."
        />
        <BulletCard
          title="What to fix next"
          icon={<ClipboardCheck className="size-4" />}
          items={report.recommendations}
          empty="No follow-up recommendations were generated for this run."
        />
      </div>
    </div>
  );
}
