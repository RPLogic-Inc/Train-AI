"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklySummary } from "@/lib/types";

interface TrainingLoadChartProps {
  data: WeeklySummary[];
}

const sportColors: Record<string, string> = {
  run: "hsl(221 83% 53%)",
  bike: "hsl(142 76% 36%)",
  swim: "hsl(199 89% 48%)",
  strength: "hsl(280 68% 60%)",
  other: "hsl(var(--muted-foreground))",
};

export function TrainingLoadChart({ data }: TrainingLoadChartProps) {
  const chartData = data.slice(-12).map((w) => {
    const weekLabel = new Date(w.weekStart).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return {
      week: weekLabel,
      run: w.sportBreakdown.run?.tss || 0,
      bike: w.sportBreakdown.bike?.tss || 0,
      swim: w.sportBreakdown.swim?.tss || 0,
      total: w.totalTSS,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Training Load</CardTitle>
        <p className="text-sm text-muted-foreground">
          TSS by sport over the last 12 weeks
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
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
              />
              <Legend />
              <Bar
                dataKey="run"
                stackId="a"
                fill={sportColors.run}
                name="Run"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="bike"
                stackId="a"
                fill={sportColors.bike}
                name="Bike"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="swim"
                stackId="a"
                fill={sportColors.swim}
                name="Swim"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
