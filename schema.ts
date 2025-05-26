import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  currentModule: integer("current_module").notNull().default(1),
  currentLesson: integer("current_lesson").notNull().default(1),
  completedModules: integer("completed_modules").array().notNull().default([]),
  completedLessons: jsonb("completed_lessons").notNull().default({}),
  achievements: text("achievements").array().notNull().default([]),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: jsonb("content").notNull(),
  duration: integer("duration").notNull(),
  xpReward: integer("xp_reward").notNull().default(50),
});

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  lessonCount: integer("lesson_count").notNull(),
  isLocked: boolean("is_locked").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
