"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type RiskBreakdownProps = {
  title?: string;
  description?: string;
  data: Array<{ name: string; score: number }>;
  mode?: "bar" | "pie";
};

const PIE_COLORS = ["#5aa7ff", "#3dd7a0", "#fbbf24", "#fb7185", "#a78bfa", "#67e8f9"];

export function RiskBreakdown({ title = "Risk category chart", description = "Category-level safety score distribution.", data, mode = "bar" }: RiskBreakdownProps) {
  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "pie" ? (
            <PieChart>
              <Pie data={data} dataKey="score" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                {data.map((entry, index) => <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.16)" />
              <XAxis dataKey="name" stroke="rgba(148,163,184,0.7)" fontSize={12} />
              <YAxis stroke="rgba(148,163,184,0.7)" fontSize={12} />
              <Tooltip
                cursor={{ fill: "rgba(59,130,246,0.08)" }}
                contentStyle={{
                  background: "color-mix(in oklch, var(--popover) 96%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--border) 90%, transparent)",
                  borderRadius: 16,
                  boxShadow: "0 16px 40px rgba(15,23,42,0.12)",
                }}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="oklch(0.58 0.19 260)" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
