import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Save, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PaperPage, Response } from "@shared/schema";

interface ExamViewerProps {
  paperId: string;
  paperTitle: string;
  pdfUrl: string | null;
  pages: PaperPage[];
  attemptId?: string;
  onSubmitQuestion: (questionNumber: string, answer: string) => Promise<void>;
  onFinish: () => void;
  isSubmitting?: boolean;
}

export default function ExamViewer({
  paperId,
  paperTitle,
  pdfUrl,
  pages,
  attemptId,
  onSubmitQuestion,
  onFinish,
  isSubmitting = false,
}: ExamViewerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const { toast } = useToast();

  const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);
  const uniqueQuestions: string[] = [];
  const seen = new Set<string>();
  for (const page of sortedPages) {
    if (!seen.has(page.questionNumber)) {
      uniqueQuestions.push(page.questionNumber);
      seen.add(page.questionNumber);
    }
  }
  
  const currentQuestionNumber = uniqueQuestions[currentQuestionIndex] || "";
  const totalQuestions = uniqueQuestions.length;

  const { data: responses = [] } = useQuery<Response[]>({
    queryKey: [`/api/attempts/${attemptId}/responses`],
    enabled: !!attemptId,
  });

  const completedQuestions = new Set(responses.map(r => r.questionNumber));
  const currentResponse = responses.find(r => r.questionNumber === currentQuestionNumber);

  useEffect(() => {
    if (currentResponse) {
      setAnswer(currentResponse.studentAnswer);
    } else {
      const saved = localStorage.getItem(`exam-${paperId}-question-${currentQuestionNumber}`);
      setAnswer(saved || "");
    }
  }, [currentQuestionNumber, paperId, currentResponse]);

  const handleAutoSave = () => {
    if (!answer.trim()) {
      localStorage.removeItem(`exam-${paperId}-question-${currentQuestionNumber}`);
      return;
    }
    localStorage.setItem(`exam-${paperId}-question-${currentQuestionNumber}`, answer);
    toast({
      description: "Answer auto-saved",
      duration: 2000,
    });
  };

  const handleSubmitQuestion = async () => {
    if (!answer.trim()) return;
    
    try {
      await onSubmitQuestion(currentQuestionNumber, answer);
      
      toast({
        title: "Answer submitted",
        description: `Question ${currentQuestionNumber} received AI feedback`,
      });
      
      localStorage.removeItem(`exam-${paperId}-question-${currentQuestionNumber}`);
      
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        toast({
          title: "All questions complete!",
          description: "Click 'Finish Exam' to see your results",
        });
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const progress = (completedQuestions.size / totalQuestions) * 100;

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">{paperTitle}</h2>
            {completedQuestions.size === totalQuestions && (
              <Button onClick={onFinish} data-testid="button-finish-exam">
                Finish Exam
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {completedQuestions.size} / {totalQuestions} completed
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[60%] border-r flex flex-col bg-muted/30">
          <div className="flex-1 overflow-auto p-4">
            {pdfUrl ? (
              <iframe
                src={`${pdfUrl}#view=FitH`}
                className="w-full h-full border-0"
                title="Exam Paper"
                data-testid="pdf-viewer"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading PDF...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-[40%] flex flex-col bg-background">
          <div className="p-6 flex-1 overflow-auto">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {currentQuestionNumber}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Scroll through the PDF on the left to find this question. Write your answer below and submit for AI marking.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your Answer
                </label>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onBlur={handleAutoSave}
                  placeholder="Type your answer here..."
                  className="min-h-64 resize-none"
                  data-testid="input-answer"
                  disabled={completedQuestions.has(currentQuestionNumber)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {completedQuestions.has(currentQuestionNumber) 
                    ? "This question has been submitted" 
                    : "Auto-saves when you click away"}
                </p>
              </div>

              {!completedQuestions.has(currentQuestionNumber) && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleAutoSave}
                    variant="outline"
                    className="flex-1"
                    data-testid="button-save"
                    disabled={!answer.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleSubmitQuestion}
                    disabled={!answer.trim() || isSubmitting}
                    className="flex-1"
                    data-testid="button-submit-question"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Submit Answer
                  </Button>
                </div>
              )}

              {completedQuestions.has(currentQuestionNumber) && currentQuestionIndex < totalQuestions - 1 && (
                <Button
                  onClick={handleNextQuestion}
                  className="w-full"
                  data-testid="button-next-question"
                >
                  Next Question
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
