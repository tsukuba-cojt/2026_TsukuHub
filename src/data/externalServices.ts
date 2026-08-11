import { BookOpenCheck, KeyRound, LibraryBig } from "lucide-react";

export const externalServices = [
  {
    name: "TWINS",
    description: "履修登録や成績確認など、学生生活の基本手続きへ。",
    href: "https://twins.tsukuba.ac.jp/campusweb/",
    icon: BookOpenCheck,
    colorClass: "isBlue",
  },
  {
    name: "統一認証システム",
    description: "筑波大学の各種システムにログインするための認証画面へ。",
    href: "https://idp.account.tsukuba.ac.jp/idp/profile/SAML2/Redirect/SSO?execution=e1s2",
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
] as const;
