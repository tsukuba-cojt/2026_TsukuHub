import { useRoute, Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookmarkButton } from "@/components/BookmarkButton";
import { StarRating } from "@/components/StarRating";
import { mockItems } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, User, Clock, BookOpen, AlertCircle, 
  ThumbsUp, BookMarked, MessageSquare, ArrowLeft,
  ChevronRight, PenLine, Flag
} from "lucide-react";
import NotFound from "./not-found";

export default function Detail() {
  const [, params] = useRoute("/detail/:id");
  const id = params?.id;
  
  const item = mockItems.find(i => i.id === id);
  
  if (!item) {
    return <NotFound />;
  }

  const isCourse = item.category === "授業・履修";
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/search" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          検索結果に戻る
        </Link>
        
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          {/* Header Area */}
          <div className="p-6 md:p-8 border-b bg-muted/10 relative">
            <div className="absolute top-6 right-6 md:top-8 md:right-8 flex gap-2">
              <BookmarkButton id={item.id} variant="full" />
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Flag className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mb-4">
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm py-1 px-3">
                {item.category}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 pr-32">
              {item.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5" />
                最終更新: {item.updatedAt}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {item.tags.map(tag => (
                <span key={tag} className="text-sm bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-full font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 md:p-8">
            <div className="prose prose-slate dark:prose-invert max-w-none mb-10">
              <p className="text-lg font-medium text-foreground leading-relaxed">
                {item.summary}
              </p>
              <div className="whitespace-pre-wrap mt-6 text-muted-foreground leading-relaxed">
                {item.body}
              </div>
            </div>

            {/* Course Specific Info */}
            {isCourse && item.ratings && (
              <div className="mt-12 space-y-8">
                <Separator />
                
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <BookOpen className="w-6 h-6 mr-2 text-primary" />
                    授業情報
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card>
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">担当教員</p>
                          <p className="font-semibold text-lg">{item.instructor || "未定"}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">開講時期・時限</p>
                          <p className="font-semibold text-lg">{item.semester} {item.schedule}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted/30 rounded-xl p-6 border">
                    <h3 className="font-semibold text-lg mb-4">総合評価</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">総合</span>
                        <StarRating rating={item.ratings.overall} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">難易度</span>
                        <StarRating rating={item.ratings.difficulty} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">課題量</span>
                        <StarRating rating={item.ratings.workload} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">出席重要度</span>
                        <StarRating rating={item.ratings.attendance} />
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">テスト形式</span>
                      <span className="font-bold">{item.testFormat || "不明"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <Link href={`/post-review?courseId=${item.id}`}>
                    <Button size="lg" className="w-full sm:w-auto font-bold">
                      <PenLine className="w-5 h-5 mr-2" />
                      この授業の評価を投稿する
                    </Button>
                  </Link>
                </div>
                
                {/* Reviews */}
                {item.reviews && item.reviews.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-xl font-bold mb-6 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                      学生の口コミ ({item.reviews.length}件)
                    </h3>
                    
                    <div className="space-y-6">
                      {item.reviews.map(review => (
                        <Card key={review.id} className="overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                  {review.author.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{review.author}</p>
                                  <p className="text-xs text-muted-foreground">{review.createdAt}</p>
                                </div>
                              </div>
                              <StarRating rating={review.overall} />
                            </div>
                            
                            <p className="text-foreground leading-relaxed mt-4">
                              {review.comment}
                            </p>
                            
                            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                              <span className="font-semibold block mb-1">勉強方法:</span>
                              <span className="text-muted-foreground">{review.studyMethod}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
