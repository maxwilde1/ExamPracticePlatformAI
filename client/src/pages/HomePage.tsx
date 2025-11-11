import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SearchFilterBar from "@/components/SearchFilterBar";
import PaperGrid from "@/components/PaperGrid";

const mockPapers = [
  {
    id: "1",
    title: "Mathematics Paper 1 (Non-Calculator)",
    board: "AQA",
    subject: "Mathematics",
    year: "2024",
    series: "Summer 2024",
    questionCount: 25,
    totalMarks: 80,
  },
  {
    id: "2",
    title: "Biology Paper 2: The Variety of Living Organisms",
    board: "Edexcel",
    subject: "Biology",
    year: "2023",
    series: "Summer 2023",
    questionCount: 18,
    totalMarks: 60,
  },
  {
    id: "3",
    title: "English Language Paper 1: Explorations in Creative Reading",
    board: "AQA",
    subject: "English Language",
    year: "2024",
    series: "Summer 2024",
    questionCount: 5,
    totalMarks: 80,
  },
  {
    id: "4",
    title: "Chemistry Paper 1: Atomic Structure and the Periodic Table",
    board: "OCR",
    subject: "Chemistry",
    year: "2023",
    series: "November 2023",
    questionCount: 22,
    totalMarks: 70,
  },
  {
    id: "5",
    title: "Physics Paper 2: Electricity and Magnetism",
    board: "AQA",
    subject: "Physics",
    year: "2024",
    series: "Summer 2024",
    questionCount: 20,
    totalMarks: 75,
  },
  {
    id: "6",
    title: "Mathematics Paper 3 (Calculator)",
    board: "Edexcel",
    subject: "Mathematics",
    year: "2023",
    series: "Summer 2023",
    questionCount: 28,
    totalMarks: 80,
  },
];

export default function HomePage() {
  const [papers] = useState(mockPapers);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <SearchFilterBar />
      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Available Past Papers</h2>
          <p className="text-muted-foreground">
            {papers.length} papers available for practice
          </p>
        </div>
        
        <PaperGrid papers={papers} />
      </div>
    </div>
  );
}
