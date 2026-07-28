import {
  BookOpenCheck,
  BriefcaseBusiness,
  MessageSquareQuote,
} from "lucide-react";

// 「就活・キャリア」トップの3カテゴリーとグローバルナビのメニューで共有する導線。
export const careerMenuItems = [
  {
    icon: BookOpenCheck,
    label: "基礎知識",
    linkLabel: "基礎知識を見る",
    path: "/career/basics",
    colorClass: "isBlue",
  },
  {
    icon: BriefcaseBusiness,
    label: "長期インターン情報",
    linkLabel: "インターンを探す",
    path: "/career/internships",
    colorClass: "isGreen",
  },
  {
    icon: MessageSquareQuote,
    label: "卒業生の体験記",
    linkLabel: "体験記を読む",
    path: "/career/stories",
    colorClass: "isPurple",
  },
];
