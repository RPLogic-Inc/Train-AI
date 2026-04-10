"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DailyMetrics, WeeklySummary, AthleteProfile } from "@/lib/types";
import { formatDuration, getTrainingPhase } from "@/lib/training";
import { TrendingUp, TrendingDown, Heart, Zap, Timer, Target } from "lucide-react";

interface MetricsCardsProps {
  latestPMC: DailyMetrics;
  currentWeek: WeeklySummary | undefined;
  profile: AthleteProfile;
}

export function MetricsCards({ latestPMC, currentWeek, profile }: MetricsCardsProps) {
  const weeksToRace = profile.goalRaceDate
    ? Math.round(
        (new Date(profile.goalRaceDate).getTime() - Date.now()) /
          (7 * 24 * 60 * 60 * 1000)
      )
    : null;

  const phase = weeksToRace !== null ? getTrainingPhase(weeksToRace) : "General";

  const tsbStatus =
    latestPMC.tsb < -30
      ? { label: "Overreaching", variant: "destructive" as const }
      : latestPMC.tsb < -10
        ? { label: "Productive", variant: "default" as const }
        : latestPMC.tsb < 5
          ? { label: "Neutral", variant: "secondary" as const }
          : { label: "Fresh", variant: "outline" as const };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Fitness (CTL)
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{latestPMC.ctl}</div>
          <p className="text-xs text-muted-foreground">
            Chronic Training Load
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Form (TSB)
          </CardTitle>
          {latestPMC.tsb >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-amber-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{latestPMC.tsb}</span>
            <Badge variant={tsbStatus.variant}>{tsbStatus.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Fatigue: {latestPMC.atl} ATL
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            This Week
          </CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currentWeek ? currentWeek.totalTSS : 0} TSS
          </div>
          <p className="text-xs text-muted-foreground">
            {currentWeek
              ? formatDuration(currentWeek.totalDuration)
              : "0h 0m"}{" "}
            training time
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Race Countdown
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {weeksToRace !== null ? `${weeksToRace} weeks` : "No race"}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {profile.goalRace || "Set a goal race"}
            </p>
            {weeksToRace !== null && (
              <Badge variant="secondary">{phase}</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
