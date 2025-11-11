import { useRoute, useLocation } from "wouter";
import ExamViewer from "@/components/ExamViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ExamPage() {
  const [, params] = useRoute("/exam/:id");
  const [, setLocation] = useLocation();

  const handleFinish = () => {
    console.log("Exam finished, navigating to results");
    setLocation(`/results/${params?.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b p-2">
        <div className="container mx-auto max-w-7xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Papers
          </Button>
        </div>
      </div>

      <ExamViewer
        paperId={params?.id || "1"}
        paperTitle="AQA Mathematics Paper 1 (Non-Calculator) - Summer 2024"
        totalPages={12}
        onSubmit={handleFinish}
      />
    </div>
  );
}
