import type { Activity, DailyMetrics, ZoneDistribution, WeeklySummary, SportType } from "./types";

/**
 * Heart rate zones based on lactate threshold HR (Coggan zones)
 */
export function getHRZones(lthr: number) {
  return {
    zone1: { min: 0, max: Math.round(lthr * 0.81), name: "Recovery", color: "#6b7280" },
    zone2: { min: Math.round(lthr * 0.81), max: Math.round(lthr * 0.89), name: "Aerobic", color: "#3b82f6" },
    zone3: { min: Math.round(lthr * 0.89), max: Math.round(lthr * 0.93), name: "Tempo", color: "#22c55e" },
    zone4: { min: Math.round(lthr * 0.93), max: Math.round(lthr * 1.0), name: "Threshold", color: "#f59e0b" },
    zone5: { min: Math.round(lthr * 1.0), max: Math.round(lthr * 1.15), name: "VO2max", color: "#ef4444" },
  };
}

/**
 * Calculate TRIMP (Training Impulse) from heart rate data
 * Uses Banister's TRIMP formula
 */
export function calculateTRIMP(
  durationMinutes: number,
  avgHR: number,
  restingHR: number,
  maxHR: number,
  sex: "male" | "female" = "male"
): number {
  const deltaHR = (avgHR - restingHR) / (maxHR - restingHR);
  const clampedDelta = Math.max(0, Math.min(1, deltaHR));

  const weighting =
    sex === "male"
      ? 0.64 * Math.exp(1.92 * clampedDelta)
      : 0.86 * Math.exp(1.67 * clampedDelta);

  return Math.round(durationMinutes * clampedDelta * weighting);
}

/**
 * Estimate TSS from heart rate when power data isn't available
 * hrTSS = (duration × TRIMP_factor × IF²) / 36
 */
export function estimateHRBasedTSS(
  durationSeconds: number,
  avgHR: number,
  restingHR: number,
  maxHR: number,
  lthr: number
): number {
  const durationHours = durationSeconds / 3600;
  const hrReserve = (avgHR - restingHR) / (maxHR - restingHR);
  const lthrReserve = (lthr - restingHR) / (maxHR - restingHR);
  const intensityFactor = hrReserve / lthrReserve;

  return Math.round(durationHours * 100 * intensityFactor * intensityFactor);
}

/**
 * Calculate Chronic Training Load (CTL), Acute Training Load (ATL),
 * and Training Stress Balance (TSB) from activity history
 *
 * CTL = exponential moving average, 42-day time constant (fitness)
 * ATL = exponential moving average, 7-day time constant (fatigue)
 * TSB = CTL - ATL (form)
 */
export function calculatePMC(
  activities: Activity[],
  startDate: string,
  endDate: string,
  initialCTL: number = 0,
  initialATL: number = 0
): DailyMetrics[] {
  const TAU_CTL = 42;
  const TAU_ATL = 7;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const metrics: DailyMetrics[] = [];

  // Build a map of date -> total TSS
  const tssMap = new Map<string, number>();
  for (const activity of activities) {
    const dateKey = activity.date.split("T")[0];
    tssMap.set(dateKey, (tssMap.get(dateKey) || 0) + activity.tss);
  }

  let ctl = initialCTL;
  let atl = initialATL;

  const current = new Date(start);
  while (current <= end) {
    const dateKey = current.toISOString().split("T")[0];
    const dailyTSS = tssMap.get(dateKey) || 0;

    ctl = ctl + (dailyTSS - ctl) / TAU_CTL;
    atl = atl + (dailyTSS - atl) / TAU_ATL;
    const tsb = ctl - atl;

    metrics.push({
      date: dateKey,
      tss: dailyTSS,
      ctl: Math.round(ctl * 10) / 10,
      atl: Math.round(atl * 10) / 10,
      tsb: Math.round(tsb * 10) / 10,
    });

    current.setDate(current.getDate() + 1);
  }

  return metrics;
}

/**
 * Calculate weekly summaries from activities
 */
export function calculateWeeklySummaries(
  activities: Activity[],
  pmcData: DailyMetrics[]
): WeeklySummary[] {
  const weekMap = new Map<string, Activity[]>();

  for (const activity of activities) {
    const date = new Date(activity.date);
    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7));
    const weekKey = monday.toISOString().split("T")[0];

    if (!weekMap.has(weekKey)) weekMap.set(weekKey, []);
    weekMap.get(weekKey)!.push(activity);
  }

  const summaries: WeeklySummary[] = [];

  for (const [weekStart, weekActivities] of weekMap) {
    const sportBreakdown = {} as Record<SportType, { duration: number; tss: number; distance: number }>;
    let totalTSS = 0;
    let totalDuration = 0;
    let totalDistance = 0;

    for (const a of weekActivities) {
      if (!sportBreakdown[a.sport]) {
        sportBreakdown[a.sport] = { duration: 0, tss: 0, distance: 0 };
      }
      sportBreakdown[a.sport].duration += a.durationSeconds;
      sportBreakdown[a.sport].tss += a.tss;
      sportBreakdown[a.sport].distance += a.distanceMeters;
      totalTSS += a.tss;
      totalDuration += a.durationSeconds;
      totalDistance += a.distanceMeters;
    }

    // Find average TSB for this week from PMC data
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split("T")[0];
    const weekPMC = pmcData.filter(
      (d) => d.date >= weekStart && d.date <= weekEndStr
    );
    const avgTSB =
      weekPMC.length > 0
        ? weekPMC.reduce((sum, d) => sum + d.tsb, 0) / weekPMC.length
        : 0;

    summaries.push({
      weekStart,
      totalTSS: Math.round(totalTSS),
      totalDuration,
      totalDistance: Math.round(totalDistance),
      sportBreakdown,
      avgTSB: Math.round(avgTSB * 10) / 10,
    });
  }

  return summaries.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

/**
 * Aggregate zone distribution across activities
 */
export function aggregateZones(activities: Activity[]): ZoneDistribution {
  const total: ZoneDistribution = { zone1: 0, zone2: 0, zone3: 0, zone4: 0, zone5: 0 };
  for (const a of activities) {
    if (a.zones) {
      total.zone1 += a.zones.zone1;
      total.zone2 += a.zones.zone2;
      total.zone3 += a.zones.zone3;
      total.zone4 += a.zones.zone4;
      total.zone5 += a.zones.zone5;
    }
  }
  return total;
}

/**
 * Calculate CTL ramp rate (TSS/week change) - should not exceed 5-8 TSS/week
 */
export function getCTLRampRate(pmcData: DailyMetrics[]): number {
  if (pmcData.length < 14) return 0;
  const recent = pmcData[pmcData.length - 1].ctl;
  const twoWeeksAgo = pmcData[pmcData.length - 14].ctl;
  return Math.round(((recent - twoWeeksAgo) / 2) * 10) / 10;
}

/**
 * Determine training phase based on weeks to race
 */
export function getTrainingPhase(weeksToRace: number): string {
  if (weeksToRace > 16) return "Base";
  if (weeksToRace > 8) return "Build";
  if (weeksToRace > 3) return "Peak";
  if (weeksToRace > 0) return "Taper";
  return "Recovery";
}

/**
 * Format duration in seconds to human readable
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/**
 * Format pace (sec/km) to min:sec string
 */
export function formatPace(secPerKm: number): string {
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, "0")} /km`;
}

/**
 * Format distance in meters to km
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}
