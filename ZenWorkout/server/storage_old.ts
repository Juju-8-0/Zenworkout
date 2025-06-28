import { 
  users, workoutRoutines, workoutSessions, userSettings, affirmationHistory,
  type User, type InsertUser, type WorkoutRoutine, type InsertWorkoutRoutine,
  type WorkoutSession, type InsertWorkoutSession, type UserSettings, type InsertUserSettings,
  type AffirmationHistory, type InsertAffirmationHistory
} from "@shared/schema";

export interface IStorage {
  // User management for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Workout routines
  getWorkoutRoutines(userId: number): Promise<WorkoutRoutine[]>;
  getWorkoutRoutine(id: number): Promise<WorkoutRoutine | undefined>;
  createWorkoutRoutine(routine: InsertWorkoutRoutine): Promise<WorkoutRoutine>;
  updateWorkoutRoutine(id: number, routine: Partial<InsertWorkoutRoutine>): Promise<WorkoutRoutine | undefined>;
  deleteWorkoutRoutine(id: number): Promise<boolean>;

  // Workout sessions
  getWorkoutSessions(userId: number): Promise<WorkoutSession[]>;
  getRecentWorkoutSessions(userId: number, days: number): Promise<WorkoutSession[]>;
  createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession>;

  // User settings
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings>;

  // AI Chat
  canUserAskAI(userId: number): Promise<{ canAsk: boolean; questionsLeft: number }>;
  incrementAIQuestions(userId: number): Promise<void>;

  // Affirmation history
  getAffirmationHistory(userId: number): Promise<AffirmationHistory[]>;
  addAffirmationHistory(affirmation: InsertAffirmationHistory): Promise<AffirmationHistory>;
}

export class DatabaseStorage implements IStorage {

  constructor() {
    this.users = new Map();
    this.workoutRoutines = new Map();
    this.workoutSessions = new Map();
    this.userSettings = new Map();
    this.affirmationHistory = new Map();
    this.currentUserId = 1;
    this.currentRoutineId = 1;
    this.currentSessionId = 1;
    this.currentSettingsId = 1;
    this.currentAffirmationId = 1;

    // Create default user and data for demo
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    const defaultUser = await this.createUser({
      username: "demo",
      password: "demo"
    });

    // Create default settings
    await this.updateUserSettings(defaultUser.id, {
      userId: defaultUser.id,
      workoutReminderEnabled: true,
      workoutReminderTime: "08:00",
      affirmationEnabled: true,
      affirmationTime: "07:00",
      darkMode: false,
      notificationsEnabled: true,
    });

    // Create sample routines
    await this.createWorkoutRoutine({
      userId: defaultUser.id,
      name: "Upper Body Strength",
      description: "Focus on building upper body strength",
      duration: 45,
      exercises: ["Push-ups - 3 sets of 12", "Pull-ups - 3 sets of 8", "Bench Press - 4 sets of 10"]
    });

    await this.createWorkoutRoutine({
      userId: defaultUser.id,
      name: "Cardio Blast",
      description: "High-intensity cardio workout",
      duration: 30,
      exercises: ["Jumping Jacks - 3 min", "Burpees - 2 sets of 15", "Mountain Climbers - 3 min"]
    });

    // Create sample workout sessions for the week
    const now = new Date();
    for (let i = 0; i < 3; i++) {
      const sessionDate = new Date(now);
      sessionDate.setDate(now.getDate() - i);
      await this.createWorkoutSession({
        userId: defaultUser.id,
        routineId: 1,
        duration: 45,
        completedAt: sessionDate
      });
    }
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

  async getWorkoutRoutines(userId: number): Promise<WorkoutRoutine[]> {
    return Array.from(this.workoutRoutines.values()).filter(routine => routine.userId === userId);
  }

  async getWorkoutRoutine(id: number): Promise<WorkoutRoutine | undefined> {
    return this.workoutRoutines.get(id);
  }

  async createWorkoutRoutine(routine: InsertWorkoutRoutine): Promise<WorkoutRoutine> {
    const id = this.currentRoutineId++;
    const newRoutine: WorkoutRoutine = { 
      ...routine, 
      id,
      duration: routine.duration ?? null,
      description: routine.description ?? null
    };
    this.workoutRoutines.set(id, newRoutine);
    return newRoutine;
  }

  async updateWorkoutRoutine(id: number, routine: Partial<InsertWorkoutRoutine>): Promise<WorkoutRoutine | undefined> {
    const existing = this.workoutRoutines.get(id);
    if (!existing) return undefined;
    
    const updated: WorkoutRoutine = { ...existing, ...routine };
    this.workoutRoutines.set(id, updated);
    return updated;
  }

  async deleteWorkoutRoutine(id: number): Promise<boolean> {
    return this.workoutRoutines.delete(id);
  }

  async getWorkoutSessions(userId: number): Promise<WorkoutSession[]> {
    return Array.from(this.workoutSessions.values()).filter(session => session.userId === userId);
  }

  async getRecentWorkoutSessions(userId: number, days: number): Promise<WorkoutSession[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return Array.from(this.workoutSessions.values())
      .filter(session => session.userId === userId && session.completedAt >= cutoffDate)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }

  async createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession> {
    const id = this.currentSessionId++;
    const newSession: WorkoutSession = { 
      userId: session.userId,
      completedAt: session.completedAt,
      id,
      routineId: session.routineId ?? null,
      duration: session.duration ?? null
    };
    this.workoutSessions.set(id, newSession);
    return newSession;
  }

  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(settings => settings.userId === userId);
  }

  async updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings> {
    const existing = Array.from(this.userSettings.values()).find(s => s.userId === userId);
    
    if (existing) {
      const updated: UserSettings = { ...existing, ...settings };
      this.userSettings.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentSettingsId++;
      const newSettings: UserSettings = {
        id,
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
      };
      this.userSettings.set(id, newSettings);
      return newSettings;
    }
  }

  async getAffirmationHistory(userId: number): Promise<AffirmationHistory[]> {
    return Array.from(this.affirmationHistory.values())
      .filter(affirmation => affirmation.userId === userId)
      .sort((a, b) => b.shownAt.getTime() - a.shownAt.getTime());
  }

  async addAffirmationHistory(affirmation: InsertAffirmationHistory): Promise<AffirmationHistory> {
    const id = this.currentAffirmationId++;
    const newAffirmation: AffirmationHistory = { ...affirmation, id };
    this.affirmationHistory.set(id, newAffirmation);
    return newAffirmation;
  }

  async canUserAskAI(userId: number): Promise<{ canAsk: boolean; questionsLeft: number }> {
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

  async incrementAIQuestions(userId: number): Promise<void> {
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
