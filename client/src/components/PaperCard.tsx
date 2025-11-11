import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock } from "lucide-react";

interface PaperCardProps {
  id: string;
  title: string;
  board: string;
  subject: string;
  year: string;
  series: string;
  questionCount: number;
  totalMarks: number;
  onStartPractice?: () => void;
}

export default function PaperCard({
  id,
  title,
  board,
  subject,
  year,
  series,
  questionCount,
  totalMarks,
  onStartPractice,
}: PaperCardProps) {
  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`card-paper-${id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary" className="uppercase text-xs font-medium">
            {board}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {year}
          </Badge>
        </div>
        <CardTitle className="text-xl leading-tight line-clamp-2">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>{subject}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{series}</span>
          </div>
        </div>
        
        <div className="flex gap-4 mt-4 text-sm">
          <div>
            <span className="font-medium">{questionCount}</span>
            <span className="text-muted-foreground ml-1">questions</span>
          </div>
          <div>
            <span className="font-medium">{totalMarks}</span>
            <span className="text-muted-foreground ml-1">marks</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => {
            console.log(`Starting practice for paper ${id}`);
            onStartPractice?.();
          }}
          data-testid={`button-start-${id}`}
        >
          Start Practice
        </Button>
      </CardFooter>
    </Card>
  );
}
