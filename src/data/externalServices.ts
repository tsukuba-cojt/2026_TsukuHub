import { BookOpenCheck, KeyRound, LibraryBig, type LucideIcon } from "lucide-react";

type ExternalService = {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  colorClass: "isBlue" | "isPurple" | "isGreen";
};

export const externalServices: ExternalService[] = [
  {
    name: "TWINS",
    description: "履修登録や成績確認など、学生生活の基本手続きへ。",
    href: "https://twins.tsukuba.ac.jp/campusweb/",
    icon: BookOpenCheck,
    colorClass: "isBlue",
  },
  {
    name: "manaba",
    description: "筑波大学の各種システムにログインするための認証画面へ。",
    href: "https://www.ecloud.tsukuba.ac.jp/manaba",
    icon: KeyRound,
    colorClass: "isPurple",
  },
  {
    name: "Tulips",
    description: "附属図書館のサービス、蔵書検索、学修支援情報へ。",
    href: "https://www.tulips.tsukuba.ac.jp/lib/ja/service",
    icon: LibraryBig,
    colorClass: "isGreen",
  },
];

export const osakaExternalServices: ExternalService[] = [
  {
    name: "KOAN",
    description: "履修登録や成績確認など、学務情報システムへの入口。",
    href: "https://koan.osaka-u.ac.jp/",
    icon: BookOpenCheck,
    colorClass: "isBlue",
  },
  {
    name: "マイハンダイ",
    description: "大阪大学ポータルから各種システムへアクセス。",
    href: "https://www.osaka-u.ac.jp/ja/campus/myhandai",
    icon: KeyRound,
    colorClass: "isPurple",
  },
  {
    name: "CELAS",
    description: "全学共通教育科目の履修案内・卒業要件情報へ。",
    href: "https://www.celas.osaka-u.ac.jp/",
    icon: LibraryBig,
    colorClass: "isGreen",
  },
];

export const externalServicesByUniversity: Record<"tsukuba" | "osaka", ExternalService[]> = {
  tsukuba: externalServices,
  osaka: osakaExternalServices,
};
