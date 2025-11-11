import PaperCard from "./PaperCard";
import { useLocation } from "wouter";

interface Paper {
  id: string;
  title: string;
  board: string;
  subject: string;
  year: string;
  series: string;
  questionCount: number;
  totalMarks: number;
}

interface PaperGridProps {
  papers: Paper[];
}

export default function PaperGrid({ papers }: PaperGridProps) {
  const [, setLocation] = useLocation();

  if (papers.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">No papers match your filters</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {papers.map((paper) => (
        <PaperCard
          key={paper.id}
          {...paper}
          onStartPractice={() => setLocation(`/exam/${paper.id}`)}
        />
      ))}
    </div>
  );
}
