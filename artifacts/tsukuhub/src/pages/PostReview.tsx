import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { mockItems } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, FormControl, FormDescription, FormField, 
  FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Star } from "lucide-react";

const reviewSchema = z.object({
  courseName: z.string().min(1, "授業名を入力してください"),
  overall: z.coerce.number().min(1, "評価を選択してください").max(5),
  difficulty: z.coerce.number().min(1, "評価を選択してください").max(5),
  workload: z.coerce.number().min(1, "評価を選択してください").max(5),
  attendance: z.coerce.number().min(1, "評価を選択してください").max(5),
  testFormat: z.string().min(1, "テスト形式を選択してください"),
  materialsAllowed: z.string().min(1, "持ち込み可否を選択してください"),
  studyMethod: z.string().min(10, "勉強方法は10文字以上で入力してください").max(500),
  comment: z.string().min(10, "コメントは10文字以上で入力してください").max(1000),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

function StarInput({ value, onChange }: { value: number, onChange: (val: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm transition-transform hover:scale-110"
        >
          <Star 
            className={`w-8 h-8 ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} 
          />
        </button>
      ))}
    </div>
  );
}

export default function PostReview() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const courseId = searchParams.get("courseId");
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill course name if courseId is provided
  const course = mockItems.find(i => i.id === courseId);
  const defaultCourseName = course?.title || "";

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      courseName: defaultCourseName,
      overall: 0,
      difficulty: 0,
      workload: 0,
      attendance: 0,
      testFormat: "",
      materialsAllowed: "",
      studyMethod: "",
      comment: "",
    },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true);
    
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    
    toast({
      title: "投稿完了",
      description: "授業評価を投稿しました。ご協力ありがとうございます！",
    });
    
    if (courseId) {
      setLocation(`/detail/${courseId}`);
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">授業評価を投稿する</h1>
          <p className="text-muted-foreground">
            あなたの経験が後輩の履修登録の助けになります。<br className="hidden sm:block" />
            正直な感想をお聞かせください。
          </p>
        </div>

        <Card className="shadow-lg border-primary/10">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle>評価フォーム</CardTitle>
            <CardDescription>項目はすべて必須です</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <FormField
                  control={form.control}
                  name="courseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">授業名</FormLabel>
                      <FormControl>
                        <Input placeholder="例: データ工学概論" {...field} className="h-12 text-lg" readOnly={!!courseId} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/30 p-6 rounded-xl border border-border/50">
                  <FormField
                    control={form.control}
                    name="overall"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">総合評価 (おすすめ度)</FormLabel>
                        <FormControl>
                          <StarInput value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">単位の取りやすさ (5が簡単)</FormLabel>
                        <FormControl>
                          <StarInput value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="workload"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">課題の少なさ (5が少ない)</FormLabel>
                        <FormControl>
                          <StarInput value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="attendance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">出席のゆるさ (5がゆるい)</FormLabel>
                        <FormControl>
                          <StarInput value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="testFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">テスト形式</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="筆記">筆記</SelectItem>
                            <SelectItem value="レポート">レポート</SelectItem>
                            <SelectItem value="発表">発表</SelectItem>
                            <SelectItem value="なし">なし</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="materialsAllowed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">持ち込み可否</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="可">可（なんでも）</SelectItem>
                            <SelectItem value="一部可">一部可（自筆ノートのみ等）</SelectItem>
                            <SelectItem value="不可">不可</SelectItem>
                            <SelectItem value="テストなし">テストなし</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="studyMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">勉強方法・テスト対策</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="過去問を解くのが効果的でした。先生の配るレジュメからよく出ます。"
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">総合コメント</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="先生が優しく、質問にも丁寧に答えてくれます。課題は少し重いですが、力がつく授業です。"
                          className="resize-none min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        特定の個人を誹謗中傷する内容や、虚偽の内容はお控えください。
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-6 border-t flex justify-end">
                  <Button type="button" variant="outline" className="mr-4" onClick={() => setLocation(-1)}>
                    キャンセル
                  </Button>
                  <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[150px] font-bold">
                    {isSubmitting ? "送信中..." : "評価を投稿する"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
