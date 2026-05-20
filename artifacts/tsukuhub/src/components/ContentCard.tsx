import { Link } from "wouter";
import { ContentItem } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "./BookmarkButton";
import { Calendar, ChevronRight } from "lucide-react";

interface ContentCardProps {
  item: ContentItem;
}

const categoryColors: Record<string, string> = {
  "就活・キャリア": "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300",
  "授業・履修": "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300",
  "サークル・課外活動": "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/40 dark:text-orange-300",
  "生活・便利情報": "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300",
  "イベント・お知らせ": "bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900/40 dark:text-pink-300",
  "留学・国際交流": "bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300",
};

export function ContentCard({ item }: ContentCardProps) {
  const badgeClass = categoryColors[item.category] || "bg-secondary text-secondary-foreground";

  return (
    <Card className="flex flex-col h-full hover-elevate transition-all group overflow-hidden">
      <CardHeader className="p-5 pb-0 flex flex-row items-start justify-between space-y-0 gap-4">
        <div className="space-y-2 flex-1">
          <Badge className={`${badgeClass} border-none font-normal shadow-none`}>
            {item.category}
          </Badge>
          <Link href={`/detail/${item.id}`}>
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {item.title}
            </h3>
          </Link>
        </div>
        <BookmarkButton id={item.id} />
      </CardHeader>
      
      <CardContent className="p-5 pt-4 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
          {item.summary}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
              #{tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 flex items-center justify-between mt-auto">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {item.updatedAt}
        </div>
        <Link href={`/detail/${item.id}`}>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 -mr-2">
            詳細を見る <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
