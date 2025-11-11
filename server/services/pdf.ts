import { PDFDocument } from "pdf-lib";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface ProcessedPDF {
  totalPages: number;
  pageImages: string[];
}

export async function processPDF(pdfPath: string, paperId: string): Promise<ProcessedPDF> {
  const pdfBytes = await fs.readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();
  const pageImages: string[] = [];

  const pageImagesDir = path.join(process.cwd(), "uploads", "page-images", paperId);
  await fs.mkdir(pageImagesDir, { recursive: true });

  const outputPrefix = path.join(pageImagesDir, "page");
  
  try {
    await execAsync(`pdftoppm -png -r 150 "${pdfPath}" "${outputPrefix}"`);
    
    const files = await fs.readdir(pageImagesDir);
    const pngFiles = files
      .filter(f => f.endsWith('.png'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });

    for (let i = 0; i < pngFiles.length; i++) {
      const oldPath = path.join(pageImagesDir, pngFiles[i]);
      const newPath = path.join(pageImagesDir, `page-${i + 1}.png`);
      await fs.rename(oldPath, newPath);
      pageImages.push(`/uploads/page-images/${paperId}/page-${i + 1}.png`);
    }

    return {
      totalPages: pngFiles.length,
      pageImages,
    };
  } catch (error) {
    console.error("PDF processing error:", error);
    throw new Error("Failed to process PDF");
  }
}
