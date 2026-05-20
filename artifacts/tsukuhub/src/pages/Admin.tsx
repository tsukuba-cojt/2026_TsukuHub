import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, FileText, AlertTriangle, Users } from "lucide-react";

export default function Admin() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <LayoutDashboard className="w-8 h-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">管理者ダッシュボード</h1>
        </div>

        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="articles">記事管理</TabsTrigger>
            <TabsTrigger value="reviews">投稿承認</TabsTrigger>
            <TabsTrigger value="reports">通報対応</TabsTrigger>
            <TabsTrigger value="users">ユーザー</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">記事一覧</h2>
              <Button>新規記事作成</Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-medium">タイトル</th>
                        <th className="px-6 py-4 font-medium">カテゴリー</th>
                        <th className="px-6 py-4 font-medium">ステータス</th>
                        <th className="px-6 py-4 font-medium">更新日</th>
                        <th className="px-6 py-4 font-medium text-right">アクション</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        { id: 1, title: "長期インターン募集 (IT系スタートアップ)", category: "就活・キャリア", status: "公開中", date: "2023-10-05" },
                        { id: 2, title: "第三エリア食堂ガイド", category: "生活・便利情報", status: "公開中", date: "2023-10-02" },
                        { id: 3, title: "学祭ボランティア募集", category: "イベント・お知らせ", status: "下書き", date: "2023-10-10" },
                      ].map((item) => (
                        <tr key={item.id} className="hover:bg-muted/30">
                          <td className="px-6 py-4 font-medium text-foreground">{item.title}</td>
                          <td className="px-6 py-4">{item.category}</td>
                          <td className="px-6 py-4">
                            <Badge variant={item.status === "公開中" ? "default" : "secondary"}>
                              {item.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{item.date}</td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm">編集</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <h2 className="text-xl font-bold flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              未承認の授業評価
            </h2>
            
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge variant="outline" className="mb-2">新規投稿</Badge>
                        <h3 className="font-bold text-lg">プログラミング入門</h3>
                        <p className="text-sm text-muted-foreground">投稿者: 情報学群 1年 (2023-10-15)</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">却下</Button>
                        <Button>承認して公開</Button>
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-sm mb-2"><strong>コメント:</strong></p>
                      <p className="text-sm text-muted-foreground">課題は多いですが、TAさんが丁寧に教えてくれるので初心者でも安心です。</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-xl font-bold flex items-center text-destructive">
              <AlertTriangle className="w-5 h-5 mr-2" />
              通報リスト
            </h2>
            
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground py-12">
                現在、対応が必要な通報はありません。
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  ユーザー管理機能は開発中です
                </CardTitle>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
