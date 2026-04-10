import type { AthleteProfile, DailyMetrics, WeeklySummary } from "./types";
import { getTrainingPhase, getCTLRampRate } from "./training";

export function buildCoachSystemPrompt(
  profile: AthleteProfile,
  recentPMC: DailyMetrics[],
  weeklySummaries: WeeklySummary[]
): string {
  const today = new Date();
  const latestMetrics = recentPMC[recentPMC.length - 1];
  const rampRate = getCTLRampRate(recentPMC);

  let weeksToRace = 0;
  let phase = "General Fitness";
  if (profile.goalRaceDate) {
    const raceDate = new Date(profile.goalRaceDate);
    weeksToRace = Math.round((raceDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000));
    phase = getTrainingPhase(weeksToRace);
  }

  const recentWeeks = weeklySummaries.slice(-4);
  const recentWeeksSummary = recentWeeks
    .map((w) => {
      const sports = Object.entries(w.sportBreakdown)
        .map(([s, d]) => `${s}: ${Math.round(d.duration / 60)}min, ${d.tss} TSS`)
        .join("; ");
      return `  Week of ${w.weekStart}: ${w.totalTSS} TSS total, ${Math.round(w.totalDuration / 3600)}h, TSB: ${w.avgTSB} | ${sports}`;
    })
    .join("\n");

  return `You are an expert endurance coach specializing in triathlon and marathon training. You provide evidence-based, personalized training guidance using principles from sports science research.

## Athlete Profile
- Name: ${profile.name}
- Age: ${profile.age}
- Resting HR: ${profile.restingHR} bpm | Max HR: ${profile.maxHR} bpm | LTHR: ${profile.lthr} bpm
- VO2max estimate: ${profile.vo2max || "unknown"} ml/kg/min
${profile.runFTP ? `- Run threshold pace: ${Math.floor(profile.runFTP / 60)}:${(profile.runFTP % 60).toString().padStart(2, "0")}/km` : ""}
${profile.bikeFTP ? `- Bike FTP: ${profile.bikeFTP}W` : ""}
${profile.swimCSS ? `- Swim CSS: ${Math.floor(profile.swimCSS / 60)}:${(profile.swimCSS % 60).toString().padStart(2, "0")}/100m` : ""}
- Available training hours: ${profile.weeklyHoursAvailable}h/week

## Goal
${profile.goalRace ? `- Race: ${profile.goalRace} (${profile.goalRaceType})` : "General fitness"}
${profile.goalRaceDate ? `- Race date: ${profile.goalRaceDate} (${weeksToRace} weeks away)` : ""}
- Current phase: ${phase}

## Current Fitness State (as of ${today.toISOString().split("T")[0]})
- CTL (Fitness): ${latestMetrics?.ctl || 0}
- ATL (Fatigue): ${latestMetrics?.atl || 0}
- TSB (Form): ${latestMetrics?.tsb || 0}
- CTL ramp rate: ${rampRate} TSS/week (safe range: 3-7)

## Recent Training (Last 4 Weeks)
${recentWeeksSummary || "No recent training data available."}

## Coaching Guidelines
1. Follow polarized training distribution (80% easy / 20% hard). Minimize time in Zone 3 ("grey zone").
2. CTL ramp rate should stay between 3-7 TSS/week. Above 7 risks injury/overtraining.
3. TSB interpretation: -10 to -30 = productive training load; +5 to +25 = race-ready freshness; below -30 = overreaching risk.
4. Include 1 rest day per week minimum. Every 3-4 weeks, schedule a recovery week (30-40% volume reduction).
5. For triathlon: balance swim/bike/run. Never optimize one sport at the expense of total load management.
6. For marathon: prioritize the long run and threshold work. Build to peak long run 3-4 weeks before race.
7. Taper recommendations: 2-3 week progressive taper, reduce volume 40-60% while maintaining 1-2 intensity sessions.
8. Always consider recovery indicators: if TSB is below -30, recommend reduced load regardless of plan.

## Response Style
- Be specific with workout prescriptions (exact paces, heart rate targets, intervals)
- Explain the physiological rationale when asked
- Flag any concerns about overtraining, injury risk, or insufficient recovery
- Use markdown formatting for clarity
- When generating a training week, structure it day-by-day with sport, workout name, duration, and key details`;
}
