import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all modules
  app.get("/api/modules", async (req, res) => {
    try {
      const modules = await storage.getAllModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  });

  // Get specific module
  app.get("/api/modules/:moduleId", async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const module = await storage.getModule(moduleId);
      if (!module) {
        return res.status(404).json({ error: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch module" });
    }
  });

  // Get lessons for a module
  app.get("/api/modules/:moduleId/lessons", async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const lessons = await storage.getLessonsByModule(moduleId);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  // Get specific lesson
  app.get("/api/modules/:moduleId/lessons/:lessonId", async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const lessonId = parseInt(req.params.lessonId);
      const lesson = await storage.getLesson(moduleId, lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lesson" });
    }
  });

  // Get user progress (for demo, we'll use a default user ID of 1)
  app.get("/api/progress", async (req, res) => {
    try {
      const userId = 1; // Demo user
      let progress = await storage.getUserProgress(userId);
      
      if (!progress) {
        // Create default user if doesn't exist
        const user = await storage.createUser({ username: "demo", password: "demo" });
        progress = await storage.createUserProgress({
          userId: user.id,
          xp: 0,
          streak: 0,
          currentModule: 1,
          currentLesson: 1,
          completedModules: [],
          completedLessons: {},
          achievements: []
        });
      }
      
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // Update user progress
  app.patch("/api/progress", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const updates = req.body;
      
      const progress = await storage.updateUserProgress(userId, updates);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // Submit quiz answers
  app.post("/api/modules/:moduleId/lessons/:lessonId/quiz", async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const lessonId = parseInt(req.params.lessonId);
      const { answers } = req.body;
      
      const lesson = await storage.getLesson(moduleId, lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      // Calculate score
      const quiz = (lesson.content as any).quiz || [];
      let correct = 0;
      
      quiz.forEach((question: any, index: number) => {
        if (answers[index] === question.correct) {
          correct++;
        }
      });

      const score = Math.round((correct / quiz.length) * 100);
      const passed = score >= 70;

      // Update progress if passed
      if (passed) {
        const userId = 1;
        const currentProgress = await storage.getUserProgress(userId);
        if (currentProgress) {
          const completedKey = `${moduleId}-${lessonId}`;
          const newCompletedLessons = { 
            ...(currentProgress.completedLessons as any), 
            [completedKey]: true 
          };
          
          await storage.updateUserProgress(userId, {
            xp: currentProgress.xp + lesson.xpReward,
            completedLessons: newCompletedLessons
          });
        }
      }

      res.json({ score, correct, total: quiz.length, passed });
    } catch (error) {
      res.status(500).json({ error: "Failed to process quiz" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
