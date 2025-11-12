import { storage } from "../storage";
import { extractPaperMetadata, extractPaperPageMapping, extractMarkSchemePageMapping } from "./openai";

export async function processPaper(jobId: string) {
  try {
    const job = await storage.getProcessingJob(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    await storage.updateProcessingJob(jobId, {
      status: 'processing',
      currentStep: 'Extracting metadata from paper',
      progress: 10,
    });

    const metadata = await extractPaperMetadata(job.paperUrl);

    await storage.updateProcessingJob(jobId, {
      currentStep: 'Extracting page mappings from paper',
      progress: 30,
    });

    const paperPageMappings = await extractPaperPageMapping(job.paperUrl);

    await storage.updateProcessingJob(jobId, {
      currentStep: 'Extracting page mappings from mark scheme',
      progress: 50,
    });

    const markSchemePageMappings = await extractMarkSchemePageMapping(job.markSchemeUrl);

    await storage.updateProcessingJob(jobId, {
      currentStep: 'Finding or creating board/subject/level',
      progress: 70,
    });

    const boards = await storage.getBoards();
    let board = boards.find(b => b.name.toLowerCase() === metadata.board.toLowerCase());
    if (!board) {
      board = await storage.createBoard({
        name: metadata.board,
        slug: metadata.board.toLowerCase().replace(/\s+/g, '-'),
      });
    }

    const levels = await storage.getLevels();
    let level = levels.find(l => l.name.toLowerCase() === metadata.level.toLowerCase());
    if (!level) {
      level = await storage.createLevel({
        name: metadata.level,
      });
    }

    const subjects = await storage.getSubjects();
    let subject = subjects.find(s => 
      s.name.toLowerCase() === metadata.subject.toLowerCase() && 
      s.levelId === level.id
    );
    if (!subject) {
      subject = await storage.createSubject({
        name: metadata.subject,
        levelId: level.id,
      });
    }

    await storage.updateProcessingJob(jobId, {
      currentStep: 'Creating paper record',
      progress: 80,
    });

    const paper = await storage.createPaper({
      subjectId: subject.id,
      boardId: board.id,
      levelId: level.id,
      year: metadata.year,
      title: metadata.title,
      series: metadata.series || null,
      paperCode: metadata.paperCode || null,
      tier: metadata.tier || null,
      pdfUrl: job.paperUrl,
      markSchemeUrl: job.markSchemeUrl,
      questionCount: paperPageMappings.length,
      status: 'active',
    });

    await storage.updateProcessingJob(jobId, {
      currentStep: 'Saving page mappings',
      progress: 90,
      paperId: paper.id,
    });

    for (const mapping of paperPageMappings) {
      await storage.createPaperPage({
        paperId: paper.id,
        pageNumber: mapping.pageNumber,
        questionNumber: mapping.questionNumber,
      });
    }

    for (const mapping of markSchemePageMappings) {
      await storage.createMarkSchemePage({
        paperId: paper.id,
        pageNumber: mapping.pageNumber,
        questionNumber: mapping.questionNumber,
      });
    }

    await storage.updateProcessingJob(jobId, {
      status: 'completed',
      currentStep: 'Processing complete',
      progress: 100,
      completedAt: new Date(),
    });

    return paper;
  } catch (error) {
    console.error("Paper processing error:", error);
    await storage.updateProcessingJob(jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
