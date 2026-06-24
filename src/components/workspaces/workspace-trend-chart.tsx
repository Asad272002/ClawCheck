"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";

type WorkspaceTrendDatum = {
  version: string;
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
      <p className="text-muted-foreground">Safety score: {item.score}</p>
      <p className="text-muted-foreground">Prompt coverage: {item.coverage}%</p>
      <p className="text-muted-foreground">Evaluations: {item.evaluations}</p>
    </div>
  );
}

export function WorkspaceTrendChart({
  title = "Score trend over versions",
  description = "Track whether each iteration is improving across safety score and prompt coverage.",
  data,
}: WorkspaceTrendChartProps) {
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
              <XAxis dataKey="version" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis domain={[50, 100]} tickLine={false} axisLine={false} tickMargin={10} />
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
