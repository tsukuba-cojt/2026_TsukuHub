import { BookOpen, BriefcaseBusiness, CalendarDays, Home, UsersRound } from "lucide-react";

export const topics = [
  {
    tag: "就活・キャリア",
    tagClass: "tagJob",
    icon: BriefcaseBusiness,
    title: "【6/9（月）】夏インターンの探し方と選考対策ガイド",
    date: "2026/05/10",
  },
  {
    tag: "授業・履修",
    tagClass: "tagClass",
    icon: BookOpen,
    title: "春Aにとるべきおすすめ授業【学類別】",
    date: "2026/05/12",
  },
  {
    tag: "サークル・課外活動",
    tagClass: "tagClub",
    icon: UsersRound,
    title: "2026年度 新歓情報",
    date: "2026/04/30",
  },
  {
    tag: "生活・便利情報",
    tagClass: "tagLife",
    icon: Home,
    title: "一人暮らし始め方完全ガイド",
    date: "2026/04/10",
  },
];

export type LatestNewsCategory = "all" | "job" | "class" | "event" | "life";

export const latestNewsTabs: { key: LatestNewsCategory; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "job", label: "就活・キャリア" },
  { key: "class", label: "授業・履修" },
  { key: "event", label: "イベント" },
  { key: "life", label: "生活・便利情報" },
];

export const latestNews = [
  {
    category: "job" as LatestNewsCategory,
    tag: "就活・キャリア",
    tagClass: "tagJob",
    icon: BriefcaseBusiness,
    title: "【締切間近】大手IT企業 サマーインターン募集開始！",
    date: "2026/05/12",
  },
  {
    category: "event" as LatestNewsCategory,
    tag: "イベント",
    tagClass: "tagEvent",
    icon: CalendarDays,
    title: "中高生合同　交流会のお知らせ",
    date: "2026/05/11",
  },
  {
    category: "event" as LatestNewsCategory,
    tag: "サークル・課外活動",
    tagClass: "tagClub",
    icon: UsersRound,
    title: "軽音サークルライブ開催決定！",
    date: "2026/05/11",
  },
  {
    category: "class" as LatestNewsCategory,
    tag: "授業・履修",
    tagClass: "tagClass",
    icon: BookOpen,
    title: "「統計学入門」の資料を追加しました",
    date: "2026/05/09",
  },
];
