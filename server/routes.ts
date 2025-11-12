import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { processPDF } from "./services/pdf";
import { markAnswer } from "./services/openai";
import { processPaper } from "./services/paperProcessor";
import { insertPaperSchema, insertQuestionSchema, insertAttemptSchema, insertResponseSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const dir = path.join(process.cwd(), "uploads", "papers");
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/uploads", (await import("express")).static("uploads"));

  app.get("/api/boards", async (req, res) => {
    try {
      const boards = await storage.getBoards();
      res.json(boards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch boards" });
    }
  });

  app.get("/api/levels", async (req, res) => {
    try {
      const levels = await storage.getLevels();
      res.json(levels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch levels" });
    }
  });

  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });

  app.get("/api/papers", async (req, res) => {
    try {
      const { levelId, boardId, subjectId, year } = req.query;
      const papers = await storage.getPapers({
        levelId: levelId as string,
        boardId: boardId as string,
        subjectId: subjectId as string,
        year: year ? parseInt(year as string) : undefined,
      });
      res.json(papers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch papers" });
    }
  });

  app.get("/api/papers/:id", async (req, res) => {
    try {
      const paper = await storage.getPaper(req.params.id);
      if (!paper) {
        return res.status(404).json({ error: "Paper not found" });
      }
      res.json(paper);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch paper" });
    }
  });

  app.get("/api/papers/:id/pages", async (req, res) => {
    try {
      const pages = await storage.getPaperPages(req.params.id);
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch paper pages" });
    }
  });

  app.get("/api/papers/:id/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestions(req.params.id);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  app.post("/api/papers/process", async (req, res) => {
    try {
      const schema = z.object({
        paperUrl: z.string().url(),
        markSchemeUrl: z.string().url(),
      });

      const { paperUrl, markSchemeUrl } = schema.parse(req.body);

      const job = await storage.createProcessingJob({
        paperUrl,
        markSchemeUrl,
        status: 'pending',
        progress: 0,
      });

      processPaper(job.id).catch(err => {
        console.error("Background processing error:", err);
      });

      res.json({ jobId: job.id });
    } catch (error) {
      console.error("Process paper error:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/papers/process/:jobId", async (req, res) => {
    try {
      const job = await storage.getProcessingJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Get job error:", error);
      res.status(500).json({ error: "Failed to fetch job status" });
    }
  });

  app.post("/api/papers", upload.fields([
    { name: "paperPdf", maxCount: 1 },
    { name: "markSchemePdf", maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const paperFile = files["paperPdf"]?.[0];
      const markSchemeFile = files["markSchemePdf"]?.[0];

      if (!paperFile) {
        return res.status(400).json({ error: "Paper PDF is required" });
      }

      const paperData = insertPaperSchema.parse({
        ...req.body,
        year: parseInt(req.body.year),
        questionCount: req.body.questionCount ? parseInt(req.body.questionCount) : undefined,
        totalMarks: req.body.totalMarks ? parseInt(req.body.totalMarks) : undefined,
        pdfPath: `/uploads/papers/${paperFile.filename}`,
        markSchemePath: markSchemeFile ? `/uploads/papers/${markSchemeFile.filename}` : undefined,
      });

      const paper = await storage.createPaper(paperData);

      const pdfPath = path.join(process.cwd(), "uploads", "papers", paperFile.filename);
      const processed = await processPDF(pdfPath, paper.id);

      for (let i = 0; i < processed.totalPages; i++) {
        await storage.createPaperPage({
          paperId: paper.id,
          pageNumber: i + 1,
          imagePath: processed.pageImages[i],
          textOcr: null,
        });
      }

      res.json(paper);
    } catch (error) {
      console.error("Paper upload error:", error);
      res.status(500).json({ error: "Failed to upload paper" });
    }
  });

  app.post("/api/papers/:id/questions", async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse({
        ...req.body,
        paperId: req.params.id,
        pageNumber: parseInt(req.body.pageNumber),
        maxMarks: parseInt(req.body.maxMarks),
      });

      const question = await storage.createQuestion(questionData);
      res.json(question);
    } catch (error) {
      console.error("Question creation error:", error);
      res.status(400).json({ error: "Failed to create question" });
    }
  });

  app.post("/api/attempts", async (req, res) => {
    try {
      const sessionId = req.body.sessionId || `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const attemptData = insertAttemptSchema.parse({
        paperId: req.body.paperId,
        sessionId,
        completedAt: null,
        totalScore: null,
        maxScore: null,
      });

      const attempt = await storage.createAttempt(attemptData);
      res.json(attempt);
    } catch (error) {
      console.error("Attempt creation error:", error);
      res.status(400).json({ error: "Failed to create attempt" });
    }
  });

  app.get("/api/attempts/:id", async (req, res) => {
    try {
      const attempt = await storage.getAttempt(req.params.id);
      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found" });
      }
      res.json(attempt);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attempt" });
    }
  });

  app.get("/api/attempts/:id/responses", async (req, res) => {
    try {
      const responses = await storage.getResponses(req.params.id);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  app.post("/api/attempts/:id/submit-page", async (req, res) => {
    try {
      const { pageNumber, studentAnswer, questionId, maxMarks } = req.body;

      const attempt = await storage.getAttempt(req.params.id);
      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found" });
      }

      const pages = await storage.getPaperPages(attempt.paperId);
      const pageData = pages.find(p => p.pageNumber === parseInt(pageNumber));
      
      if (!pageData) {
        return res.status(400).json({ error: "Invalid page number for this paper" });
      }

      const actualMaxMarks = pageData.maxMarks || maxMarks || 6;

      let question;
      if (questionId) {
        question = await storage.getQuestion(questionId);
      }

      const markingResult = await markAnswer(
        studentAnswer,
        actualMaxMarks,
        question?.instructions || "Answer the question",
        question?.markSchemeExcerpt || undefined
      );

      const responseData = insertResponseSchema.parse({
        attemptId: req.params.id,
        questionId: questionId || null,
        pageNumber: parseInt(pageNumber),
        studentAnswer,
        aiScore: markingResult.awardedMarks,
        aiFeedback: markingResult.feedback,
        aiConfidence: markingResult.confidence,
        improvementTips: markingResult.improvementTips,
        maxMarks: actualMaxMarks,
        reviewedByHuman: false,
        finalScore: null,
        finalFeedback: null,
      });

      const response = await storage.createResponse(responseData);
      res.json({ ...response, ...markingResult });
    } catch (error) {
      console.error("Submit page error:", error);
      res.status(500).json({ error: "Failed to submit page" });
    }
  });

  app.post("/api/attempts/:id/complete", async (req, res) => {
    try {
      const responses = await storage.getResponses(req.params.id);
      
      const totalScore = responses.reduce((sum, r) => sum + (r.aiScore || 0), 0);
      const maxScore = responses.reduce((sum, r) => sum + r.maxMarks, 0);

      const attempt = await storage.updateAttempt(req.params.id, {
        completedAt: new Date(),
        totalScore,
        maxScore,
      });

      res.json(attempt);
    } catch (error) {
      console.error("Complete attempt error:", error);
      res.status(500).json({ error: "Failed to complete attempt" });
    }
  });

  app.get("/api/admin/moderation-queue", async (req, res) => {
    try {
      const lowConfidence = await storage.getLowConfidenceResponses();
      res.json(lowConfidence);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch moderation queue" });
    }
  });

  app.post("/api/admin/responses/:id/override", async (req, res) => {
    try {
      const { finalScore, finalFeedback } = req.body;
      
      const response = await storage.updateResponse(req.params.id, {
        finalScore: parseInt(finalScore),
        finalFeedback,
        reviewedByHuman: true,
      });

      res.json(response);
    } catch (error) {
      console.error("Override error:", error);
      res.status(500).json({ error: "Failed to override response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
