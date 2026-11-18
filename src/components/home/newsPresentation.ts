import { BellRing, BookOpen, BriefcaseBusiness, CalendarDays, Home, UsersRound } from "lucide-react";

export const newsPresentation = (category: string) => {
  if (category.includes("就活") || category.includes("キャリア")) return { tagClass: "tagJob", icon: BriefcaseBusiness, filter: "job" as const };
  if (category.includes("授業") || category.includes("履修")) return { tagClass: "tagClass", icon: BookOpen, filter: "class" as const };
  if (category.includes("サークル")) return { tagClass: "tagClub", icon: UsersRound, filter: "event" as const };
  if (category.includes("イベント")) return { tagClass: "tagEvent", icon: CalendarDays, filter: "event" as const };
  if (category.includes("生活")) return { tagClass: "tagLife", icon: Home, filter: "life" as const };
  return { tagClass: "tagEvent", icon: BellRing, filter: "event" as const };
};
