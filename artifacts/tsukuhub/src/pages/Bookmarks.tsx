import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentCard } from "@/components/ContentCard";
import { useBookmarks } from "@/context/BookmarkContext";
import { mockItems } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookMarked, Search } from "lucide-react";

export default function Bookmarks() {
  const { bookmarkedIds } = useBookmarks();
  const [activeTab, setActiveTab] = useState("all");

  const bookmarkedItems = useMemo(() => {
    return mockItems.filter(item => bookmarkedIds.includes(item.id));
  }, [bookmarkedIds]);

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return bookmarkedItems;
    if (activeTab === "courses") return bookmarkedItems.filter(i => i.category === "授業・履修");
    if (activeTab === "career") return bookmarkedItems.filter(i => i.category === "就活・キャリア");
    if (activeTab === "events") return bookmarkedItems.filter(i => i.category === "イベント・お知らせ");
    if (activeTab === "clubs") return bookmarkedItems.filter(i => i.category === "サークル・課外活動");
    return bookmarkedItems;
  }, [bookmarkedItems, activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex items-center mb-8">
          <div className="p-3 bg-primary/10 rounded-full mr-4 text-primary">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ブックマーク</h1>
            <p className="text-muted-foreground mt-1">
              保存した記事を後からすぐに見返すことができます
            </p>
          </div>
        </div>

        {bookmarkedItems.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed rounded-xl bg-muted/10">
            <BookMarked className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
            <h3 className="text-xl font-bold mb-2">まだブックマークがありません</h3>
            <p className="text-muted-foreground mb-8">
              気になる記事を見つけたら、ハートマークを押して保存しましょう。
            </p>
            <Link href="/search">
              <Button size="lg">
                <Search className="w-4 h-4 mr-2" />
                記事を探しに行く
              </Button>
            </Link>
          </div>
        ) : (
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 p-1 h-auto flex flex-wrap justify-start">
              <TabsTrigger value="all" className="px-4 py-2">すべて ({bookmarkedItems.length})</TabsTrigger>
              <TabsTrigger value="courses" className="px-4 py-2">授業・履修</TabsTrigger>
              <TabsTrigger value="career" className="px-4 py-2">就活・キャリア</TabsTrigger>
              <TabsTrigger value="clubs" className="px-4 py-2">サークル</TabsTrigger>
              <TabsTrigger value="events" className="px-4 py-2">イベント</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border rounded-lg bg-muted/5">
                  <p className="text-muted-foreground">
                    このカテゴリーのブックマークはありません
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Footer />
    </div>
  );
}
