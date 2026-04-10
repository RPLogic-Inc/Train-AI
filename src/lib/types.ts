export type SportType = "run" | "bike" | "swim" | "strength" | "other";

export interface Activity {
  id: string;
  date: string; // ISO date string
  sport: SportType;
  name: string;
  durationSeconds: number;
  distanceMeters: number;
  avgHeartRate: number;
  maxHeartRate: number;
  calories: number;
  tss: number;
  avgPace?: number; // seconds per km
  avgPower?: number; // watts
  elevationGain?: number;
  cadence?: number;
  description?: string;
  zones?: ZoneDistribution;
}

export interface ZoneDistribution {
  zone1: number; // seconds in zone
  zone2: number;
  zone3: number;
  zone4: number;
  zone5: number;
}

export interface DailyMetrics {
  date: string;
  tss: number;
  ctl: number; // chronic training load (fitness)
  atl: number; // acute training load (fatigue)
  tsb: number; // training stress balance (form)
}

export interface AthleteProfile {
  name: string;
  age: number;
  restingHR: number;
  maxHR: number;
  lthr: number; // lactate threshold heart rate
  runFTP?: number; // functional threshold pace (sec/km)
  bikeFTP?: number; // functional threshold power (watts)
  swimCSS?: number; // critical swim speed (sec/100m)
  vo2max?: number;
  weeklyHoursAvailable: number;
  goalRace?: string;
  goalRaceDate?: string;
  goalRaceType?: "5k" | "10k" | "half_marathon" | "marathon" | "sprint_tri" | "olympic_tri" | "half_ironman" | "ironman";
}

export interface WeeklySummary {
  weekStart: string;
  totalTSS: number;
  totalDuration: number; // seconds
  totalDistance: number; // meters
  sportBreakdown: Record<SportType, { duration: number; tss: number; distance: number }>;
  avgTSB: number;
}

export interface TrainingRecommendation {
  overallAssessment: string;
  currentPhase: string;
  fatigueRisk: "low" | "moderate" | "high";
  recommendations: string[];
  suggestedWorkouts: SuggestedWorkout[];
}

export interface SuggestedWorkout {
  day: string;
  sport: SportType;
  name: string;
  duration: string;
  description: string;
  targetTSS: number;
  intensity: "recovery" | "easy" | "moderate" | "threshold" | "vo2max";
}
