import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

type ProcessingJob = {
  id: string;
  paperUrl: string;
  markSchemeUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  paperId?: string;
  error?: string;
};

export default function AdminPaperUpload() {
  const [paperUrl, setPaperUrl] = useState("");
  const [markSchemeUrl, setMarkSchemeUrl] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/papers/process/${jobId}`);
        const data = await response.json();
        setJob(data);

        if (data.status === 'completed') {
          clearInterval(pollInterval);
          toast({
            title: "Paper processed successfully",
            description: "The paper is now available for students to practice.",
          });
          queryClient.invalidateQueries({ queryKey: ['/api/papers'] });
          setPaperUrl("");
          setMarkSchemeUrl("");
          setJobId(null);
          setJob(null);
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          toast({
            title: "Processing failed",
            description: data.error || "An error occurred while processing the paper.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error polling job status:", error);
        clearInterval(pollInterval);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [jobId, toast, queryClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paperUrl || !markSchemeUrl) {
      toast({
        title: "Missing URLs",
        description: "Please provide both paper and mark scheme URLs.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest('POST', '/api/papers/process', { 
        paperUrl, 
        markSchemeUrl 
      });

      const data = await response.json();
      setJobId(data.jobId);
      
      toast({
        title: "Processing started",
        description: "AI is extracting metadata and questions from the PDFs...",
      });
    } catch (error) {
      console.error("Error starting processing:", error);
      toast({
        title: "Error",
        description: "Failed to start processing. Please check the URLs and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProcessing = job && (job.status === 'pending' || job.status === 'processing');

  return (
    <div className="max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Upload New Paper</CardTitle>
          <CardDescription>
            Paste PDF URLs - AI will automatically extract metadata and questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="paper-url">Exam Paper PDF URL *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="paper-url"
                    type="url"
                    placeholder="https://example.com/paper.pdf"
                    value={paperUrl}
                    onChange={(e) => setPaperUrl(e.target.value)}
                    required
                    disabled={isProcessing || isSubmitting}
                    className="pl-10"
                    data-testid="input-paper-url"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="markscheme-url">Mark Scheme PDF URL *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="markscheme-url"
                    type="url"
                    placeholder="https://example.com/markscheme.pdf"
                    value={markSchemeUrl}
                    onChange={(e) => setMarkSchemeUrl(e.target.value)}
                    required
                    disabled={isProcessing || isSubmitting}
                    className="pl-10"
                    data-testid="input-markscheme-url"
                  />
                </div>
              </div>
            </div>

            {job && (
              <div className="space-y-3 p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  {job.status === 'processing' || job.status === 'pending' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : job.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">
                    {job.status === 'pending' && 'Queued for processing...'}
                    {job.status === 'processing' && job.currentStep}
                    {job.status === 'completed' && 'Processing complete!'}
                    {job.status === 'failed' && 'Processing failed'}
                  </span>
                </div>
                <Progress value={job.progress} className="h-2" data-testid="progress-processing" />
                <p className="text-xs text-muted-foreground">
                  {job.progress}% complete
                </p>
                {job.status === 'failed' && job.error && (
                  <p className="text-xs text-destructive mt-2" data-testid="text-error-message">
                    Error: {job.error}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isProcessing || isSubmitting}
                data-testid="button-upload"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Process Paper
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setPaperUrl("");
                  setMarkSchemeUrl("");
                  setJobId(null);
                  setJob(null);
                }}
                disabled={isProcessing || isSubmitting}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
