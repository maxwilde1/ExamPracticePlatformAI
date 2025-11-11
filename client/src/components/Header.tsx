import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function Header() {
  const [, setLocation] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-lg px-3 py-2 -ml-3"
        >
          <BookOpen className="w-6 h-6 text-primary" />
          <span className="text-xl font-semibold">ExamPrep</span>
        </button>
        
        <nav className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation("/admin")}
            data-testid="link-admin"
          >
            Admin
          </Button>
        </nav>
      </div>
    </header>
  );
}
