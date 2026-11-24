import { ClipboardList, Search, UsersRound } from "lucide-react";

// 「授業・履修」の3機能の共有定義。
// GlobalNav のドロップダウンと授業・履修トップページ（/class/top）の両方から参照する。
// 卒業要件チェック・みんなの時間割は後日本実装予定のため、
// 遷移先はここの path を差し替えるだけでよい
// （現状は未登録パス＝catch-all の404ページへ遷移する仮リンク）。
export const classMenuItems = [
  {
    icon: Search,
    label: "講義検索",
    linkLabel: "講義を探す", // ドロップダウン用
    ctaLabel: "講義を探す", // トップページのカードボタン用
    description: "学類・学期・キーワードなどから講義を検索できます。",
    path: "/class",
    colorClass: "isBlue",
  },
  {
    icon: ClipboardList,
    label: "卒業要件チェック",
    linkLabel: "要件を確認する",
    ctaLabel: "要件を確認する",
    description: "自分の履修状況を確認して、卒業要件の達成度をチェックできます。",
    path: "/graduation-checker",
    colorClass: "isGreen",
  },
  {
    icon: UsersRound,
    label: "みんなの時間割",
    linkLabel: "時間割を見る",
    ctaLabel: "時間割を見てみる",
    description: "他の学生の時間割を参考にして、自分の履修計画に役立てよう。",
    path: "/timetable",
    colorClass: "isYellow",
  },
];
