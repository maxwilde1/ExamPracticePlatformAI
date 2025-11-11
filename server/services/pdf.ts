import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

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

  for (let i = 0; i < totalPages; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
    newPdf.addPage(copiedPage);
    
    const singlePageBytes = await newPdf.save();
    
    const imagePath = path.join(pageImagesDir, `page-${i + 1}.png`);
    
    await sharp(Buffer.from(singlePageBytes), {
      density: 150,
    })
      .png()
      .toFile(imagePath);
    
    pageImages.push(`/uploads/page-images/${paperId}/page-${i + 1}.png`);
  }

  return {
    totalPages,
    pageImages,
  };
}
