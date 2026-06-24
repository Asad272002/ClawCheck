"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";

type OverviewChartDatum = {
  label: string;
  value: number;
  color: string;
};

type OverviewChartCardProps = {
  title: string;
  description: string;
  value: string;
  helper: string;
  data: OverviewChartDatum[];
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    payload?: OverviewChartDatum;
  }>;
};

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;

  if (!item) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-popover/95 px-3 py-2 text-sm shadow-[0_16px_40px_rgba(15,23,42,0.14)] backdrop-blur">
      <p className="font-semibold text-popover-foreground">{item.label}</p>
      <p className="text-muted-foreground">{item.value}</p>
    </div>
  );
}

export function OverviewChartCard({
  title,
  description,
  value,
  helper,
  data,
}: OverviewChartCardProps) {
  return (
    <Card className="surface-card h-full">
      <CardContent className="space-y-5 p-5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative size-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<ChartTooltip />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={34}
                  outerRadius={52}
                  paddingAngle={3}
                  cornerRadius={6}
                  stroke="transparent"
                  isAnimationActive
                  animationDuration={900}
                >
                  {data.map((item) => (
                    <Cell key={item.label} fill={item.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
              <p className="text-[11px] text-muted-foreground">{helper}</p>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            {data.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </div>
                <span className="font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
