import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function downloadPdfAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

interface MarkingResult {
  awardedMarks: number;
  feedback: string;
  improvementTips: string[];
  confidence: "low" | "medium" | "high";
}

interface PaperMetadata {
  title: string;
  board: string;
  subject: string;
  level: string;
  year: number;
  series?: string;
  paperCode?: string;
  tier?: string;
}

type PageQuestionMapping = {
  pageNumber: number;
  questionNumber: string;
}[];

export async function extractPaperMetadata(pdfUrl: string): Promise<PaperMetadata> {
  const prompt = `Analyze the first few pages of this exam paper PDF and extract the following metadata:
- Exam board (e.g., AQA, Edexcel, OCR, etc.)
- Subject (e.g., Mathematics, Physics, Psychology, etc.)
- Level (e.g., GCSE, A-Level)
- Year (e.g., 2024)
- Series (e.g., June, November - optional)
- Paper code (e.g., 7182/1, 8300/2H - optional)
- Tier (e.g., Higher, Foundation - optional if applicable)
- Title (create a descriptive title like "AQA A-Level Psychology Paper 1 2024 June")

Look at the header/footer information on the cover page and first few pages.

Respond in JSON format:
{
  "title": "<string>",
  "board": "<string>",
  "subject": "<string>",
  "level": "<GCSE|A-Level>",
  "year": <number>,
  "series": "<string or null>",
  "paperCode": "<string or null>",
  "tier": "<string or null>"
}`;

  try {
    const base64Data = await downloadPdfAsBase64(pdfUrl);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { 
              type: "file", 
              file: { 
                filename: "paper.pdf",
                file_data: `data:application/pdf;base64,${base64Data}`
              } 
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content) as PaperMetadata;
  } catch (error) {
    console.error("OpenAI metadata extraction error:", error);
    throw new Error("Failed to extract paper metadata from PDF");
  }
}

export async function extractPaperPageMapping(pdfUrl: string): Promise<PageQuestionMapping> {
  const prompt = `Analyze this exam paper PDF and create a mapping of page numbers to question numbers.

For each page that contains a question, identify which question number(s) appear on that page.
Use the question numbering from the paper (e.g., "Q1", "Q2", "Q3a", "Q3b", etc.).

If a page has multiple questions or sub-questions, use the first one that appears.
Skip cover pages, instruction pages, or blank pages.

Respond in JSON format with a "mappings" array:
{
  "mappings": [
    {"pageNumber": 1, "questionNumber": "Q1"},
    {"pageNumber": 2, "questionNumber": "Q2"},
    {"pageNumber": 3, "questionNumber": "Q3"}
  ]
}`;

  try {
    const base64Data = await downloadPdfAsBase64(pdfUrl);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { 
              type: "file", 
              file: { 
                filename: "paper.pdf",
                file_data: `data:application/pdf;base64,${base64Data}`
              } 
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content);
    return result.mappings || [];
  } catch (error) {
    console.error("OpenAI page mapping extraction error:", error);
    throw new Error("Failed to extract page-to-question mapping from PDF");
  }
}

export async function extractMarkSchemePageMapping(pdfUrl: string): Promise<PageQuestionMapping> {
  const prompt = `Analyze this mark scheme PDF and create a mapping of page numbers to question numbers.

For each page that contains marking criteria for a question, identify which question number the page corresponds to.
Use the question numbering from the mark scheme (e.g., "Q1", "Q2", "Q3a", "Q3b", etc.).

If a page has marking criteria for multiple questions, use the first one.
Skip cover pages, instruction pages, or blank pages.

Respond in JSON format with a "mappings" array:
{
  "mappings": [
    {"pageNumber": 1, "questionNumber": "Q1"},
    {"pageNumber": 2, "questionNumber": "Q2"},
    {"pageNumber": 3, "questionNumber": "Q3"}
  ]
}`;

  try {
    const base64Data = await downloadPdfAsBase64(pdfUrl);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { 
              type: "file", 
              file: { 
                filename: "markscheme.pdf",
                file_data: `data:application/pdf;base64,${base64Data}`
              } 
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content);
    return result.mappings || [];
  } catch (error) {
    console.error("OpenAI mark scheme mapping extraction error:", error);
    throw new Error("Failed to extract page-to-question mapping from mark scheme PDF");
  }
}

export async function markAnswer(
  studentAnswer: string,
  paperPdfUrl: string | null,
  paperPageNumber: number,
  markSchemePdfUrl: string | null,
  markSchemePageNumber: number
): Promise<MarkingResult> {
  const prompt = `You are an expert exam marker for GCSE and A-Level examinations. Your task is to mark a student's answer fairly, critically and accurately.

I am providing you with:
1. The exam paper PDF - please look at page ${paperPageNumber} to see the question
2. The mark scheme PDF - please look at page ${markSchemePageNumber} for marking guidance
3. The student's answer below

Student's Answer:
${studentAnswer}

Please mark this answer by:
1. Reading the question from page ${paperPageNumber} of the exam paper PDF
2. Consulting the mark scheme on page ${markSchemePageNumber} of the mark scheme PDF
3. Awarding marks based on the official marking criteria
4. Providing constructive feedback

Respond in JSON format:
{
  "awardedMarks": <number>,
  "feedback": "<string>",
  "improvementTips": ["<tip1>", "<tip2>", "<tip3>"],
  "confidence": "<low|medium|high>"
}`;

  try {
    const messages: any[] = [
      {
        role: "user",
        content: []
      }
    ];

    messages[0].content.push({ type: "text", text: prompt });

    if (paperPdfUrl) {
      const paperBase64 = await downloadPdfAsBase64(paperPdfUrl);
      messages[0].content.push({
        type: "file",
        file: {
          filename: "exam-paper.pdf",
          file_data: `data:application/pdf;base64,${paperBase64}`
        }
      });
    }

    if (markSchemePdfUrl) {
      const markSchemeBase64 = await downloadPdfAsBase64(markSchemePdfUrl);
      messages[0].content.push({
        type: "file",
        file: {
          filename: "mark-scheme.pdf",
          file_data: `data:application/pdf;base64,${markSchemeBase64}`
        }
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content) as MarkingResult;
    
    // Ensure awarded marks is non-negative
    if (result.awardedMarks < 0) {
      result.awardedMarks = 0;
    }

    return result;
  } catch (error) {
    console.error("OpenAI marking error:", error);
    return {
      awardedMarks: 0,
      feedback: "Unable to automatically mark this answer. Please review manually.",
      improvementTips: ["This answer requires manual review."],
      confidence: "low",
    };
  }
}
