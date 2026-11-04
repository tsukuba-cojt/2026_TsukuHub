import { CookingPot, HandHeart, House } from "lucide-react";

// 「生活・便利情報」のグローバルナビ用ドロップダウンの項目。
// 色・遷移先は /life ハブページの機能カード（LifeCategoryGrid.tsx）と揃えている。
// /life/cafeteria・/life/housing は未実装のため App.tsx に未登録で、
// クリック時は InternalLinkGuard が遷移を止め「準備中」トーストを出す。
// /life/sharing は comingSoon.ts の COMING_SOON_PATHS で準備中扱い。
export const lifeMenuItems = [
  {
    icon: CookingPot,
    label: "学食情報",
    linkLabel: "学食情報を見る",
    path: "/life/cafeteria",
    colorClass: "isYellow",
  },
  {
    icon: House,
    label: "住まい情報",
    linkLabel: "住まい情報を見る",
    path: "/life/housing",
    colorClass: "isGreen",
  },
  {
    icon: HandHeart,
    label: "譲り合い",
    linkLabel: "譲り合いを見る",
    path: "/life/sharing",
    colorClass: "isPink",
  },
];
