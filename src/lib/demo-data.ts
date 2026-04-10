import type { Activity, AthleteProfile } from "./types";

export const demoProfile: AthleteProfile = {
  name: "Alex Runner",
  age: 34,
  restingHR: 48,
  maxHR: 185,
  lthr: 168,
  runFTP: 270, // 4:30/km
  bikeFTP: 250,
  swimCSS: 95, // 1:35/100m
  vo2max: 52,
  weeklyHoursAvailable: 12,
  goalRace: "Berlin Marathon",
  goalRaceDate: "2026-09-27",
  goalRaceType: "marathon",
};

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateZones(avgHR: number, lthr: number, durationSec: number) {
  const ratio = avgHR / lthr;
  let z1 = 0, z2 = 0, z3 = 0, z4 = 0, z5 = 0;

  if (ratio < 0.82) {
    z1 = durationSec * 0.8;
    z2 = durationSec * 0.2;
  } else if (ratio < 0.89) {
    z1 = durationSec * 0.2;
    z2 = durationSec * 0.6;
    z3 = durationSec * 0.2;
  } else if (ratio < 0.94) {
    z2 = durationSec * 0.2;
    z3 = durationSec * 0.5;
    z4 = durationSec * 0.3;
  } else if (ratio < 1.0) {
    z3 = durationSec * 0.15;
    z4 = durationSec * 0.6;
    z5 = durationSec * 0.25;
  } else {
    z4 = durationSec * 0.3;
    z5 = durationSec * 0.7;
  }

  return {
    zone1: Math.round(z1),
    zone2: Math.round(z2),
    zone3: Math.round(z3),
    zone4: Math.round(z4),
    zone5: Math.round(z5),
  };
}

const runWorkouts = [
  { name: "Easy Run", minDur: 2400, maxDur: 3600, minHR: 130, maxHR: 145, paceRange: [310, 340] },
  { name: "Recovery Run", minDur: 1800, maxDur: 2400, minHR: 120, maxHR: 135, paceRange: [340, 370] },
  { name: "Long Run", minDur: 5400, maxDur: 7200, minHR: 138, maxHR: 155, paceRange: [300, 325] },
  { name: "Tempo Run", minDur: 2400, maxDur: 3600, minHR: 155, maxHR: 168, paceRange: [265, 285] },
  { name: "Interval Session", minDur: 2700, maxDur: 3600, minHR: 160, maxHR: 178, paceRange: [240, 265] },
  { name: "Progression Run", minDur: 3000, maxDur: 4200, minHR: 145, maxHR: 165, paceRange: [275, 310] },
];

const bikeWorkouts = [
  { name: "Easy Ride", minDur: 3600, maxDur: 5400, minHR: 120, maxHR: 140, power: [140, 180] },
  { name: "Endurance Ride", minDur: 5400, maxDur: 10800, minHR: 130, maxHR: 150, power: [160, 200] },
  { name: "Tempo Ride", minDur: 3600, maxDur: 5400, minHR: 148, maxHR: 162, power: [200, 240] },
  { name: "Sweet Spot", minDur: 3600, maxDur: 4800, minHR: 155, maxHR: 168, power: [220, 250] },
];

const swimWorkouts = [
  { name: "Technique Swim", minDur: 2400, maxDur: 3000, minHR: 110, maxHR: 135 },
  { name: "Endurance Swim", minDur: 2700, maxDur: 3600, minHR: 130, maxHR: 150 },
  { name: "Threshold Swim", minDur: 2400, maxDur: 3000, minHR: 150, maxHR: 165 },
];

