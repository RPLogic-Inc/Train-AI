"use client";

import { useTraining } from "@/lib/training-context";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { PMCChart } from "@/components/dashboard/pmc-chart";
import { TrainingLoadChart } from "@/components/dashboard/training-load-chart";
import { ZoneDistribution } from "@/components/dashboard/zone-distribution";
import { ActivityTable } from "@/components/dashboard/activity-table";

export default function DashboardPage() {
  const { activities, profile, pmcData, weeklySummaries, zoneData } =
    useTraining();

  const latestPMC = pmcData[pmcData.length - 1];
  const currentWeek = weeklySummaries[weeklySummaries.length - 1];

  if (!latestPMC) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">No training data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Training overview for {profile.name}
        </p>
      </div>

      <MetricsCards
        latestPMC={latestPMC}
        currentWeek={currentWeek}
        profile={profile}
      />

      <PMCChart data={pmcData} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TrainingLoadChart data={weeklySummaries} />
        <ZoneDistribution zones={zoneData} />
      </div>

      <ActivityTable activities={activities} />
    </div>
  );
}
