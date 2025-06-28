import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workoutRoutines = pgTable("workout_routines", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  exercises: text("exercises").array().notNull(),
  duration: integer("duration"), // in minutes
});

export const workoutSessions = pgTable("workout_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  routineId: integer("routine_id"),
  duration: integer("duration"), // in minutes
  completedAt: timestamp("completed_at").notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  workoutReminderEnabled: boolean("workout_reminder_enabled").default(true),
  workoutReminderTime: text("workout_reminder_time").default("08:00"),
  affirmationEnabled: boolean("affirmation_enabled").default(true),
  affirmationTime: text("affirmation_time").default("07:00"),
  darkMode: boolean("dark_mode").default(false),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  isPro: boolean("is_pro").default(false),
  proExpiresAt: timestamp("pro_expires_at"),
  dailyAiQuestions: integer("daily_ai_questions").default(0),
  lastAiQuestionDate: timestamp("last_ai_question_date"),
});

export const affirmationHistory = pgTable("affirmation_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  affirmation: text("affirmation").notNull(),
  date: timestamp("date").notNull(),
});

export type UpsertUser = typeof users.$inferInsert;

export const insertWorkoutRoutineSchema = createInsertSchema(workoutRoutines).omit({
  id: true,
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({
  id: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});

export const insertAffirmationHistorySchema = createInsertSchema(affirmationHistory).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type WorkoutRoutine = typeof workoutRoutines.$inferSelect;
export type InsertWorkoutRoutine = z.infer<typeof insertWorkoutRoutineSchema>;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type AffirmationHistory = typeof affirmationHistory.$inferSelect;
export type InsertAffirmationHistory = z.infer<typeof insertAffirmationHistorySchema>;