export function generateDemoActivities(): Activity[] {
  const activities: Activity[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 90);

  // Weekly pattern: Mon=swim, Tue=run intervals, Wed=bike, Thu=run easy, Fri=rest/swim, Sat=long run, Sun=bike long
  const weekPattern: Array<{ sport: "run" | "bike" | "swim" | null; workoutPool: number }> = [
    { sport: "swim", workoutPool: 0 },    // Mon
    { sport: "run", workoutPool: 4 },      // Tue - intervals
    { sport: "bike", workoutPool: 0 },     // Wed
    { sport: "run", workoutPool: 0 },      // Thu - easy
    { sport: "swim", workoutPool: 2 },     // Fri
    { sport: "run", workoutPool: 2 },      // Sat - long run
    { sport: "bike", workoutPool: 1 },     // Sun - endurance ride
  ];

  let idCounter = 1;
  const current = new Date(startDate);

  while (current <= today) {
    const dayOfWeek = current.getDay();
    const adjustedDay = (dayOfWeek + 6) % 7; // Monday = 0
    const plan = weekPattern[adjustedDay];

    // Skip ~15% of workouts randomly (life happens)
    if (plan.sport && Math.random() > 0.15) {
      const dateStr = current.toISOString().split("T")[0];

      if (plan.sport === "run") {
        const workout = runWorkouts[plan.workoutPool] || runWorkouts[0];
        const duration = randomInRange(workout.minDur, workout.maxDur);
        const avgHR = randomInRange(workout.minHR, workout.maxHR);
        const pace = randomInRange(workout.paceRange[0], workout.paceRange[1]);
        const distance = Math.round((duration / pace) * 1000);
        const hrReserve = (avgHR - demoProfile.restingHR) / (demoProfile.maxHR - demoProfile.restingHR);
        const if2 = Math.pow(hrReserve / ((demoProfile.lthr - demoProfile.restingHR) / (demoProfile.maxHR - demoProfile.restingHR)), 2);
        const tss = Math.round((duration / 3600) * 100 * if2);

        activities.push({
          id: `demo-${idCounter++}`,
          date: dateStr,
          sport: "run",
          name: workout.name,
          durationSeconds: duration,
          distanceMeters: distance,
          avgHeartRate: avgHR,
          maxHeartRate: Math.min(avgHR + randomInRange(10, 25), demoProfile.maxHR),
          calories: Math.round(duration / 60 * (avgHR * 0.05)),
          tss,
          avgPace: pace,
          elevationGain: randomInRange(20, 150),
          cadence: randomInRange(170, 185),
          zones: generateZones(avgHR, demoProfile.lthr, duration),
        });
      } else if (plan.sport === "bike") {
        const workout = bikeWorkouts[plan.workoutPool] || bikeWorkouts[0];
        const duration = randomInRange(workout.minDur, workout.maxDur);
        const avgHR = randomInRange(workout.minHR, workout.maxHR);
        const avgPower = randomInRange(workout.power[0], workout.power[1]);
        const if2 = Math.pow(avgPower / (demoProfile.bikeFTP || 250), 2);
        const tss = Math.round((duration / 3600) * 100 * if2);
        const distance = Math.round((avgPower * 0.12) * (duration / 3600) * 1000);

        activities.push({
          id: `demo-${idCounter++}`,
          date: dateStr,
          sport: "bike",
          name: workout.name,
          durationSeconds: duration,
          distanceMeters: distance,
          avgHeartRate: avgHR,
          maxHeartRate: Math.min(avgHR + randomInRange(10, 20), demoProfile.maxHR),
          calories: Math.round(duration / 60 * (avgHR * 0.045)),
          tss,
          avgPower: avgPower,
          elevationGain: randomInRange(100, 600),
          cadence: randomInRange(80, 95),
          zones: generateZones(avgHR, demoProfile.lthr, duration),
        });
      } else if (plan.sport === "swim") {
        const workout = swimWorkouts[plan.workoutPool] || swimWorkouts[0];
        const duration = randomInRange(workout.minDur, workout.maxDur);
        const avgHR = randomInRange(workout.minHR, workout.maxHR);
        const distance = Math.round((duration / 100) * randomInRange(55, 75));
        const hrReserve = (avgHR - demoProfile.restingHR) / (demoProfile.maxHR - demoProfile.restingHR);
        const tss = Math.round((duration / 3600) * 100 * hrReserve * hrReserve * 1.2);

        activities.push({
          id: `demo-${idCounter++}`,
          date: dateStr,
          sport: "swim",
          name: workout.name,
          durationSeconds: duration,
          distanceMeters: distance,
          avgHeartRate: avgHR,
          maxHeartRate: Math.min(avgHR + randomInRange(8, 18), demoProfile.maxHR),
          calories: Math.round(duration / 60 * (avgHR * 0.04)),
          tss,
          zones: generateZones(avgHR, demoProfile.lthr, duration),
        });
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return activities;
}
