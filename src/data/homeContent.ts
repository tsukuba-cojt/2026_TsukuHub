export type LatestNewsCategory = "all" | "job" | "class" | "event" | "life";

export const latestNewsTabs: { key: LatestNewsCategory; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "job", label: "就活・キャリア" },
  { key: "class", label: "授業・履修" },
  { key: "event", label: "イベント" },
  { key: "life", label: "生活・便利情報" },
];
