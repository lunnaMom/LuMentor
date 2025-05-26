import express from 'express';
import { createServer } from 'http';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  let capturedJsonResponse;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith("/api")) {
      let logLine = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      console.log(`${formattedTime} [express] ${logLine}`);
    }
  });

  next();
});

// In-memory storage for the Java learning platform
const storage = {
  users: new Map(),
  userProgress: new Map(),
  modules: new Map(),
  lessons: new Map(),
  currentUserId: 1,
  currentProgressId: 1,
  currentModuleId: 1,
  currentLessonId: 1
};

// Initialize sample data
function initializeData() {
  // Sample modules
  const modules = [
    {
      moduleId: 1,
      title: "Java Basics",
      description: "Learn the fundamentals of Java programming",
      icon: "code",
      color: "blue",
      isLocked: false
    },
    {
      moduleId: 2,
      title: "Android Studio Setup",
      description: "Set up your development environment",
      icon: "smartphone",
      color: "green",
      isLocked: false
    },
    {
      moduleId: 3,
      title: "UI Components",
      description: "Create beautiful user interfaces",
      icon: "layout",
      color: "purple",
      isLocked: true
    }
  ];

  modules.forEach(mod => {
    const module = { id: storage.currentModuleId++, ...mod };
    storage.modules.set(module.id, module);
  });

  // Sample lessons
  const lessons = [
    {
      moduleId: 1,
      lessonId: 1,
      title: "Variables and Data Types",
      content: "Learn about Java variables and basic data types like int, String, boolean, and double.",
      type: "theory",
      xpReward: 50,
      quiz: [
        {
          question: "What keyword is used to declare a variable in Java?",
          options: ["var", "let", "int", "String"],
          correct: 2
        }
      ]
    },
    {
      moduleId: 1,
      lessonId: 2,
      title: "Control Structures",
      content: "Master if statements, loops, and conditional logic in Java.",
      type: "theory",
      xpReward: 75,
      quiz: [
        {
          question: "Which loop is best for iterating a known number of times?",
          options: ["while", "for", "do-while", "foreach"],
          correct: 1
        }
      ]
    },
    {
      moduleId: 2,
      lessonId: 1,
      title: "Installing AIDE",
      content: "Download and set up AIDE IDE for Android development on your mobile device.",
      type: "theory",
      xpReward: 25,
      quiz: [
        {
          question: "What does AIDE stand for?",
          options: ["Android IDE", "Advanced IDE", "Android Integrated Development Environment", "Application IDE"],
          correct: 2
        }
      ]
    }
  ];

  lessons.forEach(lesson => {
    const lessonObj = { id: storage.currentLessonId++, ...lesson };
    const key = `${lesson.moduleId}-${lesson.lessonId}`;
    storage.lessons.set(key, lessonObj);
  });

  // Initialize user progress
  const progress = {
    id: storage.currentProgressId++,
    userId: 1,
    xp: 0,
    streak: 0,
    currentModule: 1,
    completedLessons: {}
  };
  storage.userProgress.set(1, progress);
}

// Initialize data on startup
initializeData();

// API Routes

// Get all modules
app.get("/api/modules", (req, res) => {
  try {
    const modules = Array.from(storage.modules.values());
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch modules" });
  }
});

// Get specific module
app.get("/api/modules/:moduleId", (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const module = Array.from(storage.modules.values()).find(m => m.moduleId === moduleId);
    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }
    res.json(module);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch module" });
  }
});

// Get lessons for a module
app.get("/api/modules/:moduleId/lessons", (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const lessons = Array.from(storage.lessons.values()).filter(l => l.moduleId === moduleId);
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
});

// Get specific lesson
app.get("/api/modules/:moduleId/lessons/:lessonId", (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const lessonId = parseInt(req.params.lessonId);
    const key = `${moduleId}-${lessonId}`;
    const lesson = storage.lessons.get(key);
    
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lesson" });
  }
});

// Get user progress
app.get("/api/progress", (req, res) => {
  try {
    const userId = 1; // Default user
    const progress = storage.userProgress.get(userId);
    if (!progress) {
      return res.status(404).json({ error: "Progress not found" });
    }
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// Submit quiz
app.post("/api/modules/:moduleId/lessons/:lessonId/quiz", (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const lessonId = parseInt(req.params.lessonId);
    const { answers } = req.body;
    
    const key = `${moduleId}-${lessonId}`;
    const lesson = storage.lessons.get(key);
    
    if (!lesson || !lesson.quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const quiz = lesson.quiz;
    let correct = 0;
    
    answers.forEach((answer, index) => {
      if (quiz[index] && quiz[index].correct === answer) {
        correct++;
      }
    });

    const score = Math.round((correct / quiz.length) * 100);
    const passed = score >= 70;

    // Update progress if passed
    if (passed) {
      const userId = 1;
      const currentProgress = storage.userProgress.get(userId);
      if (currentProgress) {
        const completedKey = `${moduleId}-${lessonId}`;
        const newCompletedLessons = { 
          ...currentProgress.completedLessons, 
          [completedKey]: true 
        };
        
        const updatedProgress = {
          ...currentProgress,
          xp: currentProgress.xp + lesson.xpReward,
          completedLessons: newCompletedLessons
        };
        
        storage.userProgress.set(userId, updatedProgress);
      }
    }

    res.json({ score, correct, total: quiz.length, passed });
  } catch (error) {
    res.status(500).json({ error: "Failed to process quiz" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [express] serving on port ${PORT}`);
});

export { app, server };