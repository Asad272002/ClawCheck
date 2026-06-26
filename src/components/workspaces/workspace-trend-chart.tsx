"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";

type WorkspaceTrendDatum = {
  version: string;
  detail?: string;
  score: number;
  coverage: number;
  evaluations: number;
};

type WorkspaceTrendChartProps = {
  title?: string;
  description?: string;
  data: WorkspaceTrendDatum[];
};

type TrendTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload?: WorkspaceTrendDatum;
  }>;
};

function TrendTooltip({ active, payload }: TrendTooltipProps) {
  const item = payload?.[0]?.payload;

  if (!active || !item) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-popover/95 px-3 py-2 text-sm shadow-[0_16px_40px_rgba(15,23,42,0.14)] backdrop-blur">
      <p className="font-semibold text-popover-foreground">{item.version}</p>
      {item.detail ? <p className="text-muted-foreground">{item.detail}</p> : null}
      <p className="text-muted-foreground">Safety score: {item.score}</p>
      {item.coverage > 0 ? <p className="text-muted-foreground">Prompt coverage: {item.coverage}%</p> : null}
      <p className="text-muted-foreground">Evaluations: {item.evaluations}</p>
    </div>
  );
}

export function WorkspaceTrendChart({
  title = "Score trend over versions",
  description = "Track whether each iteration is improving across safety score and prompt coverage.",
  data,
}: WorkspaceTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card className="section-panel h-full">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex h-[260px] items-center justify-center rounded-[1.75rem] border border-dashed border-border/80 bg-background/60 px-6 text-center">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">No analytics yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Run the first workspace-linked evaluation or add a tracked version and ClawCheck will start plotting score movement here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="section-panel h-full">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -18, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="workspace-score-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="version"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value: string) => (value.length > 16 ? `${value.slice(0, 16)}...` : value)}
              />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={10} />
              <Tooltip content={<TrendTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#4f46e5"
                strokeWidth={3}
                fill="url(#workspace-score-gradient)"
                activeDot={{ r: 6, fill: "#4f46e5", stroke: "#ffffff", strokeWidth: 2 }}
                isAnimationActive
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
