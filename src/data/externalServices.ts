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
    name: "ダミー｜CLE",
    description: "履修登録や成績確認など、学生生活の基本手続きへ。",
    href: "https://example.com/dummy/osaka-cle",
    icon: BookOpenCheck,
    colorClass: "isBlue",
  },
  {
    name: "ダミー｜学務情報",
    description: "大阪大学の学務関連システムへの入口（サンプル）。",
    href: "https://example.com/dummy/osaka-academic",
    icon: KeyRound,
    colorClass: "isPurple",
  },
  {
    name: "ダミー｜図書館",
    description: "附属図書館の蔵書検索や学修支援情報へ。",
    href: "https://example.com/dummy/osaka-library",
    icon: LibraryBig,
    colorClass: "isGreen",
  },
];

export const externalServicesByUniversity: Record<"tsukuba" | "osaka", ExternalService[]> = {
  tsukuba: externalServices,
  osaka: osakaExternalServices,
};
