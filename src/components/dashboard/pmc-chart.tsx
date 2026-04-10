"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyMetrics } from "@/lib/types";

interface PMCChartProps {
  data: DailyMetrics[];
}

export function PMCChart({ data }: PMCChartProps) {
  // Show last 60 days for readability
  const chartData = data.slice(-60).map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Management Chart</CardTitle>
        <p className="text-sm text-muted-foreground">
          CTL (Fitness), ATL (Fatigue), TSB (Form) over the last 60 days
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                interval="preserveStartEnd"
                tickCount={8}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />

              <Area
                type="monotone"
                dataKey="tsb"
                stroke="hsl(142 76% 36%)"
                fill="hsl(142 76% 36% / 0.15)"
                strokeWidth={1.5}
                name="Form (TSB)"
              />
              <Line
                type="monotone"
                dataKey="ctl"
                stroke="hsl(221 83% 53%)"
                strokeWidth={2}
                dot={false}
                name="Fitness (CTL)"
              />
              <Line
                type="monotone"
                dataKey="atl"
                stroke="hsl(0 84% 60%)"
                strokeWidth={2}
                dot={false}
                name="Fatigue (ATL)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
