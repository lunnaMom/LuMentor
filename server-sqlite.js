import express from 'express';
import { createServer } from 'http';
import path from 'path';
import Database from 'better-sqlite3';

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

// Initialize SQLite database
const db = new Database('java_learning.db');

// Create tables
function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User progress table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      xp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      current_module INTEGER DEFAULT 1,
      current_lesson INTEGER DEFAULT 1,
      completed_lessons TEXT DEFAULT '{}',
      completed_modules TEXT DEFAULT '[]',
      achievements TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Modules table
  db.exec(`
    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      lesson_count INTEGER DEFAULT 0,
      is_locked BOOLEAN DEFAULT FALSE
    )
  `);

  // Lessons table
  db.exec(`
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      description TEXT,
      duration INTEGER DEFAULT 0,
      xp_reward INTEGER DEFAULT 0,
      type TEXT DEFAULT 'theory',
      quiz TEXT,
      FOREIGN KEY (module_id) REFERENCES modules (module_id),
      UNIQUE(module_id, lesson_id)
    )
  `);

  console.log('Database tables created successfully');
}

// Insert sample data
function insertSampleData() {
  // Check if data already exists
  const moduleCount = db.prepare('SELECT COUNT(*) as count FROM modules').get();
  if (moduleCount.count > 0) {
    return; // Data already exists
  }

  // Insert modules
  const insertModule = db.prepare(`
    INSERT INTO modules (module_id, title, description, icon, lesson_count, is_locked)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const modules = [
    [1, "Java Basics", "Learn the fundamentals of Java programming", "code", 3, false],
    [2, "Android Studio Setup", "Set up your development environment", "smartphone", 2, false],
    [3, "UI Components", "Create beautiful user interfaces", "layout", 3, true],
    [4, "Game Development", "Build your first mobile game", "gamepad", 4, true],
    [5, "Data Storage", "Learn to save and load data", "database", 2, true],
    [6, "Networking", "Connect your app to the internet", "wifi", 3, true],
    [7, "Publishing", "Deploy your app to Google Play", "upload", 2, true],
    [8, "Advanced Topics", "Master advanced Java concepts", "star", 3, true]
  ];

  modules.forEach(module => {
    insertModule.run(...module);
  });

  // Insert lessons
  const insertLesson = db.prepare(`
    INSERT INTO lessons (module_id, lesson_id, title, content, description, duration, xp_reward, type, quiz)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const lessons = [
    [1, 1, "Variables and Data Types", "Learn about Java variables and basic data types like int, String, boolean, and double.", "Introduction to Java variables", 15, 50, "theory", JSON.stringify([
      {
        question: "What keyword is used to declare an integer variable in Java?",
        options: ["var", "let", "int", "String"],
        correct: 2
      }
    ])],
    [1, 2, "Control Structures", "Master if statements, loops, and conditional logic in Java.", "Conditional statements and loops", 20, 75, "theory", JSON.stringify([
      {
        question: "Which loop is best for iterating a known number of times?",
        options: ["while", "for", "do-while", "foreach"],
        correct: 1
      }
    ])],
    [1, 3, "Methods and Functions", "Learn to create reusable code with methods.", "Writing and using methods", 25, 100, "theory", JSON.stringify([
      {
        question: "What keyword is used to define a method in Java?",
        options: ["function", "def", "method", "public"],
        correct: 3
      }
    ])],
    [2, 1, "Installing AIDE", "Download and set up AIDE IDE for Android development on your mobile device.", "Setting up development environment", 10, 25, "theory", JSON.stringify([
      {
        question: "What does AIDE stand for?",
        options: ["Android IDE", "Advanced IDE", "Android Integrated Development Environment", "Application IDE"],
        correct: 2
      }
    ])],
    [2, 2, "Creating Your First Project", "Learn to create and structure an Android project in AIDE.", "Project creation and structure", 30, 50, "practical", JSON.stringify([
      {
        question: "What file contains the main activity of an Android app?",
        options: ["MainActivity.java", "main.xml", "app.java", "activity.xml"],
        correct: 0
      }
    ])]
  ];

  lessons.forEach(lesson => {
    insertLesson.run(...lesson);
  });

  // Insert default user and progress
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, email, password_hash)
    VALUES (?, ?, ?, ?)
  `);
  insertUser.run(1, 'student', 'student@example.com', 'demo_hash');

  const insertProgress = db.prepare(`
    INSERT INTO user_progress (user_id, xp, streak, current_module, current_lesson)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertProgress.run(1, 0, 0, 1, 1);

  console.log('Sample data inserted successfully');
}

// Initialize database
initializeDatabase();
insertSampleData();

// API Routes

// Get all modules
app.get("/api/modules", (req, res) => {
  try {
    const modules = db.prepare('SELECT * FROM modules ORDER BY module_id').all();
    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: "Failed to fetch modules" });
  }
});

// Get specific module
app.get("/api/modules/:moduleId", (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const module = db.prepare('SELECT * FROM modules WHERE module_id = ?').get(moduleId);
    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }
    res.json(module);
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ error: "Failed to fetch module" });
  }
});

// Get lessons for a module
app.get("/api/modules/:moduleId/lessons", (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const lessons = db.prepare('SELECT * FROM lessons WHERE module_id = ? ORDER BY lesson_id').all(moduleId);
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
});

// Get specific lesson
app.get("/api/modules/:moduleId/lessons/:lessonId", (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const lessonId = parseInt(req.params.lessonId);
    const lesson = db.prepare('SELECT * FROM lessons WHERE module_id = ? AND lesson_id = ?').get(moduleId, lessonId);
    
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Parse quiz JSON if it exists
    if (lesson.quiz) {
      lesson.quiz = JSON.parse(lesson.quiz);
    }

    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: "Failed to fetch lesson" });
  }
});

// Get user progress
app.get("/api/progress", (req, res) => {
  try {
    const userId = 1; // Default user
    const progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(userId);
    if (!progress) {
      return res.status(404).json({ error: "Progress not found" });
    }

    // Parse JSON fields
    progress.completed_lessons = JSON.parse(progress.completed_lessons || '{}');
    progress.completed_modules = JSON.parse(progress.completed_modules || '[]');
    progress.achievements = JSON.parse(progress.achievements || '[]');

    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// Submit quiz
app.post("/api/modules/:moduleId/lessons/:lessonId/quiz", (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const lessonId = parseInt(req.params.lessonId);
    const { answers } = req.body;
    
    const lesson = db.prepare('SELECT * FROM lessons WHERE module_id = ? AND lesson_id = ?').get(moduleId, lessonId);
    
    if (!lesson || !lesson.quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const quiz = JSON.parse(lesson.quiz);
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
      const currentProgress = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(userId);
      
      if (currentProgress) {
        const completedLessons = JSON.parse(currentProgress.completed_lessons || '{}');
        const completedKey = `${moduleId}-${lessonId}`;
        completedLessons[completedKey] = true;
        
        const updateProgress = db.prepare(`
          UPDATE user_progress 
          SET xp = ?, completed_lessons = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `);
        
        updateProgress.run(
          currentProgress.xp + lesson.xp_reward,
          JSON.stringify(completedLessons),
          userId
        );
      }
    }

    res.json({ score, correct, total: quiz.length, passed });
  } catch (error) {
    console.error('Error processing quiz:', error);
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
  app.use(express.static(path.join(process.cwd(), 'client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client/dist/index.html'));
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nClosing database connection...');
  db.close();
  process.exit(0);
});

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
  console.log(`${formattedTime} [express] serving on port ${PORT} with SQLite database`);
});

export { app, server, db };