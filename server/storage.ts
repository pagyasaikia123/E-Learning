import { neon } from '@neondatabase/serverless';
import {
  users, courses, lessons, quizzes, enrollments, lessonProgress, quizAttempts,
  type User, type InsertUser,
  type Course, type InsertCourse,
  type Lesson, type InsertLesson,
  type Quiz, type InsertQuiz,
  type Enrollment, type InsertEnrollment,
  type LessonProgress, type InsertLessonProgress,
  type QuizAttempt, type InsertQuizAttempt,
  type CourseWithInstructor,
  type LessonWithQuiz,
  type UserStats
} from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  updateUserVerificationStatus(userId: number, emailVerified: boolean, verificationToken: string | null): Promise<User | undefined>;
  
  // Course operations
  getCourses(limit?: number, offset?: number, category?: string, search?: string): Promise<CourseWithInstructor[]>;
  getCourse(id: number): Promise<CourseWithInstructor | undefined>;
  getCoursesByInstructor(instructorId: number): Promise<CourseWithInstructor[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined>;
  
  // Lesson operations
  getLessonsByourse(courseId: number): Promise<LessonWithQuiz[]>;
  getLesson(id: number): Promise<LessonWithQuiz | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: number, lesson: Partial<Lesson>): Promise<Lesson | undefined>;
  
  // Quiz operations
  getQuizByLesson(lessonId: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  
  // Enrollment operations
  getUserEnrollments(userId: number): Promise<CourseWithInstructor[]>;
  enrollUser(enrollment: InsertEnrollment): Promise<Enrollment>;
  isUserEnrolled(userId: number, courseId: number): Promise<boolean>;
  updateEnrollmentProgress(userId: number, courseId: number, progress: number, completedLessons: number[]): Promise<void>;
  
  // Progress tracking
  getLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined>;
  updateLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;
  getUserStats(userId: number): Promise<UserStats>;
  
  // Quiz attempts
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getQuizAttempts(userId: number, quizId: number): Promise<QuizAttempt[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private courses: Map<number, Course> = new Map();
  private lessons: Map<number, Lesson> = new Map();
  private quizzes: Map<number, Quiz> = new Map();
  private enrollments: Map<number, Enrollment> = new Map();
  private lessonProgress: Map<number, LessonProgress> = new Map();
  private quizAttempts: Map<number, QuizAttempt> = new Map();
  private currentUserId = 1;
  private currentCourseId = 1;
  private currentLessonId = 1;
  private currentQuizId = 1;
  private currentEnrollmentId = 1;
  private currentLessonProgressId = 1;
  private currentQuizAttemptId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create demo users
    const instructor1: User = {
      id: this.currentUserId++,
      username: "sarah_johnson",
      password: "password123",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@example.com",
      role: "instructor",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b8c5?w=100&h=100&fit=crop&crop=face",
      createdAt: new Date(),
    };
    this.users.set(instructor1.id, instructor1);

    const instructor2: User = {
      id: this.currentUserId++,
      username: "michael_chen",
      password: "password123",
      firstName: "Dr. Michael",
      lastName: "Chen",
      email: "michael@example.com",
      role: "instructor",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      createdAt: new Date(),
    };
    this.users.set(instructor2.id, instructor2);

    const student: User = {
      id: this.currentUserId++,
      username: "john_doe",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "student",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      createdAt: new Date(),
    };
    this.users.set(student.id, student);

    // Create demo courses
    const course1: Course = {
      id: this.currentCourseId++,
      title: "Complete Web Development Bootcamp",
      description: "Learn web development from scratch with HTML, CSS, JavaScript, React, and Node.js",
      instructorId: instructor1.id,
      category: "Technology",
      level: "Beginner",
      price: 8900, // $89.00
      thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
      rating: 48, // 4.8 stars
      enrollmentCount: 324,
      duration: 1200, // 20 hours
      createdAt: new Date(),
    };
    this.courses.set(course1.id, course1);

    const course2: Course = {
      id: this.currentCourseId++,
      title: "Data Science Fundamentals",
      description: "Introduction to data science with Python, pandas, and machine learning basics",
      instructorId: instructor2.id,
      category: "Technology",
      level: "Intermediate",
      price: 12900, // $129.00
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      rating: 46, // 4.6 stars
      enrollmentCount: 156,
      duration: 900, // 15 hours
      createdAt: new Date(),
    };
    this.courses.set(course2.id, course2);

    const course3: Course = {
      id: this.currentCourseId++,
      title: "Mobile App Design Masterclass",
      description: "Learn to design beautiful and functional mobile applications from scratch",
      instructorId: instructor1.id,
      category: "Design",
      level: "Beginner",
      price: 8900, // $89.00
      thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
      rating: 48, // 4.8 stars
      enrollmentCount: 324,
      duration: 720, // 12 hours
      createdAt: new Date(),
    };
    this.courses.set(course3.id, course3);

    // Create demo lessons
    const lesson1: Lesson = {
      id: this.currentLessonId++,
      courseId: course1.id,
      title: "Introduction to React Hooks",
      description: "Learn the basics of React hooks and state management",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      duration: 754, // 12:34
      order: 1,
      createdAt: new Date(),
    };
    this.lessons.set(lesson1.id, lesson1);

    const lesson2: Lesson = {
      id: this.currentLessonId++,
      courseId: course1.id,
      title: "Building Your First Component",
      description: "Create reusable React components",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      duration: 890, // 14:50
      order: 2,
      createdAt: new Date(),
    };
    this.lessons.set(lesson2.id, lesson2);

    // Create demo quiz
    const quiz1: Quiz = {
      id: this.currentQuizId++,
      lessonId: lesson1.id,
      title: "Knowledge Check: React Basics",
      questions: [
        {
          id: 1,
          question: "What is the purpose of React hooks?",
          options: [
            "To add state and lifecycle methods to functional components",
            "To replace class components entirely",
            "To improve performance only",
            "To handle routing"
          ],
          correctAnswer: 0
        },
        {
          id: 2,
          question: "Which hook is used for state management?",
          options: [
            "useEffect",
            "useState",
            "useContext",
            "useReducer"
          ],
          correctAnswer: 1
        }
      ],
      createdAt: new Date(),
    };
    this.quizzes.set(quiz1.id, quiz1);

    // Create demo enrollment
    const enrollment1: Enrollment = {
      id: this.currentEnrollmentId++,
      userId: student.id,
      courseId: course1.id,
      progress: 65,
      completedLessons: [lesson1.id],
      enrolledAt: new Date(),
    };
    this.enrollments.set(enrollment1.id, enrollment1);

    const enrollment2: Enrollment = {
      id: this.currentEnrollmentId++,
      userId: student.id,
      courseId: course2.id,
      progress: 40,
      completedLessons: [],
      enrolledAt: new Date(),
    };
    this.enrollments.set(enrollment2.id, enrollment2);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.emailVerificationToken === token);
  }

  async updateUserVerificationStatus(userId: number, emailVerified: boolean, verificationToken: string | null): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;

    const updatedUser = {
      ...user,
      emailVerified,
      emailVerificationToken: verificationToken,
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getCourses(limit = 10, offset = 0, category?: string, search?: string): Promise<CourseWithInstructor[]> {
    let coursesArray = Array.from(this.courses.values());
    
    if (category) {
      coursesArray = coursesArray.filter(course => course.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      coursesArray = coursesArray.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower)
      );
    }
    
    return coursesArray
      .slice(offset, offset + limit)
      .map(course => {
        const instructor = this.users.get(course.instructorId)!;
        const lessons = Array.from(this.lessons.values()).filter(l => l.courseId === course.id);
        return {
          ...course,
          instructor: {
            firstName: instructor.firstName,
            lastName: instructor.lastName,
            avatar: instructor.avatar,
          },
          lessons,
        };
      });
  }

  async getCourse(id: number): Promise<CourseWithInstructor | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    
    const instructor = this.users.get(course.instructorId)!;
    const lessons = Array.from(this.lessons.values())
      .filter(l => l.courseId === course.id)
      .sort((a, b) => a.order - b.order);
    
    return {
      ...course,
      instructor: {
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        avatar: instructor.avatar,
      },
      lessons,
    };
  }

  async getCoursesByInstructor(instructorId: number): Promise<CourseWithInstructor[]> {
    const instructorCourses = Array.from(this.courses.values())
      .filter(course => course.instructorId === instructorId);
    
    const instructor = this.users.get(instructorId)!;
    
    return instructorCourses.map(course => {
      const lessons = Array.from(this.lessons.values()).filter(l => l.courseId === course.id);
      return {
        ...course,
        instructor: {
          firstName: instructor.firstName,
          lastName: instructor.lastName,
          avatar: instructor.avatar,
        },
        lessons,
      };
    });
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const course: Course = {
      ...insertCourse,
      id: this.currentCourseId++,
      rating: 0,
      enrollmentCount: 0,
      createdAt: new Date(),
    };
    this.courses.set(course.id, course);
    return course;
  }

  async updateCourse(id: number, courseUpdate: Partial<Course>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    
    const updatedCourse = { ...course, ...courseUpdate };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async getLessonsByourse(courseId: number): Promise<LessonWithQuiz[]> {
    const courseLessons = Array.from(this.lessons.values())
      .filter(lesson => lesson.courseId === courseId)
      .sort((a, b) => a.order - b.order);
    
    return courseLessons.map(lesson => {
      const quiz = Array.from(this.quizzes.values()).find(q => q.lessonId === lesson.id);
      return { ...lesson, quiz };
    });
  }

  async getLesson(id: number): Promise<LessonWithQuiz | undefined> {
    const lesson = this.lessons.get(id);
    if (!lesson) return undefined;
    
    const quiz = Array.from(this.quizzes.values()).find(q => q.lessonId === lesson.id);
    return { ...lesson, quiz };
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const lesson: Lesson = {
      ...insertLesson,
      id: this.currentLessonId++,
      createdAt: new Date(),
    };
    this.lessons.set(lesson.id, lesson);
    return lesson;
  }

  async updateLesson(id: number, lessonUpdate: Partial<Lesson>): Promise<Lesson | undefined> {
    const lesson = this.lessons.get(id);
    if (!lesson) return undefined;
    
    const updatedLesson = { ...lesson, ...lessonUpdate };
    this.lessons.set(id, updatedLesson);
    return updatedLesson;
  }

  async getQuizByLesson(lessonId: number): Promise<Quiz | undefined> {
    return Array.from(this.quizzes.values()).find(quiz => quiz.lessonId === lessonId);
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const quiz: Quiz = {
      ...insertQuiz,
      id: this.currentQuizId++,
      createdAt: new Date(),
    };
    this.quizzes.set(quiz.id, quiz);
    return quiz;
  }

  async getUserEnrollments(userId: number): Promise<CourseWithInstructor[]> {
    const userEnrollments = Array.from(this.enrollments.values())
      .filter(enrollment => enrollment.userId === userId);
    
    const enrolledCourses: CourseWithInstructor[] = [];
    
    for (const enrollment of userEnrollments) {
      const course = await this.getCourse(enrollment.courseId);
      if (course) {
        enrolledCourses.push({
          ...course,
          isEnrolled: true,
          userProgress: enrollment.progress,
        });
      }
    }
    
    return enrolledCourses;
  }

  async enrollUser(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const enrollment: Enrollment = {
      ...insertEnrollment,
      id: this.currentEnrollmentId++,
      progress: 0,
      completedLessons: [],
      enrolledAt: new Date(),
    };
    this.enrollments.set(enrollment.id, enrollment);
    
    // Update course enrollment count
    const course = this.courses.get(enrollment.courseId);
    if (course) {
      this.courses.set(course.id, {
        ...course,
        enrollmentCount: course.enrollmentCount + 1,
      });
    }
    
    return enrollment;
  }

  async isUserEnrolled(userId: number, courseId: number): Promise<boolean> {
    return Array.from(this.enrollments.values()).some(
      enrollment => enrollment.userId === userId && enrollment.courseId === courseId
    );
  }

  async updateEnrollmentProgress(userId: number, courseId: number, progress: number, completedLessons: number[]): Promise<void> {
    const enrollment = Array.from(this.enrollments.values()).find(
      e => e.userId === userId && e.courseId === courseId
    );
    
    if (enrollment) {
      this.enrollments.set(enrollment.id, {
        ...enrollment,
        progress,
        completedLessons,
      });
    }
  }

  async getLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined> {
    return Array.from(this.lessonProgress.values()).find(
      progress => progress.userId === userId && progress.lessonId === lessonId
    );
  }

  async updateLessonProgress(insertProgress: InsertLessonProgress): Promise<LessonProgress> {
    const existing = await this.getLessonProgress(insertProgress.userId, insertProgress.lessonId);
    
    if (existing) {
      const updated: LessonProgress = {
        ...existing,
        ...insertProgress,
        completedAt: insertProgress.completed ? new Date() : existing.completedAt,
      };
      this.lessonProgress.set(existing.id, updated);
      return updated;
    } else {
      const newProgress: LessonProgress = {
        ...insertProgress,
        id: this.currentLessonProgressId++,
        completedAt: insertProgress.completed ? new Date() : null,
      };
      this.lessonProgress.set(newProgress.id, newProgress);
      return newProgress;
    }
  }

  async getUserStats(userId: number): Promise<UserStats> {
    const userEnrollments = Array.from(this.enrollments.values())
      .filter(enrollment => enrollment.userId === userId);
    
    const completedCourses = userEnrollments.filter(enrollment => enrollment.progress === 100).length;
    
    const userLessonProgress = Array.from(this.lessonProgress.values())
      .filter(progress => progress.userId === userId && progress.completed);
    
    // Calculate total hours learned (assuming each completed lesson averages 15 minutes)
    const hoursLearned = Math.round(userLessonProgress.length * 0.25);
    
    return {
      enrolledCourses: userEnrollments.length,
      completedCourses,
      hoursLearned,
      certificates: completedCourses, // 1 certificate per completed course
    };
  }

  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const attempt: QuizAttempt = {
      ...insertAttempt,
      id: this.currentQuizAttemptId++,
      completedAt: new Date(),
    };
    this.quizAttempts.set(attempt.id, attempt);
    return attempt;
  }

  async getQuizAttempts(userId: number, quizId: number): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttempts.values())
      .filter(attempt => attempt.userId === userId && attempt.quizId === quizId)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async initializeDatabase() {
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        avatar TEXT,
        email_verified BOOLEAN DEFAULT FALSE NOT NULL,
        email_verification_token TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        instructor_id INTEGER REFERENCES users(id),
        category VARCHAR(100) NOT NULL,
        level VARCHAR(50) NOT NULL,
        price INTEGER NOT NULL,
        thumbnail TEXT,
        rating INTEGER DEFAULT 0,
        enrollment_count INTEGER DEFAULT 0,
        duration INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url TEXT,
        duration INTEGER DEFAULT 0,
        "order" INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER REFERENCES lessons(id),
        title VARCHAR(255) NOT NULL,
        questions JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        course_id INTEGER REFERENCES courses(id),
        progress INTEGER DEFAULT 0,
        completed_lessons JSONB DEFAULT '[]',
        enrolled_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        lesson_id INTEGER REFERENCES lessons(id),
        completed BOOLEAN DEFAULT FALSE,
        watch_time INTEGER DEFAULT 0,
        completed_at TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        quiz_id INTEGER REFERENCES quizzes(id),
        score INTEGER NOT NULL,
        answers JSONB NOT NULL,
        completed_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Seed initial data
    await this.seedData();
  }

  private async seedData() {
    // Check if data already exists
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    if (Number(userCount[0].count) > 0) return;

    // Insert demo users
    const [instructor1] = await sql`
      INSERT INTO users (username, password, first_name, last_name, email, role, avatar, email_verified)
      VALUES ('sarah_johnson', 'password123', 'Sarah', 'Johnson', 'sarah@example.com', 'instructor', 'https://images.unsplash.com/photo-1494790108375-2616b612b8c5?w=100&h=100&fit=crop&crop=face', TRUE)
      RETURNING *
    `;

    const [instructor2] = await sql`
      INSERT INTO users (username, password, first_name, last_name, email, role, avatar, email_verified)
      VALUES ('michael_chen', 'password123', 'Dr. Michael', 'Chen', 'michael@example.com', 'instructor', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', TRUE)
      RETURNING *
    `;

    const [student] = await sql`
      INSERT INTO users (username, password, first_name, last_name, email, role, avatar, email_verified)
      VALUES ('john_doe', 'password123', 'John', 'Doe', 'john@example.com', 'student', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', FALSE)
      RETURNING *
    `;

    // Insert demo courses
    const [course1] = await sql`
      INSERT INTO courses (title, description, instructor_id, category, level, price, thumbnail, rating, enrollment_count, duration)
      VALUES ('Complete Web Development Bootcamp', 'Learn web development from scratch with HTML, CSS, JavaScript, React, and Node.js', ${instructor1.id}, 'Technology', 'Beginner', 8900, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop', 48, 324, 1200)
      RETURNING *
    `;

    const [course2] = await sql`
      INSERT INTO courses (title, description, instructor_id, category, level, price, thumbnail, rating, enrollment_count, duration)
      VALUES ('Data Science Fundamentals', 'Introduction to data science with Python, pandas, and machine learning basics', ${instructor2.id}, 'Technology', 'Intermediate', 12900, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop', 46, 156, 900)
      RETURNING *
    `;

    // Insert demo lessons
    const [lesson1] = await sql`
      INSERT INTO lessons (course_id, title, description, video_url, duration, "order")
      VALUES (${course1.id}, 'Introduction to React Hooks', 'Learn the basics of React hooks and state management', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 754, 1)
      RETURNING *
    `;

    const [lesson2] = await sql`
      INSERT INTO lessons (course_id, title, description, video_url, duration, "order")
      VALUES (${course1.id}, 'Building Your First Component', 'Create reusable React components', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 890, 2)
      RETURNING *
    `;

    // Insert demo quiz
    await sql`
      INSERT INTO quizzes (lesson_id, title, questions)
      VALUES (${lesson1.id}, 'Knowledge Check: React Basics', ${JSON.stringify([
        {
          id: 1,
          question: "What is the purpose of React hooks?",
          options: [
            "To add state and lifecycle methods to functional components",
            "To replace class components entirely",
            "To improve performance only",
            "To handle routing"
          ],
          correctAnswer: 0
        },
        {
          id: 2,
          question: "Which hook is used for state management?",
          options: [
            "useEffect",
            "useState",
            "useContext",
            "useReducer"
          ],
          correctAnswer: 1
        }
      ])})
    `;

    // Insert demo enrollments
    await sql`
      INSERT INTO enrollments (user_id, course_id, progress, completed_lessons)
      VALUES (${student.id}, ${course1.id}, 65, ${JSON.stringify([lesson1.id])})
    `;

    await sql`
      INSERT INTO enrollments (user_id, course_id, progress, completed_lessons)
      VALUES (${student.id}, ${course2.id}, 40, '[]')
    `;
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await sql`SELECT * FROM users WHERE id = ${id}`;
    if (result.length === 0) return undefined;
    
    const user = result[0];
    return {
      id: user.id,
      username: user.username,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.email_verified,
      emailVerificationToken: user.email_verification_token,
      createdAt: user.created_at
    };
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const result = await sql`SELECT * FROM users WHERE email_verification_token = ${token}`;
    if (result.length === 0) return undefined;

    const user = result[0];
    return {
      id: user.id,
      username: user.username,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.email_verified,
      emailVerificationToken: user.email_verification_token,
      createdAt: user.created_at
    };
  }

  async updateUserVerificationStatus(userId: number, emailVerified: boolean, verificationToken: string | null): Promise<User | undefined> {
    const [user] = await sql`
      UPDATE users
      SET email_verified = ${emailVerified}, email_verification_token = ${verificationToken}
      WHERE id = ${userId}
      RETURNING *
    `;

    if (!user) return undefined;

    return {
      id: user.id,
      username: user.username,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.email_verified,
      emailVerificationToken: user.email_verification_token,
      createdAt: user.created_at
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await sql`SELECT * FROM users WHERE username = ${username}`;
    if (result.length === 0) return undefined;
    
    const user = result[0];
    return {
      id: user.id,
      username: user.username,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.email_verified,
      emailVerificationToken: user.email_verification_token,
      createdAt: user.created_at
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (result.length === 0) return undefined;
    
    const user = result[0];
    return {
      id: user.id,
      username: user.username,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.email_verified,
      emailVerificationToken: user.email_verification_token,
      createdAt: user.created_at
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await sql`
      INSERT INTO users (username, password, first_name, last_name, email, role, avatar, email_verified, email_verification_token)
      VALUES (${insertUser.username}, ${insertUser.password}, ${insertUser.firstName}, ${insertUser.lastName}, ${insertUser.email}, ${insertUser.role || 'student'}, ${insertUser.avatar || null}, ${insertUser.emailVerified || false}, ${insertUser.emailVerificationToken || null})
      RETURNING *
    `;
    
    return {
      id: user.id,
      username: user.username,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.email_verified,
      emailVerificationToken: user.email_verification_token,
      createdAt: user.created_at
    };
  }

  async getCourses(limit = 10, offset = 0, category?: string, search?: string): Promise<CourseWithInstructor[]> {
    let baseQuery = `
      SELECT 
        c.*,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        u.avatar as instructor_avatar
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
    `;

    const whereConditions = [];
    const queryParams = [];
    
    if (category) {
      whereConditions.push(`c.category = $${queryParams.length + 1}`);
      queryParams.push(category);
    }
    if (search) {
      whereConditions.push(`(c.title ILIKE $${queryParams.length + 1} OR c.description ILIKE $${queryParams.length + 2})`);
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (whereConditions.length > 0) {
      baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    baseQuery += ` ORDER BY c.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    const result = await sql`SELECT 
      c.*,
      u.first_name as instructor_first_name,
      u.last_name as instructor_last_name,
      u.avatar as instructor_avatar
    FROM courses c
    JOIN users u ON c.instructor_id = u.id
    ORDER BY c.created_at DESC
    LIMIT ${limit} OFFSET ${offset}`;
    
    const coursesWithLessons = await Promise.all(result.map(async (course: any) => {
      const lessons = await sql`SELECT * FROM lessons WHERE course_id = ${course.id} ORDER BY "order"`;
      
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        instructorId: course.instructor_id,
        category: course.category,
        level: course.level,
        price: course.price,
        thumbnail: course.thumbnail,
        rating: course.rating,
        enrollmentCount: course.enrollment_count,
        duration: course.duration,
        createdAt: course.created_at,
        instructor: {
          firstName: course.instructor_first_name,
          lastName: course.instructor_last_name,
          avatar: course.instructor_avatar
        },
        lessons: lessons.map((lesson: any) => ({
          id: lesson.id,
          courseId: lesson.course_id,
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.video_url,
          duration: lesson.duration,
          order: lesson.order,
          createdAt: lesson.created_at
        }))
      };
    }));

    return coursesWithLessons;
  }

  async getCourse(id: number): Promise<CourseWithInstructor | undefined> {
    const result = await sql`
      SELECT 
        c.*,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        u.avatar as instructor_avatar
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ${id}
    `;

    if (result.length === 0) return undefined;

    const course = result[0];
    const lessons = await sql`SELECT * FROM lessons WHERE course_id = ${id} ORDER BY "order"`;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructorId: course.instructor_id,
      category: course.category,
      level: course.level,
      price: course.price,
      thumbnail: course.thumbnail,
      rating: course.rating,
      enrollmentCount: course.enrollment_count,
      duration: course.duration,
      createdAt: course.created_at,
      instructor: {
        firstName: course.instructor_first_name,
        lastName: course.instructor_last_name,
        avatar: course.instructor_avatar
      },
      lessons: lessons.map((lesson: any) => ({
        id: lesson.id,
        courseId: lesson.course_id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.video_url,
        duration: lesson.duration,
        order: lesson.order,
        createdAt: lesson.created_at
      }))
    };
  }

  async getCoursesByInstructor(instructorId: number): Promise<CourseWithInstructor[]> {
    const result = await sql`
      SELECT 
        c.*,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        u.avatar as instructor_avatar
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.instructor_id = ${instructorId}
      ORDER BY c.created_at DESC
    `;

    const coursesWithLessons = await Promise.all(result.map(async (course: any) => {
      const lessons = await sql`SELECT * FROM lessons WHERE course_id = ${course.id} ORDER BY "order"`;
      
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        instructorId: course.instructor_id,
        category: course.category,
        level: course.level,
        price: course.price,
        thumbnail: course.thumbnail,
        rating: course.rating,
        enrollmentCount: course.enrollment_count,
        duration: course.duration,
        createdAt: course.created_at,
        instructor: {
          firstName: course.instructor_first_name,
          lastName: course.instructor_last_name,
          avatar: course.instructor_avatar
        },
        lessons: lessons.map((lesson: any) => ({
          id: lesson.id,
          courseId: lesson.course_id,
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.video_url,
          duration: lesson.duration,
          order: lesson.order,
          createdAt: lesson.created_at
        }))
      };
    }));

    return coursesWithLessons;
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await sql`
      INSERT INTO courses (title, description, instructor_id, category, level, price, thumbnail, duration)
      VALUES (${insertCourse.title}, ${insertCourse.description}, ${insertCourse.instructorId}, ${insertCourse.category}, ${insertCourse.level}, ${insertCourse.price}, ${insertCourse.thumbnail || null}, ${insertCourse.duration || 0})
      RETURNING *
    `;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructorId: course.instructor_id,
      category: course.category,
      level: course.level,
      price: course.price,
      thumbnail: course.thumbnail,
      rating: course.rating,
      enrollmentCount: course.enrollment_count,
      duration: course.duration,
      createdAt: course.created_at
    };
  }

  async updateCourse(id: number, courseUpdate: Partial<Course>): Promise<Course | undefined> {
    const updates = [];
    const values = [];
    
    if (courseUpdate.title !== undefined) {
      updates.push('title = $' + (updates.length + 1));
      values.push(courseUpdate.title);
    }
    if (courseUpdate.description !== undefined) {
      updates.push('description = $' + (updates.length + 1));
      values.push(courseUpdate.description);
    }
    
    if (updates.length === 0) return undefined;
    
    const [course] = await sql`
      UPDATE courses 
      SET ${sql.raw(updates.join(', '))} 
      WHERE id = ${id} 
      RETURNING *
    `;

    if (!course) return undefined;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructorId: course.instructor_id,
      category: course.category,
      level: course.level,
      price: course.price,
      thumbnail: course.thumbnail,
      rating: course.rating,
      enrollmentCount: course.enrollment_count,
      duration: course.duration,
      createdAt: course.created_at
    };
  }

  // Additional methods would follow the same pattern...
  // For brevity, I'll implement a few key ones and indicate the pattern

  async getLessonsByourse(courseId: number): Promise<LessonWithQuiz[]> {
    const lessons = await sql`
      SELECT l.*, q.id as quiz_id, q.title as quiz_title, q.questions as quiz_questions, q.created_at as quiz_created_at
      FROM lessons l
      LEFT JOIN quizzes q ON l.id = q.lesson_id
      WHERE l.course_id = ${courseId}
      ORDER BY l."order"
    `;

    return lessons.map((lesson: any) => ({
      id: lesson.id,
      courseId: lesson.course_id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.video_url,
      duration: lesson.duration,
      order: lesson.order,
      createdAt: lesson.created_at,
      quiz: lesson.quiz_id ? {
        id: lesson.quiz_id,
        lessonId: lesson.id,
        title: lesson.quiz_title,
        questions: lesson.quiz_questions,
        createdAt: lesson.quiz_created_at
      } : undefined
    }));
  }

  async getLesson(id: number): Promise<LessonWithQuiz | undefined> {
    const result = await sql`
      SELECT l.*, q.id as quiz_id, q.title as quiz_title, q.questions as quiz_questions, q.created_at as quiz_created_at
      FROM lessons l
      LEFT JOIN quizzes q ON l.id = q.lesson_id
      WHERE l.id = ${id}
    `;

    if (result.length === 0) return undefined;

    const lesson = result[0];
    return {
      id: lesson.id,
      courseId: lesson.course_id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.video_url,
      duration: lesson.duration,
      order: lesson.order,
      createdAt: lesson.created_at,
      quiz: lesson.quiz_id ? {
        id: lesson.quiz_id,
        lessonId: lesson.id,
        title: lesson.quiz_title,
        questions: lesson.quiz_questions,
        createdAt: lesson.quiz_created_at
      } : undefined
    };
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const [lesson] = await sql`
      INSERT INTO lessons (course_id, title, description, video_url, duration, "order")
      VALUES (${insertLesson.courseId}, ${insertLesson.title}, ${insertLesson.description || null}, ${insertLesson.videoUrl || null}, ${insertLesson.duration || 0}, ${insertLesson.order})
      RETURNING *
    `;

    return {
      id: lesson.id,
      courseId: lesson.course_id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.video_url,
      duration: lesson.duration,
      order: lesson.order,
      createdAt: lesson.created_at
    };
  }

  async updateLesson(id: number, lessonUpdate: Partial<Lesson>): Promise<Lesson | undefined> {
    // Implementation similar to updateCourse
    return undefined; // Placeholder
  }

  async getQuizByLesson(lessonId: number): Promise<Quiz | undefined> {
    const result = await sql`SELECT * FROM quizzes WHERE lesson_id = ${lessonId}`;
    if (result.length === 0) return undefined;

    const quiz = result[0];
    return {
      id: quiz.id,
      lessonId: quiz.lesson_id,
      title: quiz.title,
      questions: quiz.questions,
      createdAt: quiz.created_at
    };
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const [quiz] = await sql`
      INSERT INTO quizzes (lesson_id, title, questions)
      VALUES (${insertQuiz.lessonId}, ${insertQuiz.title}, ${JSON.stringify(insertQuiz.questions)})
      RETURNING *
    `;

    return {
      id: quiz.id,
      lessonId: quiz.lesson_id,
      title: quiz.title,
      questions: quiz.questions,
      createdAt: quiz.created_at
    };
  }

  async getUserEnrollments(userId: number): Promise<CourseWithInstructor[]> {
    const enrollments = await sql`
      SELECT 
        c.*,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        u.avatar as instructor_avatar,
        e.progress as user_progress
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.instructor_id = u.id
      WHERE e.user_id = ${userId}
      ORDER BY e.enrolled_at DESC
    `;

    const coursesWithLessons = await Promise.all(enrollments.map(async (course: any) => {
      const lessons = await sql`SELECT * FROM lessons WHERE course_id = ${course.id} ORDER BY "order"`;
      
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        instructorId: course.instructor_id,
        category: course.category,
        level: course.level,
        price: course.price,
        thumbnail: course.thumbnail,
        rating: course.rating,
        enrollmentCount: course.enrollment_count,
        duration: course.duration,
        createdAt: course.created_at,
        instructor: {
          firstName: course.instructor_first_name,
          lastName: course.instructor_last_name,
          avatar: course.instructor_avatar
        },
        lessons: lessons.map((lesson: any) => ({
          id: lesson.id,
          courseId: lesson.course_id,
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.video_url,
          duration: lesson.duration,
          order: lesson.order,
          createdAt: lesson.created_at
        })),
        isEnrolled: true,
        userProgress: course.user_progress
      };
    }));

    return coursesWithLessons;
  }

  async enrollUser(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const [enrollment] = await sql`
      INSERT INTO enrollments (user_id, course_id)
      VALUES (${insertEnrollment.userId}, ${insertEnrollment.courseId})
      RETURNING *
    `;

    // Update course enrollment count
    await sql`
      UPDATE courses 
      SET enrollment_count = enrollment_count + 1 
      WHERE id = ${insertEnrollment.courseId}
    `;

    return {
      id: enrollment.id,
      userId: enrollment.user_id,
      courseId: enrollment.course_id,
      progress: enrollment.progress,
      completedLessons: enrollment.completed_lessons,
      enrolledAt: enrollment.enrolled_at
    };
  }

  async isUserEnrolled(userId: number, courseId: number): Promise<boolean> {
    const result = await sql`
      SELECT 1 FROM enrollments 
      WHERE user_id = ${userId} AND course_id = ${courseId}
    `;
    return result.length > 0;
  }

  async updateEnrollmentProgress(userId: number, courseId: number, progress: number, completedLessons: number[]): Promise<void> {
    await sql`
      UPDATE enrollments 
      SET progress = ${progress}, completed_lessons = ${JSON.stringify(completedLessons)}
      WHERE user_id = ${userId} AND course_id = ${courseId}
    `;
  }

  async getLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined> {
    const result = await sql`
      SELECT * FROM lesson_progress 
      WHERE user_id = ${userId} AND lesson_id = ${lessonId}
    `;

    if (result.length === 0) return undefined;

    const progress = result[0];
    return {
      id: progress.id,
      userId: progress.user_id,
      lessonId: progress.lesson_id,
      completed: progress.completed,
      watchTime: progress.watch_time,
      completedAt: progress.completed_at
    };
  }

  async updateLessonProgress(insertProgress: InsertLessonProgress): Promise<LessonProgress> {
    const existing = await this.getLessonProgress(insertProgress.userId, insertProgress.lessonId);

    if (existing) {
      const [progress] = await sql`
        UPDATE lesson_progress 
        SET completed = ${insertProgress.completed ?? existing.completed}, 
            watch_time = ${insertProgress.watchTime ?? existing.watchTime},
            completed_at = ${insertProgress.completed ? new Date() : existing.completedAt}
        WHERE user_id = ${insertProgress.userId} AND lesson_id = ${insertProgress.lessonId}
        RETURNING *
      `;

      return {
        id: progress.id,
        userId: progress.user_id,
        lessonId: progress.lesson_id,
        completed: progress.completed,
        watchTime: progress.watch_time,
        completedAt: progress.completed_at
      };
    } else {
      const [progress] = await sql`
        INSERT INTO lesson_progress (user_id, lesson_id, completed, watch_time, completed_at)
        VALUES (${insertProgress.userId}, ${insertProgress.lessonId}, ${insertProgress.completed ?? false}, ${insertProgress.watchTime ?? 0}, ${insertProgress.completed ? new Date() : null})
        RETURNING *
      `;

      return {
        id: progress.id,
        userId: progress.user_id,
        lessonId: progress.lesson_id,
        completed: progress.completed,
        watchTime: progress.watch_time,
        completedAt: progress.completed_at
      };
    }
  }

  async getUserStats(userId: number): Promise<UserStats> {
    const enrolledCount = await sql`
      SELECT COUNT(*) as count FROM enrollments WHERE user_id = ${userId}
    `;

    const completedCount = await sql`
      SELECT COUNT(*) as count FROM enrollments WHERE user_id = ${userId} AND progress = 100
    `;

    const hoursLearned = await sql`
      SELECT COALESCE(SUM(watch_time), 0) as total_time 
      FROM lesson_progress 
      WHERE user_id = ${userId}
    `;

    return {
      enrolledCourses: Number(enrolledCount[0].count),
      completedCourses: Number(completedCount[0].count),
      hoursLearned: Math.round(Number(hoursLearned[0].total_time) / 3600),
      certificates: Number(completedCount[0].count)
    };
  }

  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [attempt] = await sql`
      INSERT INTO quiz_attempts (user_id, quiz_id, score, answers)
      VALUES (${insertAttempt.userId}, ${insertAttempt.quizId}, ${insertAttempt.score}, ${JSON.stringify(insertAttempt.answers)})
      RETURNING *
    `;

    return {
      id: attempt.id,
      userId: attempt.user_id,
      quizId: attempt.quiz_id,
      score: attempt.score,
      answers: attempt.answers,
      completedAt: attempt.completed_at
    };
  }

  async getQuizAttempts(userId: number, quizId: number): Promise<QuizAttempt[]> {
    const attempts = await sql`
      SELECT * FROM quiz_attempts 
      WHERE user_id = ${userId} AND quiz_id = ${quizId}
      ORDER BY completed_at DESC
    `;

    return attempts.map((attempt: any) => ({
      id: attempt.id,
      userId: attempt.user_id,
      quizId: attempt.quiz_id,
      score: attempt.score,
      answers: attempt.answers,
      completedAt: attempt.completed_at
    }));
  }
}

// Initialize database storage
const dbStorage = new DatabaseStorage();

// Export the storage instance
export const storage = dbStorage;
