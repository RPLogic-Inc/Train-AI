// Database schema for Drizzle ORM + Neon Postgres
// This is ready for when you provision a Neon database via Vercel Marketplace.
// For now, the app runs with in-memory demo data.

// import { pgTable, text, integer, real, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
//
// export const users = pgTable("users", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   email: text("email").notNull().unique(),
//   name: text("name"),
//   restingHR: integer("resting_hr"),
//   maxHR: integer("max_hr"),
//   lthr: integer("lthr"),
//   runFTP: integer("run_ftp"),
//   bikeFTP: integer("bike_ftp"),
//   swimCSS: integer("swim_css"),
//   vo2max: real("vo2max"),
//   weeklyHoursAvailable: integer("weekly_hours_available"),
//   goalRace: text("goal_race"),
//   goalRaceDate: text("goal_race_date"),
//   goalRaceType: text("goal_race_type"),
//   garminAccessToken: text("garmin_access_token"),
//   garminRefreshToken: text("garmin_refresh_token"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });
//
// export const activities = pgTable("activities", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   userId: uuid("user_id").references(() => users.id).notNull(),
//   date: text("date").notNull(),
//   sport: text("sport").notNull(),
//   name: text("name").notNull(),
//   durationSeconds: integer("duration_seconds").notNull(),
//   distanceMeters: real("distance_meters"),
//   avgHeartRate: integer("avg_heart_rate"),
//   maxHeartRate: integer("max_heart_rate"),
//   calories: integer("calories"),
//   tss: real("tss"),
//   avgPace: real("avg_pace"),
//   avgPower: real("avg_power"),
//   elevationGain: real("elevation_gain"),
//   cadence: integer("cadence"),
//   zones: jsonb("zones"),
//   rawFitData: jsonb("raw_fit_data"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });
//
// export const dailyMetrics = pgTable("daily_metrics", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   userId: uuid("user_id").references(() => users.id).notNull(),
//   date: text("date").notNull(),
//   tss: real("tss"),
//   ctl: real("ctl"),
//   atl: real("atl"),
//   tsb: real("tsb"),
// });

export {};
