import { users, userProgress, lessons, modules, type User, type InsertUser, type UserProgress, type InsertUserProgress, type Lesson, type InsertLesson, type Module, type InsertModule } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getUserProgress(userId: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: number, progress: Partial<UserProgress>): Promise<UserProgress>;
  
  getAllModules(): Promise<Module[]>;
  getModule(moduleId: number): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  
  getLesson(moduleId: number, lessonId: number): Promise<Lesson | undefined>;
  getLessonsByModule(moduleId: number): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userProgressMap: Map<number, UserProgress>;
  private modulesMap: Map<number, Module>;
  private lessonsMap: Map<string, Lesson>;
  private currentUserId: number;
  private currentProgressId: number;
  private currentModuleId: number;
  private currentLessonId: number;

  constructor() {
    this.users = new Map();
    this.userProgressMap = new Map();
    this.modulesMap = new Map();
    this.lessonsMap = new Map();
    this.currentUserId = 1;
    this.currentProgressId = 1;
    this.currentModuleId = 1;
    this.currentLessonId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize modules
    const moduleData = [
      { moduleId: 1, title: "Java Basics", description: "Variables, conditions, loops, arrays, methods, classes", icon: "fas fa-code", lessonCount: 6, isLocked: false },
      { moduleId: 2, title: "Android View", description: "Understanding Canvas, drawing shapes and text", icon: "fas fa-mobile-alt", lessonCount: 3, isLocked: false },
      { moduleId: 3, title: "Touch Events", description: "Understanding onTouchEvent, coordinates, reactions", icon: "fas fa-hand-pointer", lessonCount: 3, isLocked: true },
      { moduleId: 4, title: "Game Loop", description: "Thread, Runnable, redrawing with timing", icon: "fas fa-sync", lessonCount: 3, isLocked: true },
      { moduleId: 5, title: "Sound & Collision", description: "SoundPool, MediaPlayer, collision detection", icon: "fas fa-volume-up", lessonCount: 3, isLocked: true },
      { moduleId: 6, title: "UI & Logic", description: "Buttons, score tracking, win/lose conditions", icon: "fas fa-gamepad", lessonCount: 3, isLocked: true },
      { moduleId: 7, title: "FPS Optimization", description: "Frame control, reducing lag, memory management", icon: "fas fa-tachometer-alt", lessonCount: 3, isLocked: true },
      { moduleId: 8, title: "APK Publishing", description: "Signing APK, creating icon, sharing game", icon: "fas fa-upload", lessonCount: 3, isLocked: true }
    ];

    moduleData.forEach(mod => {
      const module: Module = { id: this.currentModuleId++, ...mod };
      this.modulesMap.set(module.moduleId, module);
    });

    // Initialize sample lessons for first two modules
    this.initializeLessons();
  }

  private initializeLessons() {
    const lessonData = [
      // Module 1: Java Basics
      {
        moduleId: 1, lessonId: 1, title: "Variables (int, String, boolean)", 
        description: "Learn about different types of variables in Java",
        content: {
          theory: "Variables are like boxes where you can store different types of information. Think of them as labeled containers!",
          codeExample: "int age = 10;\nString name = \"Alex\";\nboolean isHappy = true;",
          task: "Create three variables: one for your age, one for your name, and one for whether you like games.",
          quiz: [
            { question: "What type of variable stores whole numbers?", options: ["int", "String", "boolean"], correct: 0 },
            { question: "What type of variable stores text?", options: ["int", "String", "boolean"], correct: 1 }
          ]
        },
        duration: 8, xpReward: 50
      },
      {
        moduleId: 1, lessonId: 2, title: "Conditions (if, else, switch)", 
        description: "Learn how to make decisions in your code",
        content: {
          theory: "Conditions help your program make decisions, just like you decide what to wear based on the weather!",
          codeExample: "if (age > 10) {\n    System.out.println(\"You're old enough!\");\n} else {\n    System.out.println(\"Wait a bit more!\");\n}",
          task: "Write an if statement that checks if a score is greater than 100.",
          quiz: [
            { question: "What keyword is used to check a condition?", options: ["if", "when", "check"], correct: 0 }
          ]
        },
        duration: 10, xpReward: 50
      },
      // Module 2: Android View
      {
        moduleId: 2, lessonId: 1, title: "Understanding Canvas", 
        description: "Learn what Canvas is and how to use it",
        content: {
          theory: "Canvas is like a magical drawing board where you can draw anything you want - circles, squares, text, and even moving pictures for your games!",
          codeExample: "Canvas canvas;\nPaint redPaint = new Paint();\nredPaint.setColor(Color.RED);\ncanvas.drawCircle(100, 200, 50, redPaint);",
          task: "Draw a blue square on the canvas using drawRect.",
          quiz: [
            { question: "What is Canvas like?", options: ["A magical drawing board", "A type of food", "A musical instrument"], correct: 0 },
            { question: "What do you need to color your drawings?", options: ["A Canvas", "A Paint object", "A computer mouse"], correct: 1 }
          ]
        },
        duration: 8, xpReward: 50
      }
    ];

    lessonData.forEach(lesson => {
      const lessonObj: Lesson = { id: this.currentLessonId++, ...lesson };
      const key = `${lesson.moduleId}-${lesson.lessonId}`;
      this.lessonsMap.set(key, lessonObj);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Create initial progress for new user
    await this.createUserProgress({
      userId: id,
      xp: 0,
      streak: 0,
      currentModule: 1,
      currentLesson: 1,
      completedModules: [],
      completedLessons: {},
      achievements: []
    });
    
    return user;
  }

  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgressMap.values()).find(progress => progress.userId === userId);
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentProgressId++;
    const progress: UserProgress = { ...insertProgress, id };
    this.userProgressMap.set(id, progress);
    return progress;
  }

  async updateUserProgress(userId: number, updates: Partial<UserProgress>): Promise<UserProgress> {
    const existing = await this.getUserProgress(userId);
    if (!existing) {
      throw new Error("User progress not found");
    }
    
    const updated: UserProgress = { ...existing, ...updates };
    this.userProgressMap.set(existing.id, updated);
    return updated;
  }

  async getAllModules(): Promise<Module[]> {
    return Array.from(this.modulesMap.values()).sort((a, b) => a.moduleId - b.moduleId);
  }

  async getModule(moduleId: number): Promise<Module | undefined> {
    return this.modulesMap.get(moduleId);
  }

  async createModule(insertModule: InsertModule): Promise<Module> {
    const id = this.currentModuleId++;
    const module: Module = { ...insertModule, id };
    this.modulesMap.set(module.moduleId, module);
    return module;
  }

  async getLesson(moduleId: number, lessonId: number): Promise<Lesson | undefined> {
    const key = `${moduleId}-${lessonId}`;
    return this.lessonsMap.get(key);
  }

  async getLessonsByModule(moduleId: number): Promise<Lesson[]> {
    return Array.from(this.lessonsMap.values())
      .filter(lesson => lesson.moduleId === moduleId)
      .sort((a, b) => a.lessonId - b.lessonId);
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.currentLessonId++;
    const lesson: Lesson = { ...insertLesson, id };
    const key = `${lesson.moduleId}-${lesson.lessonId}`;
    this.lessonsMap.set(key, lesson);
    return lesson;
  }
}

export const storage = new MemStorage();
