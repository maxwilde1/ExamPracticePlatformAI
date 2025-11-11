import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModerationItem {
  id: string;
  studentId: string;
  paperId: string;
  paperTitle: string;
  pageNumber: number;
  questionNumber: string;
  studentAnswer: string;
  aiScore: number;
  maxMarks: number;
  aiFeedback: string;
  confidence: "low" | "medium";
}

const mockItems: ModerationItem[] = [
  {
    id: "1",
    studentId: "anon-12345",
    paperId: "paper-1",
    paperTitle: "AQA Mathematics Paper 1",
    pageNumber: 5,
    questionNumber: "7",
    studentAnswer: "The answer is approximately 12.5 but I'm not sure about the working",
    aiScore: 3,
    maxMarks: 6,
    aiFeedback: "Partial credit given for correct numerical answer, but methodology unclear.",
    confidence: "low",
  },
  {
    id: "2",
    studentId: "anon-67890",
    paperId: "paper-2",
    paperTitle: "Edexcel Biology Paper 2",
    pageNumber: 3,
    questionNumber: "4",
    studentAnswer: "Mitochondria produces ATP through cellular respiration",
    aiScore: 4,
    maxMarks: 6,
    aiFeedback: "Good answer but missing some detail about the process.",
    confidence: "medium",
  },
];

export default function AdminModerationQueue() {
  const [items, setItems] = useState(mockItems);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [overrideScore, setOverrideScore] = useState("");
  const [overrideFeedback, setOverrideFeedback] = useState("");
  const { toast } = useToast();

  const handleReview = (item: ModerationItem) => {
    setSelectedItem(item);
    setOverrideScore(item.aiScore.toString());
    setOverrideFeedback(item.aiFeedback);
  };

  const handleSaveOverride = () => {
    if (selectedItem) {
      console.log("Saving override:", {
        id: selectedItem.id,
        newScore: overrideScore,
        newFeedback: overrideFeedback,
      });
      
      setItems(items.filter(item => item.id !== selectedItem.id));
      setSelectedItem(null);
      
      toast({
        title: "Override saved",
        description: "The score and feedback have been updated.",
      });
    }
  };

  const handleApprove = (id: string) => {
    console.log("Approving AI score for item:", id);
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Score approved",
      description: "The AI score has been confirmed.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Moderation Queue</h2>
        <p className="text-muted-foreground">
          Review low-confidence AI marks and provide overrides where needed
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              No submissions require moderation at the moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} data-testid={`card-moderation-${item.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-lg mb-2">{item.paperTitle}</CardTitle>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>Question {item.questionNumber}</span>
                      <span>•</span>
                      <span>Page {item.pageNumber}</span>
                      <span>•</span>
                      <span>Student: {item.studentId}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={item.confidence === "low" ? "destructive" : "secondary"}
                    className="gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {item.confidence} confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Student Answer</h4>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    {item.studentAnswer}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">AI Score</h4>
                    <div className="text-2xl font-bold">
                      {item.aiScore}<span className="text-lg text-muted-foreground">/{item.maxMarks}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">AI Feedback</h4>
                    <p className="text-sm text-muted-foreground">{item.aiFeedback}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleReview(item)}
                    data-testid={`button-review-${item.id}`}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Review & Override
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => handleApprove(item.id)}
                    data-testid={`button-approve-${item.id}`}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve AI Score
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>
              Provide an override score and feedback for this submission
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Student Answer</h4>
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  {selectedItem.studentAnswer}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Override Score (max {selectedItem.maxMarks})
                </label>
                <Input
                  type="number"
                  min="0"
                  max={selectedItem.maxMarks}
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                  data-testid="input-override-score"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Override Feedback</label>
                <Textarea
                  value={overrideFeedback}
                  onChange={(e) => setOverrideFeedback(e.target.value)}
                  rows={4}
                  data-testid="input-override-feedback"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOverride} data-testid="button-save-override">
              Save Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
