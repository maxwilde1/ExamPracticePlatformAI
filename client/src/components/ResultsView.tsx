import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, AlertCircle, TrendingUp, Download } from "lucide-react";

interface PageResult {
  pageNumber: number;
  questionNumber: string;
  studentAnswer: string;
  awardedMarks: number;
  maxMarks: number;
  feedback: string;
  improvementTips: string[];
  confidence: "high" | "medium" | "low";
}

interface ResultsViewProps {
  paperTitle: string;
  totalScore: number;
  maxScore: number;
  pageResults: PageResult[];
  onDownloadReport?: () => void;
}

export default function ResultsView({
  paperTitle,
  totalScore,
  maxScore,
  pageResults,
  onDownloadReport,
}: ResultsViewProps) {
  const percentage = Math.round((totalScore / maxScore) * 100);
  const grade = percentage >= 90 ? "A*" : percentage >= 80 ? "A" : percentage >= 70 ? "B" : percentage >= 60 ? "C" : percentage >= 50 ? "D" : "E";

  const getConfidenceBadge = (confidence: string) => {
    const variants = {
      high: { variant: "default" as const, icon: CheckCircle2 },
      medium: { variant: "secondary" as const, icon: AlertCircle },
      low: { variant: "outline" as const, icon: AlertCircle },
    };
    const config = variants[confidence as keyof typeof variants];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {confidence} confidence
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-2xl mb-2">{paperTitle}</CardTitle>
                <p className="text-sm text-muted-foreground">Your exam results</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  console.log("Downloading report...");
                  onDownloadReport?.();
                }}
                data-testid="button-download-report"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8 flex-wrap">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {totalScore}<span className="text-2xl text-muted-foreground">/{maxScore}</span>
                </div>
                <p className="text-sm text-muted-foreground">Total Score</p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{percentage}%</div>
                <p className="text-sm text-muted-foreground">Percentage</p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">{grade}</div>
                <p className="text-sm text-muted-foreground">Estimated Grade</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Page-by-Page Breakdown</h3>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {pageResults.map((result) => (
            <AccordionItem
              key={result.pageNumber}
              value={`page-${result.pageNumber}`}
              className="border rounded-lg px-4"
              data-testid={`accordion-page-${result.pageNumber}`}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-left">
                    <div className="font-medium">
                      Question {result.questionNumber} (Page {result.pageNumber})
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {result.awardedMarks}/{result.maxMarks} marks
                    </div>
                  </div>
                  <div className="ml-auto mr-4">
                    {getConfidenceBadge(result.confidence)}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Your Answer</h4>
                    <div className="bg-muted/50 rounded-lg p-4 text-sm">
                      {result.studentAnswer}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      AI Feedback
                    </h4>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
                      {result.feedback}
                    </div>
                  </div>

                  {result.improvementTips.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        How to Improve
                      </h4>
                      <ul className="space-y-2">
                        {result.improvementTips.map((tip, index) => (
                          <li key={index} className="text-sm flex gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
