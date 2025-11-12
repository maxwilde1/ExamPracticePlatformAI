import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import ExamViewer from "@/components/ExamViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { EnrichedPaper } from "../../../server/storage";
import type { PaperPage, Attempt } from "@shared/schema";

export default function ExamPage() {
  const [, params] = useRoute("/exam/:id");
  const [, setLocation] = useLocation();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("sessionId");
    if (stored) return stored;
    const newId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("sessionId", newId);
    return newId;
  });

  const paperId = params?.id || "";

  const { data: paper, isLoading: paperLoading } = useQuery<EnrichedPaper>({
    queryKey: [`/api/papers/${paperId}`],
    enabled: !!paperId,
  });

  const { data: pages = [], isLoading: pagesLoading } = useQuery<PaperPage[]>({
    queryKey: [`/api/papers/${paperId}/pages`],
    enabled: !!paperId,
  });

  const storedAttemptId = localStorage.getItem(`attempt-${paperId}`);
  
  const { data: existingAttempt, isLoading: attemptLoading, error: attemptError } = useQuery<Attempt>({
    queryKey: [`/api/attempts/${storedAttemptId}`],
    enabled: !!storedAttemptId,
    retry: false,
  });

  const createAttemptMutation = useMutation({
    mutationFn: async (data: { paperId: string; sessionId: string }) => {
      const res = await apiRequest("POST", "/api/attempts", data);
      return await res.json() as Attempt;
    },
    onSuccess: (attempt) => {
      setAttemptId(attempt.id);
      localStorage.setItem(`attempt-${paperId}`, attempt.id);
    },
  });

  useEffect(() => {
    if (!paperId || attemptId || attemptLoading || createAttemptMutation.isPending) return;
    
    if (attemptError || (storedAttemptId && !existingAttempt && !attemptLoading)) {
      localStorage.removeItem(`attempt-${paperId}`);
      createAttemptMutation.mutate({ paperId, sessionId });
    } else if (storedAttemptId && existingAttempt) {
      if (existingAttempt.completedAt) {
        localStorage.removeItem(`attempt-${paperId}`);
        createAttemptMutation.mutate({ paperId, sessionId });
      } else {
        setAttemptId(storedAttemptId);
      }
    } else if (!storedAttemptId) {
      createAttemptMutation.mutate({ paperId, sessionId });
    }
  }, [paperId, attemptId, storedAttemptId, existingAttempt, attemptLoading, attemptError, sessionId, createAttemptMutation.isPending]);

  const submitPageMutation = useMutation({
    mutationFn: async (data: { 
      attemptId: string; 
      questionNumber: string; 
      studentAnswer: string;
    }) => {
      const res = await apiRequest("POST", `/api/attempts/${data.attemptId}/submit-question`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/attempts/${attemptId}/responses`] });
    },
  });

  const handleSubmitQuestion = async (questionNumber: string, answer: string) => {
    if (!attemptId || !answer.trim()) return;
    
    await submitPageMutation.mutateAsync({
      attemptId,
      questionNumber,
      studentAnswer: answer,
    });
  };

  const handleFinish = async () => {
    if (!attemptId) return;
    
    await apiRequest("POST", `/api/attempts/${attemptId}/complete`, {});
    localStorage.removeItem(`attempt-${paperId}`);
    setLocation(`/results/${attemptId}`);
  };

  if (paperLoading || pagesLoading || !attemptId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {!attemptId ? "Starting exam..." : "Loading exam paper..."}
          </p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Paper not found</p>
          <Button onClick={() => setLocation("/")}>Back to Papers</Button>
        </div>
      </div>
    );
  }

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
        paperId={paperId}
        paperTitle={paper.title}
        pdfUrl={paper.pdfUrl}
        pages={pages}
        attemptId={attemptId || undefined}
        onSubmitQuestion={handleSubmitQuestion}
        onFinish={handleFinish}
        isSubmitting={submitPageMutation.isPending}
      />
    </div>
  );
}
