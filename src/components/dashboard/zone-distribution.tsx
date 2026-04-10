"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ZoneDistribution as ZoneType } from "@/lib/types";

interface ZoneDistributionProps {
  zones: ZoneType;
}

const zoneConfig = [
  { key: "zone1", name: "Z1 Recovery", color: "#6b7280" },
  { key: "zone2", name: "Z2 Aerobic", color: "#3b82f6" },
  { key: "zone3", name: "Z3 Tempo", color: "#22c55e" },
  { key: "zone4", name: "Z4 Threshold", color: "#f59e0b" },
  { key: "zone5", name: "Z5 VO2max", color: "#ef4444" },
];

export function ZoneDistribution({ zones }: ZoneDistributionProps) {
  const totalSeconds =
    zones.zone1 + zones.zone2 + zones.zone3 + zones.zone4 + zones.zone5;

  const chartData = zoneConfig.map((z) => {
    const seconds = zones[z.key as keyof ZoneType];
    return {
      name: z.name,
      percentage: totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0,
      hours: Math.round(seconds / 360) / 10,
      color: z.color,
    };
  });

  // Check polarization: Z1+Z2 should be ~80%
  const easyPct = chartData[0].percentage + chartData[1].percentage;
  const hardPct = chartData[3].percentage + chartData[4].percentage;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heart Rate Zone Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Time in each zone (last 4 weeks) &mdash;{" "}
          <span className={easyPct >= 75 ? "text-green-500" : "text-amber-500"}>
            {easyPct}% easy
          </span>{" "}
          / {hardPct}% hard
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value}%`, "Time"]}
              />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
