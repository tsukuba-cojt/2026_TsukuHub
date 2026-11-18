// 卒業要件チェック 結果ページ／詳細画面で共通の達成率ヘルパー。
//
// ── 達成率の色分け（概要・詳細で共通仕様） ──
// 100%以上=緑 / 51〜99%=黄 / 0〜50%=ピンク

export type ProgressLevel = "ok" | "warn" | "low";

export const levelFromPercent = (percent: number): ProgressLevel =>
  percent >= 100 ? "ok" : percent > 50 ? "warn" : "low";

export const levelClass: Record<ProgressLevel, string> = {
  ok: "isOk",
  warn: "isWarn",
  low: "isLow",
};

// %表示用：小数1桁に丸め、整数なら小数点以下を省く（例：62.9 / 100）
export const formatPercent = (percent: number): string => {
  const rounded = Math.round(percent * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};
