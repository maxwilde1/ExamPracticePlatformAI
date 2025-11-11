import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPaperUpload() {
  const [level, setLevel] = useState("");
  const [board, setBoard] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [series, setSeries] = useState("");
  const [paperCode, setPaperCode] = useState("");
  const [title, setTitle] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Paper upload:", {
      level, board, subject, year, series, paperCode, title, questionCount, totalMarks
    });
    toast({
      title: "Paper uploaded successfully",
      description: "The paper is now available for students to practice.",
    });
  };

  return (
    <div className="max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Upload New Paper</CardTitle>
          <CardDescription>
            Add a new exam paper with metadata and mark scheme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select value={level} onValueChange={setLevel} required>
                  <SelectTrigger id="level" data-testid="select-upload-level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gcse">GCSE</SelectItem>
                    <SelectItem value="a-level">A-Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="board">Exam Board *</Label>
                <Select value={board} onValueChange={setBoard} required>
                  <SelectTrigger id="board" data-testid="select-upload-board">
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aqa">AQA</SelectItem>
                    <SelectItem value="edexcel">Edexcel</SelectItem>
                    <SelectItem value="ocr">OCR</SelectItem>
                    <SelectItem value="wjec">WJEC</SelectItem>
                    <SelectItem value="ccea">CCEA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={subject} onValueChange={setSubject} required>
                  <SelectTrigger id="subject" data-testid="select-upload-subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="english-language">English Language</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2024"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  data-testid="input-year"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Paper Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Mathematics Paper 1 (Non-Calculator)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                data-testid="input-title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="series">Series</Label>
                <Input
                  id="series"
                  placeholder="Summer 2024"
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                  data-testid="input-series"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paperCode">Paper Code</Label>
                <Input
                  id="paperCode"
                  placeholder="8300/1H"
                  value={paperCode}
                  onChange={(e) => setPaperCode(e.target.value)}
                  data-testid="input-paper-code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionCount">Questions</Label>
                <Input
                  id="questionCount"
                  type="number"
                  placeholder="25"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  data-testid="input-question-count"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                placeholder="80"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                data-testid="input-total-marks"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paper-file">Exam Paper PDF *</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload or drag and drop
                </p>
                <Input
                  id="paper-file"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  data-testid="input-paper-file"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('paper-file')?.click()}
                >
                  Choose File
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="markscheme-file">Mark Scheme PDF</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate transition-colors">
                <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload or drag and drop
                </p>
                <Input
                  id="markscheme-file"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  data-testid="input-markscheme-file"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('markscheme-file')?.click()}
                >
                  Choose File
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" data-testid="button-upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload Paper
              </Button>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
