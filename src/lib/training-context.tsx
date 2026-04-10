"use client";

import { createContext, useContext, useState, useMemo, useCallback } from "react";
import type { Activity, AthleteProfile, DailyMetrics, WeeklySummary } from "./types";
import { generateDemoActivities, demoProfile } from "./demo-data";
import { calculatePMC, calculateWeeklySummaries, aggregateZones } from "./training";
import { buildCoachSystemPrompt } from "./ai-coach";

interface TrainingState {
  activities: Activity[];
  profile: AthleteProfile;
  pmcData: DailyMetrics[];
  weeklySummaries: WeeklySummary[];
  zoneData: ReturnType<typeof aggregateZones>;
  coachSystemPrompt: string;
  addActivities: (newActivities: Activity[]) => void;
}

const TrainingContext = createContext<TrainingState | null>(null);

export function TrainingProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(() =>
    generateDemoActivities()
  );
  const [profile] = useState<AthleteProfile>(demoProfile);

  const addActivities = useCallback((newActivities: Activity[]) => {
    setActivities((prev) => [...prev, ...newActivities]);
  }, []);

  const { pmcData, weeklySummaries, zoneData, coachSystemPrompt } = useMemo(() => {
    const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date));

    const today = new Date().toISOString().split("T")[0];
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const startDate = ninetyDaysAgo.toISOString().split("T")[0];

    const pmc = calculatePMC(sorted, startDate, today);
    const weekly = calculateWeeklySummaries(sorted, pmc);

    // Aggregate zones from last 4 weeks of activities
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const fourWeeksStr = fourWeeksAgo.toISOString().split("T")[0];
    const recentActivities = sorted.filter((a) => a.date >= fourWeeksStr);
    const zones = aggregateZones(recentActivities);

    const systemPrompt = buildCoachSystemPrompt(profile, pmc, weekly);

    return {
      pmcData: pmc,
      weeklySummaries: weekly,
      zoneData: zones,
      coachSystemPrompt: systemPrompt,
    };
  }, [activities, profile]);

  return (
    <TrainingContext.Provider
      value={{
        activities,
        profile,
        pmcData,
        weeklySummaries,
        zoneData,
        coachSystemPrompt,
        addActivities,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error("useTraining must be used within a TrainingProvider");
  }
  return context;
}
