import { useLocation, useSearch } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { ContentCard } from "@/components/ContentCard";
import { CATEGORIES } from "@/types";
import { searchContent } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Filter, Search as SearchIcon } from "lucide-react";
import { useMemo } from "react";

export default function Search() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const q = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  const [, setLocation] = useLocation();

  const handleCategorySelect = (category: string) => {
    const params = new URLSearchParams(searchString);
    if (category === "") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    setLocation(`/search?${params.toString()}`);
  };

  const results = useMemo(() => {
    return searchContent(q, categoryParam);
  }, [q, categoryParam]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar / Filters */}
          <aside className="w-full md:w-64 space-y-6 flex-shrink-0">
            <div className="sticky top-24">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center text-lg">
                  <Filter className="w-5 h-5 mr-2 text-primary" />
                  絞り込み
                </h3>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">カテゴリー</h4>
                  <div className="flex flex-col space-y-1">
                    <Button
                      variant={!categoryParam ? "default" : "ghost"}
                      className="justify-start font-normal h-8 px-3"
                      onClick={() => handleCategorySelect("")}
                    >
                      すべて
                    </Button>
                    {CATEGORIES.map(category => (
                      <Button
                        key={category}
                        variant={categoryParam === category ? "default" : "ghost"}
                        className="justify-start font-normal h-8 px-3"
                        onClick={() => handleCategorySelect(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <SearchBar initialQuery={q} className="max-w-2xl" />
            </div>

            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold">
                {q ? `「${q}」の検索結果` : categoryParam ? `カテゴリー: ${categoryParam}` : "すべての記事"}
              </h1>
              <span className="text-muted-foreground text-sm">
                {results.length} 件見つかりました
              </span>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {results.map(item => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border rounded-lg bg-muted/10">
                <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">見つかりませんでした</h3>
                <p className="text-muted-foreground">
                  検索条件を変更して再度お試しください。
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setLocation("/search")}
                >
                  条件をクリア
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
