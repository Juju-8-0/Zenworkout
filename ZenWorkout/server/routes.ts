import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWorkoutRoutineSchema, insertWorkoutSessionSchema, insertUserSettingsSchema } from "@shared/schema";
import { askZenAI } from "./openai";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user data and stats
  app.get("/api/user/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getRecentWorkoutSessions(userId, 30);
      const weekSessions = await storage.getRecentWorkoutSessions(userId, 7);
      
      const totalWorkouts = sessions.length;
      const weeklyWorkouts = weekSessions.length;
      
      // Calculate streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        
        const hasWorkout = sessions.some(session => {
          const sessionDate = new Date(session.completedAt);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === checkDate.getTime();
        });
        
        if (hasWorkout) {
          streak++;
        } else if (i === 0) {
          // If no workout today, check yesterday
          continue;
        } else {
          break;
        }
      }

      res.json({
        totalWorkouts,
        weeklyWorkouts,
        streak
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user stats" });
    }
  });

  // Get weekly workout data for chart
  app.get("/api/user/weekly-data", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getRecentWorkoutSessions(userId, 7);
      const today = new Date();
      
      const weekData = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dayWorkouts = sessions.filter(session => {
          const sessionDate = new Date(session.completedAt);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === date.getTime();
        });
        
        weekData.push({
          day: days[date.getDay()],
          workouts: dayWorkouts.length,
          duration: dayWorkouts.reduce((sum, session) => sum + (session.duration || 0), 0)
        });
      }
      
      res.json(weekData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get weekly data" });
    }
  });

  // Workout routines endpoints
  app.get("/api/routines", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const routines = await storage.getWorkoutRoutines(userId);
      res.json(routines);
    } catch (error) {
      res.status(500).json({ message: "Failed to get routines" });
    }
  });

  app.post("/api/routines", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertWorkoutRoutineSchema.parse({
        ...req.body,
        userId
      });
      
      const routine = await storage.createWorkoutRoutine(validatedData);
      res.json(routine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid routine data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create routine" });
      }
    }
  });

  app.put("/api/routines/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertWorkoutRoutineSchema.partial().parse(req.body);
      
      const routine = await storage.updateWorkoutRoutine(id, validatedData);
      if (!routine) {
        return res.status(404).json({ message: "Routine not found" });
      }
      
      res.json(routine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid routine data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update routine" });
      }
    }
  });

  app.delete("/api/routines/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorkoutRoutine(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Routine not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete routine" });
    }
  });

  // Workout sessions endpoints
  app.post("/api/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertWorkoutSessionSchema.parse({
        ...req.body,
        userId,
        completedAt: new Date()
      });
      
      const session = await storage.createWorkoutSession(validatedData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create session" });
      }
    }
  });

  // User settings endpoints
  app.get("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getUserSettings(userId);
      if (!settings) {
        // Create default settings if none exist
        const defaultSettings = await storage.updateUserSettings(userId, {
          userId
        });
        return res.json(defaultSettings);
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  app.put("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertUserSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateUserSettings(userId, validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update settings" });
      }
    }
  });

  // AI Chat Assistant
  app.get("/api/ai/check", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await storage.canUserAskAI(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to check AI status" });
    }
  });

  app.post("/api/ai/ask", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { question } = req.body;

      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: "Question is required" });
      }

      const { canAsk } = await storage.canUserAskAI(userId);
      if (!canAsk) {
        return res.status(403).json({ error: "Daily AI question limit reached. Upgrade to ZenGym Pro for unlimited access!" });
      }

      const answer = await askZenAI(question);
      await storage.incrementAIQuestions(userId);
      
      res.json({ answer });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "An error occurred" });
    }
  });

  // ZenGym Pro upgrade
  app.post("/api/upgrade-pro", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const proExpiresAt = new Date();
      proExpiresAt.setMonth(proExpiresAt.getMonth() + 1); // 1 month from now
      
      const settings = await storage.updateUserSettings(userId, {
        isPro: true,
        proExpiresAt,
        dailyAiQuestions: 0 // Reset AI questions for pro user
      });
      
      res.json({ success: true, settings });
    } catch (error) {
      res.status(500).json({ message: "Failed to upgrade to Pro" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
