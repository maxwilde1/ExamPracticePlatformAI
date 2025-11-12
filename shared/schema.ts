import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const boards = pgTable("boards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const levels = pgTable("levels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
});

export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  levelId: varchar("level_id").notNull().references(() => levels.id),
});

export const papers = pgTable("papers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id),
  boardId: varchar("board_id").notNull().references(() => boards.id),
  levelId: varchar("level_id").notNull().references(() => levels.id),
  series: text("series"),
  year: integer("year").notNull(),
  paperCode: text("paper_code"),
  tier: text("tier"),
  title: text("title").notNull(),
  questionCount: integer("question_count"),
  totalMarks: integer("total_marks"),
  pdfUrl: text("pdf_url"),
  markSchemeUrl: text("mark_scheme_url"),
  status: text("status").notNull().default('active'),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const paperPages = pgTable("paper_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paperId: varchar("paper_id").notNull().references(() => papers.id),
  pageNumber: integer("page_number").notNull(),
  questionNumber: text("question_number").notNull(),
});

export const markSchemePages = pgTable("mark_scheme_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paperId: varchar("paper_id").notNull().references(() => papers.id),
  pageNumber: integer("page_number").notNull(),
  questionNumber: text("question_number").notNull(),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paperId: varchar("paper_id").notNull().references(() => papers.id),
  questionNumber: text("question_number").notNull(),
  pageNumber: integer("page_number").notNull(),
  maxMarks: integer("max_marks").notNull(),
  instructions: text("instructions"),
  markSchemeExcerpt: text("mark_scheme_excerpt"),
});

export const attempts = pgTable("attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paperId: varchar("paper_id").notNull().references(() => papers.id),
  sessionId: text("session_id").notNull(),
  feedbackMode: text("feedback_mode").notNull().default('immediate'),
  startedAt: timestamp("started_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
  totalScore: integer("total_score"),
  maxScore: integer("max_score"),
});

export const responses = pgTable("responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  attemptId: varchar("attempt_id").notNull().references(() => attempts.id),
  questionId: varchar("question_id").references(() => questions.id),
  questionNumber: varchar("question_number").notNull(),
  studentAnswer: text("student_answer").notNull(),
  aiScore: integer("ai_score"),
  aiFeedback: text("ai_feedback"),
  aiConfidence: text("ai_confidence"),
  improvementTips: jsonb("improvement_tips"),
  reviewedByHuman: boolean("reviewed_by_human").default(false),
  finalScore: integer("final_score"),
  finalFeedback: text("final_feedback"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  replitId: text("replit_id").unique(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const processingJobs = pgTable("processing_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paperUrl: text("paper_url").notNull(),
  markSchemeUrl: text("mark_scheme_url").notNull(),
  status: text("status").notNull().default('pending'),
  progress: integer("progress").default(0),
  currentStep: text("current_step"),
  paperId: varchar("paper_id").references(() => papers.id),
  error: text("error"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

export const insertBoardSchema = createInsertSchema(boards).omit({ id: true });
export const insertLevelSchema = createInsertSchema(levels).omit({ id: true });
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true });
export const insertPaperSchema = createInsertSchema(papers).omit({ id: true, createdAt: true });
export const insertPaperPageSchema = createInsertSchema(paperPages).omit({ id: true });
export const insertMarkSchemePageSchema = createInsertSchema(markSchemePages).omit({ id: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertAttemptSchema = createInsertSchema(attempts).omit({ id: true, startedAt: true });
export const insertResponseSchema = createInsertSchema(responses).omit({ id: true, createdAt: true });
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ id: true, createdAt: true });
export const insertProcessingJobSchema = createInsertSchema(processingJobs).omit({ id: true, createdAt: true });

export type Board = typeof boards.$inferSelect;
export type Level = typeof levels.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Paper = typeof papers.$inferSelect;
export type PaperPage = typeof paperPages.$inferSelect;
export type MarkSchemePage = typeof markSchemePages.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type Response = typeof responses.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type ProcessingJob = typeof processingJobs.$inferSelect;

export type InsertBoard = z.infer<typeof insertBoardSchema>;
export type InsertLevel = z.infer<typeof insertLevelSchema>;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertPaper = z.infer<typeof insertPaperSchema>;
export type InsertPaperPage = z.infer<typeof insertPaperPageSchema>;
export type InsertMarkSchemePage = z.infer<typeof insertMarkSchemePageSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type InsertProcessingJob = z.infer<typeof insertProcessingJobSchema>;
