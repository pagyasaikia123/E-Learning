import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCourseSchema, 
  insertLessonSchema,
  insertQuizSchema,
  insertEnrollmentSchema,
  insertLessonProgressSchema,
  insertQuizAttemptSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const category = req.query.category as string;
      const search = req.query.search as string;
      
      const courses = await storage.getCourses(limit, offset, category, search);
      res.json(courses);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      // @ts-ignore // Assuming req.user is populated by auth middleware
      const user = req.user; 

      if (!user || user.role !== 'instructor') {
        return res.status(403).json({ message: "Forbidden: Only instructors can create courses." });
      }

      // instructorId from payload is ignored; taken from authenticated user
      const courseDataFromClient = insertCourseSchema.parse(req.body); // insertCourseSchema now omits instructorId
      
      // instructorId is now passed as a separate argument to storage.createCourse
      const course = await storage.createCourse(courseDataFromClient, user.id);
      res.status(201).json(course);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid course data.", errors: error.errors });
      }
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course." });
    }
  });

  app.get("/api/instructors/:id/courses", async (req, res) => {
    try {
      const instructorId = parseInt(req.params.id);
      const courses = await storage.getCoursesByInstructor(instructorId);
      res.json(courses);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Lesson routes
  app.get("/api/courses/:id/lessons", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const lessons = await storage.getLessonsByourse(courseId);
      res.json(lessons);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLesson(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      res.json(lesson);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/lessons", async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      if (!user || user.role !== 'instructor') {
        return res.status(403).json({ message: "Forbidden: Only instructors can create lessons." });
      }

      const lessonData = insertLessonSchema.parse(req.body);

      const course = await storage.getCourse(lessonData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found for this lesson." });
      }

      if (course.instructorId !== user.id) {
        return res.status(403).json({ message: "Forbidden: You do not own the course this lesson belongs to." });
      }

      const lesson = await storage.createLesson(lessonData);
      res.status(201).json(lesson);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid lesson data.", errors: error.errors });
      }
      console.error("Error creating lesson:", error);
      res.status(500).json({ message: "Failed to create lesson." });
    }
  });

  // Quiz routes
  app.post("/api/quizzes", async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      if (!user || user.role !== 'instructor') {
        return res.status(403).json({ message: "Forbidden: Only instructors can create quizzes." });
      }

      const quizData = insertQuizSchema.parse(req.body);

      const lesson = await storage.getLesson(quizData.lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found for this quiz." });
      }

      const course = await storage.getCourse(lesson.courseId);
      if (!course) {
        // This implies a data integrity issue if a lesson exists without a course.
        return res.status(500).json({ message: "Course associated with the lesson not found." });
      }

      if (course.instructorId !== user.id) {
        return res.status(403).json({ message: "Forbidden: You do not own the course this quiz belongs to." });
      }
      
      const quiz = await storage.createQuiz(quizData);
      res.status(201).json(quiz);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid quiz data.", errors: error.errors });
      }
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Failed to create quiz." });
    }
  });

  app.get("/api/quizzes/:id/attempts", async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const attempts = await storage.getQuizAttempts(userId, quizId);
      res.json(attempts);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/quiz-attempts", async (req, res) => {
    try {
      const attemptData = insertQuizAttemptSchema.parse(req.body);
      const attempt = await storage.createQuizAttempt(attemptData);
      res.status(201).json(attempt);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Enrollment routes
  app.get("/api/users/:id/enrollments", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/enrollments", async (req, res) => {
    try {
      const enrollmentData = insertEnrollmentSchema.parse(req.body);
      
      // Check if already enrolled
      const isEnrolled = await storage.isUserEnrolled(enrollmentData.userId, enrollmentData.courseId);
      if (isEnrolled) {
        return res.status(400).json({ message: "User is already enrolled in this course" });
      }
      
      const enrollment = await storage.enrollUser(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:userId/courses/:courseId/enrollment", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const courseId = parseInt(req.params.courseId);
      
      const isEnrolled = await storage.isUserEnrolled(userId, courseId);
      res.json({ isEnrolled });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Progress tracking routes
  app.get("/api/users/:userId/lessons/:lessonId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const lessonId = parseInt(req.params.lessonId);
      
      const progress = await storage.getLessonProgress(userId, lessonId);
      res.json(progress || { completed: false, watchTime: 0 });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/lesson-progress", async (req, res) => {
    try {
      const progressData = insertLessonProgressSchema.parse(req.body);
      const progress = await storage.updateLessonProgress(progressData);
      
      // Update course progress if lesson is completed
      if (progressData.completed) {
        // This is a simplified calculation - in a real app, you'd calculate based on all lessons
        const courseId = (await storage.getLesson(progressData.lessonId))?.courseId;
        if (courseId) {
          // For demo purposes, assume 50% progress per completed lesson
          await storage.updateEnrollmentProgress(
            progressData.userId, 
            courseId, 
            Math.min(100, 50), // Simplified progress calculation
            [progressData.lessonId]
          );
        }
      }
      
      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
