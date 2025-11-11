import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface FilterState {
  levelId: string;
  boardId: string;
  subjectId: string;
  year: string;
}

interface SearchFilterBarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  levels: any[];
  boards: any[];
  subjects: any[];
}

export default function SearchFilterBar({ 
  filters, 
  setFilters,
  levels,
  boards,
  subjects 
}: SearchFilterBarProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const activeFilters = [
    { key: 'levelId' as const, value: filters.levelId, label: levels.find(l => l.id === filters.levelId)?.name },
    { key: 'boardId' as const, value: filters.boardId, label: boards.find(b => b.id === filters.boardId)?.name },
    { key: 'subjectId' as const, value: filters.subjectId, label: subjects.find(s => s.id === filters.subjectId)?.name },
    { key: 'year' as const, value: filters.year, label: filters.year },
  ].filter(f => f.value && f.label);

  const clearFilter = (key: keyof FilterState) => {
    setFilters({ ...filters, [key]: "" });
  };

  const clearAll = () => {
    setFilters({
      levelId: "",
      boardId: "",
      subjectId: "",
      year: "",
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="w-full border-b bg-card">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <Select value={filters.levelId} onValueChange={(v) => updateFilter('levelId', v)}>
              <SelectTrigger className="w-40" data-testid="select-level">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.boardId} onValueChange={(v) => updateFilter('boardId', v)}>
              <SelectTrigger className="w-48" data-testid="select-board">
                <SelectValue placeholder="Exam Board" />
              </SelectTrigger>
              <SelectContent>
                {boards.map(board => (
                  <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.subjectId} onValueChange={(v) => updateFilter('subjectId', v)}>
              <SelectTrigger className="w-48" data-testid="select-subject">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.year} onValueChange={(v) => updateFilter('year', v)}>
              <SelectTrigger className="w-32" data-testid="select-year">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
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
