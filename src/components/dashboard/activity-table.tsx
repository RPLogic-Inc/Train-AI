"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Activity } from "@/lib/types";
import { formatDuration, formatDistance, formatPace } from "@/lib/training";

interface ActivityTableProps {
  activities: Activity[];
}

const sportBadgeColors: Record<string, string> = {
  run: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  bike: "bg-green-500/15 text-green-400 border-green-500/20",
  swim: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  strength: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  other: "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

export function ActivityTable({ activities }: ActivityTableProps) {
  const recent = activities.slice(-15).reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <p className="text-sm text-muted-foreground">
          Last 15 workouts
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Sport</th>
                <th className="pb-2 pr-4 font-medium">Workout</th>
                <th className="pb-2 pr-4 font-medium text-right">Duration</th>
                <th className="pb-2 pr-4 font-medium text-right">Distance</th>
                <th className="pb-2 pr-4 font-medium text-right">Avg HR</th>
                <th className="pb-2 font-medium text-right">TSS</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge
                      variant="outline"
                      className={sportBadgeColors[activity.sport]}
                    >
                      {activity.sport}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-4 font-medium">{activity.name}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs">
                    {formatDuration(activity.durationSeconds)}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs">
                    {formatDistance(activity.distanceMeters)}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs">
                    {activity.avgHeartRate} bpm
                  </td>
                  <td className="py-2.5 text-right font-mono text-xs font-semibold">
                    {activity.tss}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
