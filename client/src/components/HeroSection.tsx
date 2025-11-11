import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import heroImage from '@assets/generated_images/Students_studying_for_exams_fd7c74c8.png';

export default function HeroSection() {
  return (
    <div className="relative w-full h-96 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30" />
      
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Master Your GCSE & A-Level Exams
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
          Practice with real past papers. Get instant AI-powered feedback.
        </p>
        <Button 
          size="lg" 
          className="backdrop-blur-sm bg-white/20 border border-white/30 text-white hover:bg-white/30"
          data-testid="button-hero-cta"
        >
          <Search className="w-5 h-5 mr-2" />
          Browse Papers
        </Button>
      </div>
    </div>
  );
}
