import { useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  initialQuery?: string;
  size?: "default" | "lg";
  className?: string;
}

export function SearchBar({ initialQuery = "", size = "default", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      setLocation(`/search`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative flex w-full items-center ${className}`}>
      <div className="relative flex-1">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${size === "lg" ? "h-5 w-5" : "h-4 w-4"}`} />
        <Input
          type="search"
          placeholder="授業名、サークル、キーワードで検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-full pl-10 pr-4 bg-background ${size === "lg" ? "h-14 text-lg rounded-full shadow-sm" : ""}`}
        />
      </div>
      <Button 
        type="submit" 
        size={size === "lg" ? "lg" : "default"}
        className={size === "lg" ? "absolute right-1 top-1 rounded-full h-12 px-8" : "ml-2"}
      >
        検索
      </Button>
    </form>
  );
}
