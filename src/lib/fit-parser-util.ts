import type { Activity, ZoneDistribution } from "./types";

interface FitRecord {
  heart_rate?: number;
  timestamp?: Date;
  speed?: number;
  enhanced_speed?: number;
  distance?: number;
  cadence?: number;
  power?: number;
  altitude?: number;
  enhanced_altitude?: number;
  position_lat?: number;
  position_long?: number;
}

interface FitSession {
  sport?: string;
  sub_sport?: string;
  total_timer_time?: number;
  total_distance?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  total_calories?: number;
  avg_cadence?: number;
  avg_power?: number;
  total_ascent?: number;
  avg_speed?: number;
  enhanced_avg_speed?: number;
  timestamp?: Date;
  start_time?: Date;
}

/**
 * Parse a FIT file buffer into an Activity object
 * Uses the fit-file-parser package
 */
export async function parseFitFile(
  buffer: ArrayBuffer,
  restingHR: number,
  maxHR: number,
  lthr: number
): Promise<Activity> {
  // Dynamic import to avoid SSR issues
  const FitParser = (await import("fit-file-parser")).default;

  const fitParser = new FitParser({
    force: true,
    speedUnit: "m/s",
    lengthUnit: "m",
    temperatureUnit: "celsius",
    elapsedRecordField: true,
    mode: "list",
  });

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fitParser.parse(Buffer.from(buffer), (error: any, data: any) => {
      if (error) {
        reject(new Error(String(error)));
        return;
      }

      const session = data.sessions?.[0];
      if (!session) {
        reject(new Error("No session data found in FIT file"));
        return;
      }

      const records = data.records || [];
      const durationSeconds = Math.round(session.total_timer_time || 0);
      const avgHR = session.avg_heart_rate || 0;
      const avgSpeed = session.enhanced_avg_speed || session.avg_speed || 0;

      // Calculate TSS from HR
      const hrReserve = (avgHR - restingHR) / (maxHR - restingHR);
      const lthrReserve = (lthr - restingHR) / (maxHR - restingHR);
      const intensityFactor = lthrReserve > 0 ? hrReserve / lthrReserve : 0;
      const tss = Math.round((durationSeconds / 3600) * 100 * intensityFactor * intensityFactor);

      // Calculate zone distribution from records
      const zones = calculateZonesFromRecords(records, lthr);

      // Determine sport type
      const sportMap: Record<string, Activity["sport"]> = {
        running: "run",
        cycling: "bike",
        swimming: "swim",
        trail_running: "run",
        open_water_swimming: "swim",
        mountain_biking: "bike",
      };
      const sport = sportMap[session.sport || ""] || "other";

      // Calculate pace for running
      let avgPace: number | undefined;
      if (sport === "run" && avgSpeed > 0) {
        avgPace = Math.round(1000 / avgSpeed);
      }

      const activity: Activity = {
        id: `fit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: (session.start_time || session.timestamp || new Date()).toISOString().split("T")[0],
        sport,
        name: `${session.sport || "Activity"} - ${session.sub_sport || "general"}`,
        durationSeconds,
        distanceMeters: Math.round(session.total_distance || 0),
        avgHeartRate: avgHR,
        maxHeartRate: session.max_heart_rate || 0,
        calories: session.total_calories || 0,
        tss,
        avgPace,
        avgPower: session.avg_power,
        elevationGain: session.total_ascent,
        cadence: session.avg_cadence,
        zones,
      };

      resolve(activity);
    });
  });
}

function calculateZonesFromRecords(records: FitRecord[], lthr: number): ZoneDistribution {
  const zones: ZoneDistribution = { zone1: 0, zone2: 0, zone3: 0, zone4: 0, zone5: 0 };

  const z1Max = lthr * 0.81;
  const z2Max = lthr * 0.89;
  const z3Max = lthr * 0.93;
  const z4Max = lthr * 1.0;

  for (const record of records) {
    const hr = record.heart_rate;
    if (!hr) continue;

    // Each record represents ~1 second
    if (hr < z1Max) zones.zone1++;
    else if (hr < z2Max) zones.zone2++;
    else if (hr < z3Max) zones.zone3++;
    else if (hr < z4Max) zones.zone4++;
    else zones.zone5++;
  }

  return zones;
}
