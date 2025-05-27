import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { sendVerificationEmail } from "./email";
import { 
  insertUserSchema, 
  insertCourseSchema, 
  insertLessonSchema,
  insertQuizSchema,
  insertEnrollmentSchema,
  insertLessonProgressSchema,
  insertQuizAttemptSchema,
  ActivityItem, // Added
  CertificateItem // Added
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

      const emailVerificationToken = randomBytes(32).toString('hex');
      const userToCreate = {
        ...userData,
        emailVerified: false,
        emailVerificationToken,
      };
      
      const user = await storage.createUser(userToCreate);

      if (user.email && user.emailVerificationToken) {
        await sendVerificationEmail(user.email, user.emailVerificationToken);
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Verification token is required." });
      }

      const user = await storage.getUserByVerificationToken(token);

      if (!user) {
        return res.status(404).json({ message: "Invalid or expired verification token." });
      }

      if (user.emailVerified) {
        return res.status(200).json({ message: "Email already verified. You can log in." });
      }

      const updatedUser = await storage.updateUserVerificationStatus(user.id, true, null);

      if (!updatedUser) {
        // This case should ideally not happen if the user was found before
        return res.status(500).json({ message: "Failed to update user verification status." });
      }

      res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error: any) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Internal server error during email verification." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.emailVerified) {
        return res.status(401).json({ message: "Please verify your email before logging in." });
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
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      // For updates, we use partial schema and ensure instructorId is not changed via body
      const courseData = insertCourseSchema.partial().parse(req.body);
      
      // TODO: Add authentication and authorization here
      // For now, assuming the update is valid and allowed
      // const authUserId = (req as any).user?.id; // Example if auth middleware adds user
      // const existingCourse = await storage.getCourse(courseId);
      // if (existingCourse?.instructorId !== authUserId) {
      //   return res.status(403).json({ message: "You are not authorized to update this course." });
      // }

      const updatedCourse = await storage.updateCourse(courseId, courseData);
      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found or update failed" });
      }
      res.json(updatedCourse);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      // TODO: Add authentication and get instructorId from authenticated user
      const instructorId = 1; // Placeholder - replace with actual authenticated instructor ID
      
      const result = await storage.deleteCourse(courseId, instructorId);
      if (!result.success) {
        // Use 404 for not found, 403 for authorization issues if distinguishable
        return res.status(result.message === "Course not found." ? 404 : 403).json({ message: result.message });
      }
      res.status(200).json({ message: "Course deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error" });
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

  // Student Dashboard Specific Routes
  app.get("/api/users/:id/activity", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 10;
      // TODO: Ensure the authenticated user is requesting their own activity or is an admin/instructor
      const activity = await storage.getUserActivity(userId, limit);
      res.json(activity);
    } catch (error: any) {
      console.error("Failed to get user activity:", error);
      res.status(500).json({ message: "Failed to get user activity" });
    }
  });

  app.get("/api/users/:id/certificates", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      // TODO: Ensure the authenticated user is requesting their own certificates or is an admin/instructor
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error: any) {
      console.error("Failed to get user certificates:", error);
      res.status(500).json({ message: "Failed to get user certificates" });
    }
  });

  // Instructor Analytics Placeholder Routes
  app.get("/api/instructors/:id/analytics/revenue", (req, res) => {
    const { period = 'monthly' } = req.query;
    // Mock data - replace with real analytics logic
    res.json({ 
      period,
      data: [
        { date: '2023-01-01', revenue: 1200 }, { date: '2023-02-01', revenue: 1500 },
        { date: '2023-03-01', revenue: 1800 }, { date: '2023-04-01', revenue: 1400 },
      ] 
    });
  });

  app.get("/api/instructors/:id/analytics/top-courses", (req, res) => {
    const { sortBy = 'revenue' } = req.query;
    // Mock data - replace with real analytics logic
    res.json([
      { id: 1, title: 'Complete Web Development Bootcamp', metric: sortBy === 'revenue' ? 500000 : 324 },
      { id: 2, title: 'Data Science Fundamentals', metric: sortBy === 'revenue' ? 300000 : 156 },
      { id: 3, title: 'Mobile App Design Masterclass', metric: sortBy === 'revenue' ? 250000 : 100 },
    ]);
  });

  app.get("/api/instructors/:id/analytics/engagement", (req, res) => {
    // Mock data - replace with real analytics logic
    res.json({
      averageCompletionRate: 65, // percentage
      totalHoursLearned: 1200,
      activeStudents: 450,
    });
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
      const lessonData = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(lessonData);
      res.status(201).json(lesson);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Quiz routes
  app.post("/api/quizzes", async (req, res) => {
    try {
      const quizData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(quizData);
      res.status(201).json(quiz);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
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
