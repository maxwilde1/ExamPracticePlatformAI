import {
  type Board,
  type Level,
  type Subject,
  type Paper,
  type PaperPage,
  type Question,
  type Attempt,
  type Response,
  type AdminUser,
  type InsertBoard,
  type InsertLevel,
  type InsertSubject,
  type InsertPaper,
  type InsertPaperPage,
  type InsertQuestion,
  type InsertAttempt,
  type InsertResponse,
  type InsertAdminUser,
  boards,
  levels,
  subjects,
  papers,
  paperPages,
  questions,
  attempts,
  responses,
  adminUsers,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getBoards(): Promise<Board[]>;
  getLevels(): Promise<Level[]>;
  getSubjects(): Promise<Subject[]>;
  
  getPapers(filters?: { levelId?: string; boardId?: string; subjectId?: string; year?: number }): Promise<Paper[]>;
  getPaper(id: string): Promise<Paper | undefined>;
  createPaper(paper: InsertPaper): Promise<Paper>;
  updatePaper(id: string, paper: Partial<InsertPaper>): Promise<Paper | undefined>;
  
  getPaperPages(paperId: string): Promise<PaperPage[]>;
  createPaperPage(page: InsertPaperPage): Promise<PaperPage>;
  
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
}

export class DbStorage implements IStorage {
  async getBoards(): Promise<Board[]> {
    return await db.select().from(boards);
  }

  async getLevels(): Promise<Level[]> {
    return await db.select().from(levels);
  }

  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async getPapers(filters?: { levelId?: string; boardId?: string; subjectId?: string; year?: number }): Promise<Paper[]> {
    let query = db.select().from(papers);
    
    const conditions = [];
    if (filters?.levelId) conditions.push(eq(papers.levelId, filters.levelId));
    if (filters?.boardId) conditions.push(eq(papers.boardId, filters.boardId));
    if (filters?.subjectId) conditions.push(eq(papers.subjectId, filters.subjectId));
    if (filters?.year) conditions.push(eq(papers.year, filters.year));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(papers.year));
  }

  async getPaper(id: string): Promise<Paper | undefined> {
    const result = await db.select().from(papers).where(eq(papers.id, id));
    return result[0];
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
    return await db.select().from(responses).where(eq(responses.attemptId, attemptId)).orderBy(responses.pageNumber);
  }

  async updateResponse(id: string, response: Partial<InsertResponse>): Promise<Response | undefined> {
    const result = await db.update(responses).set(response).where(eq(responses.id, id)).returning();
    return result[0];
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
}

export const storage = new DbStorage();
