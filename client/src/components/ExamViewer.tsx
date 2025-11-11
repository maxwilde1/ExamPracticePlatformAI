import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  number: string;
  maxMarks: number;
  instructions: string;
}

interface ExamViewerProps {
  paperId: string;
  paperTitle: string;
  totalPages: number;
  currentPageNumber?: number;
  question?: Question;
  onNavigate?: (page: number) => void;
  onSubmit?: (answer: string) => void;
}

export default function ExamViewer({
  paperId,
  paperTitle,
  totalPages,
  currentPageNumber = 1,
  question = { number: "1", maxMarks: 6, instructions: "Solve the equation and show your working." },
  onNavigate,
  onSubmit,
}: ExamViewerProps) {
  const [currentPage, setCurrentPage] = useState(currentPageNumber);
  const [answer, setAnswer] = useState("");
  const [completedPages, setCompletedPages] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const handlePrevious = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onNavigate?.(newPage);
      console.log(`Navigated to page ${newPage}`);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onNavigate?.(newPage);
      console.log(`Navigated to page ${newPage}`);
    }
  };

  const handleAutoSave = () => {
    localStorage.setItem(`exam-${paperId}-page-${currentPage}`, answer);
    toast({
      description: "Answer auto-saved",
      duration: 2000,
    });
  };

  const handleSubmitPage = () => {
    setCompletedPages(prev => new Set(Array.from(prev).concat(currentPage)));
    onSubmit?.(answer);
    toast({
      title: "Answer submitted",
      description: `Page ${currentPage} of ${totalPages} complete`,
    });
    console.log(`Submitted answer for page ${currentPage}:`, answer);
    
    if (currentPage < totalPages) {
      handleNext();
      setAnswer("");
    }
  };

  const progress = (completedPages.size / totalPages) * 100;

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-xl font-semibold mb-2">{paperTitle}</h2>
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
          <div className="flex-1 bg-muted/30 flex items-center justify-center p-8">
            <div className="bg-white border rounded-lg shadow-sm w-full max-w-2xl aspect-[1/1.414] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium mb-2">PDF Page {currentPage}</p>
                <p className="text-sm">Paper content would display here</p>
              </div>
            </div>
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
                <CardTitle className="text-lg">Question {question.number}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">{question.instructions}</p>
                <p className="text-sm font-medium">
                  <span className="text-muted-foreground">Max marks:</span> {question.maxMarks}
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
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Auto-saves when you click away
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAutoSave}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-save"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={handleSubmitPage}
                  disabled={!answer.trim()}
                  className="flex-1"
                  data-testid="button-submit-page"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
