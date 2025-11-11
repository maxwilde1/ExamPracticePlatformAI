import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SearchFilterBar from "@/components/SearchFilterBar";
import PaperGrid from "@/components/PaperGrid";
import type { Level, Board, Subject } from "@shared/schema";
import type { EnrichedPaper } from "../../server/storage";

export default function HomePage() {
  const [filters, setFilters] = useState({
    levelId: "",
    boardId: "",
    subjectId: "",
    year: "",
  });

  const queryParams = new URLSearchParams();
  if (filters.levelId) queryParams.append("levelId", filters.levelId);
  if (filters.boardId) queryParams.append("boardId", filters.boardId);
  if (filters.subjectId) queryParams.append("subjectId", filters.subjectId);
  if (filters.year) queryParams.append("year", filters.year);
  
  const queryString = queryParams.toString();
  const papersUrl = `/api/papers${queryString ? `?${queryString}` : ""}`;

  const { data: papers = [], isLoading } = useQuery<EnrichedPaper[]>({
    queryKey: [papersUrl],
  });

  const { data: levels = [] } = useQuery<Level[]>({
    queryKey: ["/api/levels"],
  });

  const { data: boards = [] } = useQuery<Board[]>({
    queryKey: ["/api/boards"],
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <SearchFilterBar 
        filters={filters}
        setFilters={setFilters}
        levels={levels}
        boards={boards}
        subjects={subjects}
      />
      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Available Past Papers</h2>
          <p className="text-muted-foreground">
            {isLoading ? "Loading papers..." : `${papers.length} papers available for practice`}
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No papers found. Try adjusting your filters or check back soon.
            </p>
          </div>
        ) : (
          <PaperGrid papers={papers} />
        )}
      </div>
    </div>
  );
}
