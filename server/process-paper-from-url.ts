import { storage } from "./storage";
import { processPDF } from "./services/pdf";
import { promises as fs } from "fs";
import path from "path";

async function downloadPDF(url: string, outputPath: string): Promise<void> {
  console.log(`Downloading PDF from: ${url}`);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, buffer);
  console.log(`Downloaded PDF to: ${outputPath}`);
}

async function processPaperFromUrl(paperId: string) {
  console.log(`\nProcessing paper: ${paperId}`);
  
  const paper = await storage.getPaper(paperId);
  if (!paper) {
    throw new Error(`Paper not found: ${paperId}`);
  }

  console.log(`Found paper: ${paper.title}`);
  
  if (!paper.pdfPath) {
    throw new Error("Paper has no PDF path");
  }

  let localPdfPath: string;
  
  if (paper.pdfPath.startsWith('http://') || paper.pdfPath.startsWith('https://')) {
    console.log("PDF is a URL, downloading...");
    const filename = `${paperId}.pdf`;
    localPdfPath = path.join(process.cwd(), "uploads", "papers", filename);
    
    await downloadPDF(paper.pdfPath, localPdfPath);
    
    await storage.updatePaper(paperId, {
      pdfPath: `/uploads/papers/${filename}`,
    });
    
    console.log("Updated paper with local PDF path");
  } else {
    localPdfPath = path.join(process.cwd(), paper.pdfPath);
  }

  const existingPages = await storage.getPaperPages(paperId);
  if (existingPages.length > 0) {
    console.log(`Paper already has ${existingPages.length} pages, skipping processing`);
    return;
  }

  console.log("Processing PDF into page images...");
  const processed = await processPDF(localPdfPath, paperId);
  console.log(`Created ${processed.totalPages} page images`);

  console.log("Saving pages to database...");
  for (let i = 0; i < processed.totalPages; i++) {
    await storage.createPaperPage({
      paperId: paperId,
      pageNumber: i + 1,
      imagePath: processed.pageImages[i],
      textOcr: null,
    });
  }

  console.log(`✓ Successfully processed paper with ${processed.totalPages} pages`);
}

const paperId = process.argv[2];

if (!paperId) {
  console.error("Usage: tsx server/process-paper-from-url.ts <paper-id>");
  process.exit(1);
}

processPaperFromUrl(paperId)
  .then(() => {
    console.log("\n✓ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Error:", error.message);
    process.exit(1);
  });
