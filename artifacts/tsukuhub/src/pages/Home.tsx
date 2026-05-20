import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { ContentCard } from "@/components/ContentCard";
import { CATEGORIES } from "@/types";
import { mockItems } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";

export default function Home() {
  const trendingKeywords = ["長期インターン", "履修登録", "新歓情報", "おすすめ授業", "学食"];
  const newArrivals = [...mockItems].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary/5 py-20 lg:py-28">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom" />
          <div className="container relative mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              筑波大生の「<span className="text-primary">知りたい</span>」が、<br className="hidden sm:block" />ここに全部ある。
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              授業評価、サークル情報、インターン、周辺のグルメまで。
              学生生活を豊かにする情報ポータルサイト。
            </p>
            
            <div className="max-w-3xl mx-auto mb-6">
              <SearchBar size="lg" />
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-primary" />
              <span>トレンド:</span>
              {trendingKeywords.map(keyword => (
                <Link key={keyword} href={`/search?q=${encodeURIComponent(keyword)}`}>
                  <Badge variant="secondary" className="hover:bg-primary/20 cursor-pointer transition-colors bg-white dark:bg-slate-800">
                    {keyword}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 container mx-auto px-4">
          <div className="flex items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-primary" />
              カテゴリーから探す
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(category => (
              <CategoryCard key={category} category={category} />
            ))}
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-bold">新着情報</h2>
              <Link href="/search">
                <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                  すべて見る <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map(item => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
