import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface MarkingResult {
  awardedMarks: number;
  feedback: string;
  improvementTips: string[];
  confidence: "low" | "medium" | "high";
}

export async function markAnswer(
  studentAnswer: string,
  maxMarks: number,
  questionInstructions: string,
  markSchemeExcerpt?: string
): Promise<MarkingResult> {
  const prompt = `You are an expert exam marker for GCSE and A-Level examinations. Your task is to mark a student's answer fairly and accurately.

Question Instructions:
${questionInstructions}

Maximum Marks: ${maxMarks}

${markSchemeExcerpt ? `Mark Scheme Guidance:\n${markSchemeExcerpt}\n` : ''}

Student's Answer:
${studentAnswer}

Please provide:
1. The awarded marks (0 to ${maxMarks})
2. Brief feedback explaining the marks awarded
3. 2-3 specific improvement tips for the student
4. Your confidence level in this marking (low/medium/high)

Be strict but fair. Award marks for correct methodology, accurate answers, and clear working. Deduct marks for missing steps, incorrect calculations, or unclear explanations.

Respond in JSON format:
{
  "awardedMarks": <number>,
  "feedback": "<string>",
  "improvementTips": ["<tip1>", "<tip2>", "<tip3>"],
  "confidence": "<low|medium|high>"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content) as MarkingResult;
    
    if (result.awardedMarks < 0 || result.awardedMarks > maxMarks) {
      result.awardedMarks = Math.max(0, Math.min(maxMarks, result.awardedMarks));
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
