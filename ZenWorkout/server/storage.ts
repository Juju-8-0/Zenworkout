import {
  users, workoutRoutines, workoutSessions, userSettings, affirmationHistory,
  type User, type UpsertUser, type WorkoutRoutine, type InsertWorkoutRoutine,
  type WorkoutSession, type InsertWorkoutSession, type UserSettings, type InsertUserSettings,
  type AffirmationHistory, type InsertAffirmationHistory
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User management for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Workout routines
  getWorkoutRoutines(userId: string): Promise<WorkoutRoutine[]>;
  getWorkoutRoutine(id: number): Promise<WorkoutRoutine | undefined>;
  createWorkoutRoutine(routine: InsertWorkoutRoutine): Promise<WorkoutRoutine>;
  updateWorkoutRoutine(id: number, routine: Partial<InsertWorkoutRoutine>): Promise<WorkoutRoutine | undefined>;
  deleteWorkoutRoutine(id: number): Promise<boolean>;

  // Workout sessions
  getWorkoutSessions(userId: string): Promise<WorkoutSession[]>;
  getRecentWorkoutSessions(userId: string, days: number): Promise<WorkoutSession[]>;
  createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession>;

  // User settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  updateUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings>;

  // Affirmation history
  getAffirmationHistory(userId: string): Promise<AffirmationHistory[]>;
  addAffirmationHistory(affirmation: InsertAffirmationHistory): Promise<AffirmationHistory>;

  // AI Chat
  canUserAskAI(userId: string): Promise<{ canAsk: boolean; questionsLeft: number }>;
  incrementAIQuestions(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Workout routines
  async getWorkoutRoutines(userId: string): Promise<WorkoutRoutine[]> {
    return await db.select().from(workoutRoutines).where(eq(workoutRoutines.userId, userId));
  }

  async getWorkoutRoutine(id: number): Promise<WorkoutRoutine | undefined> {
    const [routine] = await db.select().from(workoutRoutines).where(eq(workoutRoutines.id, id));
    return routine;
  }

  async createWorkoutRoutine(routine: InsertWorkoutRoutine): Promise<WorkoutRoutine> {
    const [newRoutine] = await db.insert(workoutRoutines).values(routine).returning();
    return newRoutine;
  }

  async updateWorkoutRoutine(id: number, routine: Partial<InsertWorkoutRoutine>): Promise<WorkoutRoutine | undefined> {
    const [updated] = await db
      .update(workoutRoutines)
      .set(routine)
      .where(eq(workoutRoutines.id, id))
      .returning();
    return updated;
  }

  async deleteWorkoutRoutine(id: number): Promise<boolean> {
    const result = await db.delete(workoutRoutines).where(eq(workoutRoutines.id, id));
    return result.rowCount > 0;
  }

  // Workout sessions
  async getWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
    return await db.select().from(workoutSessions).where(eq(workoutSessions.userId, userId));
  }

  async getRecentWorkoutSessions(userId: string, days: number): Promise<WorkoutSession[]> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId))
      .orderBy(workoutSessions.completedAt);
  }

  async createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession> {
    const [newSession] = await db.insert(workoutSessions).values(session).returning();
    return newSession;
  }

  // User settings
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings;
  }

  async updateUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings> {
    const existing = await this.getUserSettings(userId);
    
    if (existing) {
      const [updated] = await db
        .update(userSettings)
        .set(settings)
        .where(eq(userSettings.userId, userId))
        .returning();
      return updated;
    } else {
      const [newSettings] = await db
        .insert(userSettings)
        .values({
          userId,
          workoutReminderEnabled: true,
          workoutReminderTime: "08:00",
          affirmationEnabled: true,
          affirmationTime: "07:00",
          darkMode: false,
          notificationsEnabled: true,
          isPro: false,
          proExpiresAt: null,
          dailyAiQuestions: 0,
          lastAiQuestionDate: null,
          ...settings
        })
        .returning();
      return newSettings;
    }
  }

  // Affirmation history
  async getAffirmationHistory(userId: string): Promise<AffirmationHistory[]> {
    return await db
      .select()
      .from(affirmationHistory)
      .where(eq(affirmationHistory.userId, userId))
      .orderBy(affirmationHistory.date);
  }

  async addAffirmationHistory(affirmation: InsertAffirmationHistory): Promise<AffirmationHistory> {
    const [newAffirmation] = await db.insert(affirmationHistory).values(affirmation).returning();
    return newAffirmation;
  }

  // AI Chat
  async canUserAskAI(userId: string): Promise<{ canAsk: boolean; questionsLeft: number }> {
    const settings = await this.getUserSettings(userId);
    if (!settings) {
      return { canAsk: false, questionsLeft: 0 };
    }

    // Pro users have unlimited questions
    if (settings.isPro) {
      return { canAsk: true, questionsLeft: -1 };
    }

    const today = new Date();
    const lastQuestionDate = settings.lastAiQuestionDate;
    
    // Reset daily count if it's a new day
    if (!lastQuestionDate || lastQuestionDate.toDateString() !== today.toDateString()) {
      await this.updateUserSettings(userId, { 
        dailyAiQuestions: 0, 
        lastAiQuestionDate: today 
      });
      return { canAsk: true, questionsLeft: 2 }; // 3 total - 1 used = 2 left
    }

    const questionsUsed = settings.dailyAiQuestions || 0;
    const questionsLeft = Math.max(0, 3 - questionsUsed);
    
    return { canAsk: questionsLeft > 0, questionsLeft };
  }

  async incrementAIQuestions(userId: string): Promise<void> {
    const settings = await this.getUserSettings(userId);
    if (!settings) return;

    const today = new Date();
    const newCount = (settings.dailyAiQuestions || 0) + 1;
    
    await this.updateUserSettings(userId, {
      dailyAiQuestions: newCount,
      lastAiQuestionDate: today
    });
  }
}

export const storage = new DatabaseStorage();