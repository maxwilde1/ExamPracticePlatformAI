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
        feedbackMode: req.body.feedbackMode || 'immediate',
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

  app.delete("/api/responses/:id", async (req, res) => {
    try {
      await storage.deleteResponse(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete response error:", error);
      res.status(500).json({ error: "Failed to delete response" });
    }
  });

  app.post("/api/attempts/:id/submit-question", async (req, res) => {
    try {
      const { questionNumber, studentAnswer } = req.body;

      if (!questionNumber || !studentAnswer) {
        return res.status(400).json({ error: "questionNumber and studentAnswer are required" });
      }

      const attempt = await storage.getAttempt(req.params.id);
      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found" });
      }

      const paper = await storage.getPaper(attempt.paperId);
      if (!paper) {
        return res.status(404).json({ error: "Paper not found" });
      }

      const paperPages = await storage.getPaperPages(attempt.paperId);
      const markSchemePages = await storage.getMarkSchemePages(attempt.paperId);
      
      const questionPaperPage = paperPages.find(p => p.questionNumber === questionNumber);
      const questionMarkSchemePage = markSchemePages.find(p => p.questionNumber === questionNumber);

      if (!questionPaperPage) {
        return res.status(400).json({ error: "Invalid question number for this paper" });
      }

      let markingResult = null;
      
      // Only mark immediately if feedbackMode is 'immediate'
      if (attempt.feedbackMode === 'immediate') {
        markingResult = await markAnswer(
          studentAnswer,
          paper.pdfUrl,
          questionPaperPage.pageNumber,
          paper.markSchemeUrl,
          questionMarkSchemePage?.pageNumber || questionPaperPage.pageNumber
        );
      }

      const responseData = insertResponseSchema.parse({
        attemptId: req.params.id,
        questionId: null,
        questionNumber,
        studentAnswer,
        aiScore: markingResult?.awardedMarks || null,
        aiFeedback: markingResult?.feedback || null,
        aiConfidence: markingResult?.confidence || null,
        improvementTips: markingResult?.improvementTips || null,
        reviewedByHuman: false,
        finalScore: null,
        finalFeedback: null,
      });

      const response = await storage.createResponse(responseData);
      res.json({ ...response, ...(markingResult || {}) });
    } catch (error) {
      console.error("Submit question error:", error);
      res.status(500).json({ error: "Failed to submit question" });
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

      let question;
      if (questionId) {
        question = await storage.getQuestion(questionId);
      }

      const paper = await storage.getPaper(attempt.paperId);
      if (!paper) {
        return res.status(404).json({ error: "Paper not found" });
      }

      const markingResult = await markAnswer(
        studentAnswer,
        paper.pdfUrl,
        pageData.pageNumber,
        paper.markSchemeUrl,
        pageData.pageNumber
      );

      const responseData = insertResponseSchema.parse({
        attemptId: req.params.id,
        questionId: questionId || null,
        questionNumber: pageData.questionNumber,
        studentAnswer,
        aiScore: markingResult.awardedMarks,
        aiFeedback: markingResult.feedback,
        aiConfidence: markingResult.confidence,
        improvementTips: markingResult.improvementTips,
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

  app.post("/api/attempts/:id/mark-all", async (req, res) => {
    try {
      const attempt = await storage.getAttempt(req.params.id);
      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found" });
      }

      const paper = await storage.getPaper(attempt.paperId);
      if (!paper) {
        return res.status(404).json({ error: "Paper not found" });
      }

      const responses = await storage.getResponses(req.params.id);
      const paperPages = await storage.getPaperPages(attempt.paperId);
      const markSchemePages = await storage.getMarkSchemePages(attempt.paperId);

      // Mark all responses that don't have AI feedback yet
      const markingPromises = responses
        .filter(r => !r.aiScore && !r.aiFeedback)
        .map(async (response) => {
          const questionPaperPage = paperPages.find(p => p.questionNumber === response.questionNumber);
          const questionMarkSchemePage = markSchemePages.find(p => p.questionNumber === response.questionNumber);

          if (!questionPaperPage) {
            return null;
          }

          const markingResult = await markAnswer(
            response.studentAnswer,
            paper.pdfUrl,
            questionPaperPage.pageNumber,
            paper.markSchemeUrl,
            questionMarkSchemePage?.pageNumber || questionPaperPage.pageNumber
          );

          await storage.updateResponse(response.id, {
            aiScore: markingResult.awardedMarks,
            aiFeedback: markingResult.feedback,
            aiConfidence: markingResult.confidence,
            improvementTips: markingResult.improvementTips,
          });

          return markingResult;
        });

      await Promise.all(markingPromises);

      const updatedResponses = await storage.getResponses(req.params.id);
      res.json(updatedResponses);
    } catch (error) {
      console.error("Mark all error:", error);
      res.status(500).json({ error: "Failed to mark responses" });
    }
  });

  app.post("/api/attempts/:id/complete", async (req, res) => {
    try {
      const responses = await storage.getResponses(req.params.id);
      
      const totalScore = responses.reduce((sum, r) => sum + (r.aiScore || 0), 0);

      const attempt = await storage.updateAttempt(req.params.id, {
        completedAt: new Date(),
        totalScore,
        maxScore: null,
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
