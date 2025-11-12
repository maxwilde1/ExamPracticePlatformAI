import {
  type Board,
  type Level,
  type Subject,
  type Paper,
  type PaperPage,
  type MarkSchemePage,
  type Question,
  type Attempt,
  type Response,
  type AdminUser,
  type ProcessingJob,
  type InsertBoard,
  type InsertLevel,
  type InsertSubject,
  type InsertPaper,
  type InsertPaperPage,
  type InsertMarkSchemePage,
  type InsertQuestion,
  type InsertAttempt,
  type InsertResponse,
  type InsertAdminUser,
  type InsertProcessingJob,
  boards,
  levels,
  subjects,
  papers,
  paperPages,
  markSchemePages,
  questions,
  attempts,
  responses,
  adminUsers,
  processingJobs,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export type EnrichedPaper = Paper & {
  boardName: string;
  subjectName: string;
  levelName: string;
};

export interface IStorage {
  getBoards(): Promise<Board[]>;
  createBoard(board: InsertBoard): Promise<Board>;
  getLevels(): Promise<Level[]>;
  createLevel(level: InsertLevel): Promise<Level>;
  getSubjects(): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  getPapers(filters?: { levelId?: string; boardId?: string; subjectId?: string; year?: number }): Promise<EnrichedPaper[]>;
  getPaper(id: string): Promise<EnrichedPaper | undefined>;
  createPaper(paper: InsertPaper): Promise<Paper>;
  updatePaper(id: string, paper: Partial<InsertPaper>): Promise<Paper | undefined>;
  
  getPaperPages(paperId: string): Promise<PaperPage[]>;
  createPaperPage(page: InsertPaperPage): Promise<PaperPage>;
  
  getMarkSchemePages(paperId: string): Promise<MarkSchemePage[]>;
  createMarkSchemePage(page: InsertMarkSchemePage): Promise<MarkSchemePage>;
  
  getQuestions(paperId: string): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  
  createAttempt(attempt: InsertAttempt): Promise<Attempt>;
  getAttempt(id: string): Promise<Attempt | undefined>;
  updateAttempt(id: string, attempt: Partial<InsertAttempt>): Promise<Attempt | undefined>;
  
  createResponse(response: InsertResponse): Promise<Response>;
  getResponses(attemptId: string): Promise<Response[]>;
  updateResponse(id: string, response: Partial<InsertResponse>): Promise<Response | undefined>;
  getLowConfidenceResponses(): Promise<Response[]>;
  
  getAdminUser(email: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  
  createProcessingJob(job: InsertProcessingJob): Promise<ProcessingJob>;
  getProcessingJob(id: string): Promise<ProcessingJob | undefined>;
  updateProcessingJob(id: string, job: Partial<InsertProcessingJob>): Promise<ProcessingJob | undefined>;
}

export class DbStorage implements IStorage {
  async getBoards(): Promise<Board[]> {
    return await db.select().from(boards);
  }

  async createBoard(board: InsertBoard): Promise<Board> {
    const result = await db.insert(boards).values(board).returning();
    return result[0];
  }

  async getLevels(): Promise<Level[]> {
    return await db.select().from(levels);
  }

  async createLevel(level: InsertLevel): Promise<Level> {
    const result = await db.insert(levels).values(level).returning();
    return result[0];
  }

  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const result = await db.insert(subjects).values(subject).returning();
    return result[0];
  }

  async getPapers(filters?: { levelId?: string; boardId?: string; subjectId?: string; year?: number }): Promise<EnrichedPaper[]> {
    let query = db.select({
      paper: papers,
      board: boards,
      subject: subjects,
      level: levels,
    })
    .from(papers)
    .innerJoin(boards, eq(papers.boardId, boards.id))
    .innerJoin(subjects, eq(papers.subjectId, subjects.id))
    .innerJoin(levels, eq(papers.levelId, levels.id));
    
    const conditions = [];
    if (filters?.levelId) conditions.push(eq(papers.levelId, filters.levelId));
    if (filters?.boardId) conditions.push(eq(papers.boardId, filters.boardId));
    if (filters?.subjectId) conditions.push(eq(papers.subjectId, filters.subjectId));
    if (filters?.year) conditions.push(eq(papers.year, filters.year));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const results = await query.orderBy(desc(papers.year));
    
    return results.map(row => ({
      ...row.paper,
      boardName: row.board.name,
      subjectName: row.subject.name,
      levelName: row.level.name,
    }));
  }

  async getPaper(id: string): Promise<EnrichedPaper | undefined> {
    const result = await db.select({
      paper: papers,
      board: boards,
      subject: subjects,
      level: levels,
    })
    .from(papers)
    .innerJoin(boards, eq(papers.boardId, boards.id))
    .innerJoin(subjects, eq(papers.subjectId, subjects.id))
    .innerJoin(levels, eq(papers.levelId, levels.id))
    .where(eq(papers.id, id));
    
    if (result.length === 0) return undefined;
    
    const row = result[0];
    return {
      ...row.paper,
      boardName: row.board.name,
      subjectName: row.subject.name,
      levelName: row.level.name,
    };
  }

  async createPaper(paper: InsertPaper): Promise<Paper> {
    const result = await db.insert(papers).values(paper).returning();
    return result[0];
  }

  async updatePaper(id: string, paper: Partial<InsertPaper>): Promise<Paper | undefined> {
    const result = await db.update(papers).set(paper).where(eq(papers.id, id)).returning();
    return result[0];
  }

  async getPaperPages(paperId: string): Promise<PaperPage[]> {
    return await db.select().from(paperPages).where(eq(paperPages.paperId, paperId)).orderBy(paperPages.pageNumber);
  }

  async createPaperPage(page: InsertPaperPage): Promise<PaperPage> {
    const result = await db.insert(paperPages).values(page).returning();
    return result[0];
  }

  async getMarkSchemePages(paperId: string): Promise<MarkSchemePage[]> {
    return await db.select().from(markSchemePages).where(eq(markSchemePages.paperId, paperId)).orderBy(markSchemePages.pageNumber);
  }

  async createMarkSchemePage(page: InsertMarkSchemePage): Promise<MarkSchemePage> {
    const result = await db.insert(markSchemePages).values(page).returning();
    return result[0];
  }

  async getQuestions(paperId: string): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.paperId, paperId)).orderBy(questions.pageNumber);
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const result = await db.select().from(questions).where(eq(questions.id, id));
    return result[0];
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const result = await db.insert(questions).values(question).returning();
    return result[0];
  }

  async createAttempt(attempt: InsertAttempt): Promise<Attempt> {
    const result = await db.insert(attempts).values(attempt).returning();
    return result[0];
  }

  async getAttempt(id: string): Promise<Attempt | undefined> {
    const result = await db.select().from(attempts).where(eq(attempts.id, id));
    return result[0];
  }

  async updateAttempt(id: string, attempt: Partial<InsertAttempt>): Promise<Attempt | undefined> {
    const result = await db.update(attempts).set(attempt).where(eq(attempts.id, id)).returning();
    return result[0];
  }

  async createResponse(response: InsertResponse): Promise<Response> {
    const result = await db.insert(responses).values(response).returning();
    return result[0];
  }

  async getResponses(attemptId: string): Promise<Response[]> {
    return await db.select().from(responses).where(eq(responses.attemptId, attemptId)).orderBy(responses.createdAt);
  }

  async updateResponse(id: string, response: Partial<InsertResponse>): Promise<Response | undefined> {
    const result = await db.update(responses).set(response).where(eq(responses.id, id)).returning();
    return result[0];
  }

  async deleteResponse(id: string): Promise<void> {
    await db.delete(responses).where(eq(responses.id, id));
  }

  async getLowConfidenceResponses(): Promise<Response[]> {
    return await db.select().from(responses).where(
      and(
        eq(responses.reviewedByHuman, false),
        eq(responses.aiConfidence, 'low')
      )
    );
  }

  async getAdminUser(email: string): Promise<AdminUser | undefined> {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return result[0];
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const result = await db.insert(adminUsers).values(user).returning();
    return result[0];
  }

  async createProcessingJob(job: InsertProcessingJob): Promise<ProcessingJob> {
    const result = await db.insert(processingJobs).values(job).returning();
    return result[0];
  }

  async getProcessingJob(id: string): Promise<ProcessingJob | undefined> {
    const result = await db.select().from(processingJobs).where(eq(processingJobs.id, id));
    return result[0];
  }

  async updateProcessingJob(id: string, job: Partial<InsertProcessingJob>): Promise<ProcessingJob | undefined> {
    const result = await db.update(processingJobs).set(job).where(eq(processingJobs.id, id)).returning();
    return result[0];
  }
}

export const storage = new DbStorage();
