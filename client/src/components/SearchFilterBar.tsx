import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface SearchFilterBarProps {
  onFiltersChange?: (filters: any) => void;
}

export default function SearchFilterBar({ onFiltersChange }: SearchFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [level, setLevel] = useState("");
  const [board, setBoard] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");

  const activeFilters = [
    { key: 'level', value: level, label: level },
    { key: 'board', value: board, label: board },
    { key: 'subject', value: subject, label: subject },
    { key: 'year', value: year, label: year },
  ].filter(f => f.value);

  const clearFilter = (key: string) => {
    if (key === 'level') setLevel("");
    if (key === 'board') setBoard("");
    if (key === 'subject') setSubject("");
    if (key === 'year') setYear("");
    console.log(`Filter cleared: ${key}`);
  };

  const clearAll = () => {
    setSearchQuery("");
    setLevel("");
    setBoard("");
    setSubject("");
    setYear("");
    console.log("All filters cleared");
  };

  return (
    <div className="w-full border-b bg-card">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search papers by subject, board, or paper code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                console.log('Search:', e.target.value);
              }}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={level} onValueChange={(v) => { setLevel(v); console.log('Level:', v); }}>
              <SelectTrigger className="w-40" data-testid="select-level">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gcse">GCSE</SelectItem>
                <SelectItem value="a-level">A-Level</SelectItem>
              </SelectContent>
            </Select>

            <Select value={board} onValueChange={(v) => { setBoard(v); console.log('Board:', v); }}>
              <SelectTrigger className="w-48" data-testid="select-board">
                <SelectValue placeholder="Exam Board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aqa">AQA</SelectItem>
                <SelectItem value="edexcel">Edexcel</SelectItem>
                <SelectItem value="ocr">OCR</SelectItem>
                <SelectItem value="wjec">WJEC</SelectItem>
                <SelectItem value="ccea">CCEA</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subject} onValueChange={(v) => { setSubject(v); console.log('Subject:', v); }}>
              <SelectTrigger className="w-48" data-testid="select-subject">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="english-language">English Language</SelectItem>
                <SelectItem value="biology">Biology</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
              </SelectContent>
            </Select>

            <Select value={year} onValueChange={(v) => { setYear(v); console.log('Year:', v); }}>
              <SelectTrigger className="w-32" data-testid="select-year">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>

            {activeFilters.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll}
                data-testid="button-clear-all"
              >
                Clear all
              </Button>
            )}
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(filter => (
                <Badge 
                  key={filter.key} 
                  variant="secondary"
                  className="gap-1 pl-3 pr-2"
                  data-testid={`badge-filter-${filter.key}`}
                >
                  {filter.label}
                  <button
                    onClick={() => clearFilter(filter.key)}
                    className="ml-1 hover-elevate active-elevate-2 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
