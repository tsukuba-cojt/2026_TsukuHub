import { Link } from "wouter";
import { Briefcase, BookOpen, Users, Coffee, Calendar, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@/types";

const categoryIcons: Record<Category, React.ElementType> = {
  "就活・キャリア": Briefcase,
  "授業・履修": BookOpen,
  "サークル・課外活動": Users,
  "生活・便利情報": Coffee,
  "イベント・お知らせ": Calendar,
  "留学・国際交流": Globe,
};

const categoryColors: Record<Category, string> = {
  "就活・キャリア": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "授業・履修": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "サークル・課外活動": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "生活・便利情報": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "イベント・お知らせ": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  "留学・国際交流": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
};

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = categoryIcons[category];
  const colorClass = categoryColors[category];

  return (
    <Link href={`/search?category=${encodeURIComponent(category)}`}>
      <Card className="hover-elevate cursor-pointer border-transparent hover:border-border transition-all group overflow-hidden h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className={`p-4 rounded-full ${colorClass} transition-transform group-hover:scale-110`}>
            <Icon className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-sm md:text-base leading-tight">
            {category}
          </h3>
        </CardContent>
      </Card>
    </Link>
  );
}
