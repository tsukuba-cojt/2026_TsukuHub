import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { User, Settings, Edit3, BookMarked, Bell, LogOut, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useBookmarks } from "@/context/BookmarkContext";

export default function MyPage() {
  const { bookmarkedIds } = useBookmarks();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">マイページ</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-primary/10 shadow-md">
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
                  <User className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-bold mb-1">筑波 太郎</h2>
                <p className="text-muted-foreground text-sm mb-4">情報学群 情報メディア創成学類 3年</p>
                
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <Badge variant="secondary">フロントエンド</Badge>
                  <Badge variant="secondary">デザイン</Badge>
                  <Badge variant="secondary">吹奏楽</Badge>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Edit3 className="w-4 h-4 mr-2" />
                  プロフィール編集
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  <Link href="/bookmarks" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b">
                    <div className="flex items-center">
                      <BookMarked className="w-5 h-5 mr-3 text-muted-foreground" />
                      <span className="font-medium">ブックマーク</span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="secondary" className="mr-2">{bookmarkedIds.length}</Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                  <Link href="#" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b">
                    <div className="flex items-center">
                      <Settings className="w-5 h-5 mr-3 text-muted-foreground" />
                      <span className="font-medium">アカウント設定</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                  <button className="flex items-center p-4 hover:bg-destructive/10 text-destructive transition-colors w-full text-left">
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-medium">ログアウト</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit3 className="w-5 h-5 mr-2 text-primary" />
                  あなたの投稿履歴
                </CardTitle>
                <CardDescription>あなたが投稿した授業評価や記事の管理ができます</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 1, type: "授業評価", title: "データ工学概論", date: "2023-09-15", status: "公開中" },
                    { id: 2, type: "授業評価", title: "プログラミング入門", date: "2023-04-10", status: "公開中" },
                  ].map(post => (
                    <div key={post.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="mb-3 sm:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs bg-background">{post.type}</Badge>
                          <span className="text-xs text-muted-foreground">{post.date}</span>
                        </div>
                        <h4 className="font-medium">{post.title}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">{post.status}</Badge>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">編集</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  通知設定
                </CardTitle>
                <CardDescription>受け取る通知の種類を設定します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-1">新着インターン情報</h4>
                    <p className="text-sm text-muted-foreground">条件にマッチする新しいインターン募集が追加された時</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-1">ブックマークした記事の更新</h4>
                    <p className="text-sm text-muted-foreground">ブックマークしている記事の内容が更新された時</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-1">運営からのお知らせ</h4>
                    <p className="text-sm text-muted-foreground">システムメンテナンスや重要なお知らせ</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
