import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Save, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PaperPage, Response } from "@shared/schema";

interface ExamViewerProps {
  paperId: string;
  paperTitle: string;
  totalPages: number;
  pages: PaperPage[];
  attemptId?: string;
  onSubmitPage: (pageNumber: number, answer: string) => Promise<void>;
  onFinish: () => void;
  isSubmitting?: boolean;
}

export default function ExamViewer({
  paperId,
  paperTitle,
  totalPages,
  pages,
  attemptId,
  onSubmitPage,
  onFinish,
  isSubmitting = false,
}: ExamViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [answer, setAnswer] = useState("");
  const { toast } = useToast();

  const { data: responses = [] } = useQuery<Response[]>({
    queryKey: [`/api/attempts/${attemptId}/responses`],
    enabled: !!attemptId,
  });

  const completedPages = new Set(responses.map(r => r.pageNumber));
  const currentResponse = responses.find(r => r.pageNumber === currentPage);

  useEffect(() => {
    if (currentResponse) {
      setAnswer(currentResponse.studentAnswer);
    } else {
      const saved = localStorage.getItem(`exam-${paperId}-page-${currentPage}`);
      setAnswer(saved || "");
    }
  }, [currentPage, paperId, currentResponse]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleAutoSave = () => {
    if (!answer.trim()) {
      localStorage.removeItem(`exam-${paperId}-page-${currentPage}`);
      return;
    }
    localStorage.setItem(`exam-${paperId}-page-${currentPage}`, answer);
    toast({
      description: "Answer auto-saved",
      duration: 2000,
    });
  };

  const handleSubmitPage = async () => {
    if (!answer.trim()) return;
    
    try {
      await onSubmitPage(currentPage, answer);
      
      toast({
        title: "Answer submitted",
        description: `Page ${currentPage} received AI feedback`,
      });
      
      localStorage.removeItem(`exam-${paperId}-page-${currentPage}`);
      
      if (currentPage < totalPages) {
        handleNext();
      } else {
        toast({
          title: "All pages complete!",
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

  const progress = (completedPages.size / totalPages) * 100;
  const currentPageData = pages.find(p => p.pageNumber === currentPage);

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">{paperTitle}</h2>
            {completedPages.size === totalPages && (
              <Button onClick={onFinish} data-testid="button-finish-exam">
                Finish Exam
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {completedPages.size} / {totalPages} completed
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[60%] border-r flex flex-col">
          <div className="flex-1 bg-muted/30 flex items-center justify-center p-8 overflow-auto">
            {currentPageData ? (
              <img 
                src={currentPageData.imagePath}
                alt={`Page ${currentPage}`}
                className="max-w-full max-h-full object-contain shadow-lg"
                data-testid={`img-page-${currentPage}`}
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading page {currentPage}...</p>
              </div>
            )}
          </div>

          <div className="border-t p-4 bg-background">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                data-testid="button-previous"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <span className="text-sm px-4" data-testid="text-page-number">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                data-testid="button-next"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        <div className="w-[40%] flex flex-col bg-background">
          <div className="p-6 flex-1 overflow-auto">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Page {currentPage} Answer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Review the question on the left and write your answer below. Your answer will be marked by AI.
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
                  disabled={completedPages.has(currentPage)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {completedPages.has(currentPage) 
                    ? "This page has been submitted" 
                    : "Auto-saves when you click away"}
                </p>
              </div>

              {!completedPages.has(currentPage) && (
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
                    onClick={handleSubmitPage}
                    disabled={!answer.trim() || isSubmitting}
                    className="flex-1"
                    data-testid="button-submit-page"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Submit Page
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
