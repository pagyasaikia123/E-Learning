import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("student"), // 'student' or 'instructor'
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructorId: integer("instructor_id").notNull(),
  category: text("category").notNull(),
  level: text("level").notNull(), // 'Beginner', 'Intermediate', 'Advanced'
  price: integer("price").notNull(), // in cents
  thumbnail: text("thumbnail"),
  rating: integer("rating").default(0), // out of 5, stored as integer (4.8 = 48)
  enrollmentCount: integer("enrollment_count").default(0),
  duration: integer("duration").default(0), // in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  duration: integer("duration").default(0), // in seconds
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  questions: jsonb("questions").notNull(), // Array of question objects with different types
  timeLimit: integer("time_limit"), // in minutes
  passingScore: integer("passing_score").default(70), // percentage
  allowRetries: boolean("allow_retries").default(true),
  shuffleQuestions: boolean("shuffle_questions").default(false),
  showCorrectAnswers: boolean("show_correct_answers").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  progress: integer("progress").default(0), // percentage 0-100
  completedLessons: jsonb("completed_lessons").default([]), // Array of lesson IDs
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  completed: boolean("completed").default(false),
  watchTime: integer("watch_time").default(0), // in seconds
  completedAt: timestamp("completed_at"),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  quizId: integer("quiz_id").notNull(),
  answers: jsonb("answers").notNull(), // Array of user answers with question types
  score: integer("score").notNull(), // percentage
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  timeSpent: integer("time_spent"), // in seconds
  passed: boolean("passed").notNull().default(false),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  enrollmentCount: true,
  rating: true,
  instructorId: true // Add this line
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

// Zod Schemas for Quiz Questions
const baseQuestionSchema = z.object({
  id: z.number(), // Keep as number, can be a temporary ID on client before saving
  type: z.enum(['multiple-choice', 'true-false', 'fill-blank', 'matching', 'essay']),
  question: z.string().min(1, "Question text cannot be empty"),
  points: z.number().min(0, "Points cannot be negative").default(1),
  explanation: z.string().optional(),
});

const multipleChoiceQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('multiple-choice'),
  options: z.array(z.string().min(1, "Option text cannot be empty")).min(2, "Must have at least two options"),
  correctAnswer: z.number().min(0, "Correct answer index must be valid"),
  allowMultiple: z.boolean().optional().default(false),
});

const trueFalseQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('true-false'),
  correctAnswer: z.boolean(),
});

const fillBlankQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('fill-blank'),
  correctAnswers: z.array(z.string().min(1, "Correct answer text cannot be empty")).min(1, "Must have at least one correct answer"),
  caseSensitive: z.boolean().optional().default(false),
});

const matchingQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('matching'),
  leftItems: z.array(z.string().min(1)).min(1),
  rightItems: z.array(z.string().min(1)).min(1),
  correctMatches: z.record(z.number(), z.number()), 
});

const essayQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('essay'),
  maxWords: z.number().optional(),
  rubric: z.string().optional(),
});

export const quizQuestionSchema = z.discriminatedUnion("type", [
  multipleChoiceQuestionSchema,
  trueFalseQuestionSchema,
  fillBlankQuestionSchema,
  matchingQuestionSchema,
  essayQuestionSchema,
]);

// Update insertQuizSchema to use the detailed question schema
export const insertQuizSchema = createInsertSchema(quizzes, {
  questions: z.array(quizQuestionSchema).min(1, "A quiz must have at least one question"),
  // Ensure other fields have appropriate validation if needed
  title: z.string().min(1, "Quiz title cannot be empty"),
  lessonId: z.number(),
  description: z.string().optional(),
  timeLimit: z.number().min(0).optional(),
  passingScore: z.number().min(0).max(100).default(70),
  allowRetries: z.boolean().default(true),
  shuffleQuestions: z.boolean().default(false),
  showCorrectAnswers: z.boolean().default(true),
}).omit({
  id: true,
  createdAt: true,
});


export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
  progress: true,
  completedLessons: true,
});

export const insertLessonProgressSchema = createInsertSchema(lessonProgress).omit({
  id: true,
  completedAt: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  completedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;

// Extended types for API responses
export type CourseWithInstructor = Course & {
  instructor: Pick<User, 'firstName' | 'lastName' | 'avatar'>;
  lessons: Lesson[];
  isEnrolled?: boolean;
  userProgress?: number;
};

export type LessonWithQuiz = Lesson & {
  quiz?: Quiz;
};

export type UserStats = {
  enrolledCourses: number;
  completedCourses: number;
  hoursLearned: number;
  certificates: number;
};

// Advanced Quiz Question Types
export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching' | 'essay';

export interface BaseQuestion {
  id: number;
  type: QuestionType;
  question: string;
  points: number;
  explanation?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: string[];
  correctAnswer: number;
  allowMultiple?: boolean;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  correctAnswer: boolean;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank';
  correctAnswers: string[]; // Multiple acceptable answers
  caseSensitive?: boolean;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  leftItems: string[];
  rightItems: string[];
  correctMatches: Record<number, number>; // left index -> right index
}

export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  maxWords?: number;
  rubric?: string;
}

export type QuizQuestion = MultipleChoiceQuestion | TrueFalseQuestion | FillBlankQuestion | MatchingQuestion | EssayQuestion;

export interface QuizAnswer {
  questionId: number;
  type: QuestionType;
  answer: any; // Different types based on question type
  isCorrect?: boolean;
  pointsEarned?: number;
}
