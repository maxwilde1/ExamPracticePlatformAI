import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Save, Send, Loader2, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { PaperPage, Response, Attempt } from "@shared/schema";

interface ExamViewerProps {
  paperId: string;
  paperTitle: string;
  pdfUrl: string | null;
  pages: PaperPage[];
  attemptId?: string;
  attempt?: Attempt;
  onSubmitQuestion: (questionNumber: string, answer: string) => Promise<void>;
  onMarkAll: () => Promise<void>;
  onRetake: (responseId: string) => Promise<void>;
  onStartExam: (feedbackMode: string) => void;
  onFinish: () => void;
  isSubmitting?: boolean;
  isMarkingAll?: boolean;
}

export default function ExamViewer({
  paperId,
  paperTitle,
  pdfUrl,
  pages,
  attemptId,
  attempt,
  onSubmitQuestion,
  onMarkAll,
  onRetake,
  onStartExam,
  onFinish,
  isSubmitting = false,
  isMarkingAll = false,
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

  const handleRetakeQuestion = async () => {
    if (!currentResponse) return;
    try {
      await onRetake(currentResponse.id);
      setAnswer("");
      toast({
        title: "Question reset",
        description: "You can now answer this question again",
      });
    } catch (error) {
      toast({
        title: "Retake failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllQuestions = async () => {
    try {
      await onMarkAll();
      toast({
        title: "All answers marked!",
        description: "Click 'Finish Exam' to see your results",
      });
    } catch (error) {
      toast({
        title: "Marking failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const progress = (completedQuestions.size / totalQuestions) * 100;
  const feedbackMode = attempt?.feedbackMode || 'immediate';
  const showFeedback = feedbackMode === 'immediate' && currentResponse && currentResponse.aiScore !== null;
  const allAnswered = completedQuestions.size === totalQuestions;
  const needsMarking = feedbackMode === 'end-of-exam' && allAnswered && responses.some(r => !r.aiScore);

  // Show feedback mode selector if no attempt exists
  if (!attemptId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-2xl mx-4">
          <CardHeader>
            <CardTitle className="text-2xl">{paperTitle}</CardTitle>
            <CardDescription>Choose when you'd like to receive feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Card 
                className="cursor-pointer hover-elevate active-elevate-2 transition-all border-2"
                onClick={() => onStartExam('immediate')}
                data-testid="card-immediate-feedback"
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Immediate Feedback
                  </CardTitle>
                  <CardDescription>
                    Get AI feedback right after answering each question. Perfect for learning as you go.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    ✓ See your marks instantly<br />
                    ✓ Get improvement tips for each answer<br />
                    ✓ Retake questions if needed
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover-elevate active-elevate-2 transition-all border-2"
                onClick={() => onStartExam('end-of-exam')}
                data-testid="card-end-feedback"
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-primary" />
                    End-of-Exam Feedback
                  </CardTitle>
                  <CardDescription>
                    Focus on answering all questions first. Get all feedback together at the end.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    ✓ Complete the exam without interruptions<br />
                    ✓ Simulate real exam conditions<br />
                    ✓ Review all feedback together
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">{paperTitle}</h2>
              <Badge variant="outline" data-testid="badge-feedback-mode">
                {feedbackMode === 'immediate' ? 'Immediate Feedback' : 'End-of-Exam Feedback'}
              </Badge>
            </div>
            <div className="flex gap-2">
              {needsMarking && (
                <Button 
                  onClick={handleMarkAllQuestions} 
                  disabled={isMarkingAll}
                  data-testid="button-mark-all"
                >
                  {isMarkingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    'Get Feedback'
                  )}
                </Button>
              )}
              {allAnswered && !needsMarking && (
                <Button onClick={onFinish} data-testid="button-finish-exam">
                  Finish Exam
                </Button>
              )}
            </div>
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
                  Scroll through the PDF on the left to find this question. Write your answer below and submit{feedbackMode === 'immediate' ? ' for AI marking' : ''}.
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
                  disabled={currentResponse && !showFeedback}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {currentResponse && !showFeedback
                    ? "This question has been submitted" 
                    : "Auto-saves when you click away"}
                </p>
              </div>

              {showFeedback && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      AI Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Score: {currentResponse.aiScore} marks</p>
                      <Badge variant={currentResponse.aiConfidence === 'high' ? 'default' : currentResponse.aiConfidence === 'low' ? 'destructive' : 'secondary'}>
                        {currentResponse.aiConfidence} confidence
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Feedback:</p>
                      <p className="text-sm text-muted-foreground">{currentResponse.aiFeedback}</p>
                    </div>
                    {currentResponse.improvementTips && Array.isArray(currentResponse.improvementTips) && currentResponse.improvementTips.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Tips for Improvement:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {(currentResponse.improvementTips as string[]).map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Button
                      onClick={handleRetakeQuestion}
                      variant="outline"
                      className="w-full"
                      data-testid="button-retake"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retake Question
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!currentResponse && (
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

              {currentResponse && !showFeedback && currentQuestionIndex < totalQuestions - 1 && (
                <Button
                  onClick={handleNextQuestion}
                  className="w-full"
                  data-testid="button-next-question"
                >
                  Next Question
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {showFeedback && currentQuestionIndex < totalQuestions - 1 && (
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
