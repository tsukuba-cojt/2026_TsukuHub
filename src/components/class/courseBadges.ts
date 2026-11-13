// 講義詳細ページのバッジ表示用ユーティリティ

// KdB「授業方法」コード → 日本語ラベル
const methodLabels: Record<string, string> = {
  "1": "講義",
  "2": "演習",
  "3": "実習・実験・実技",
  "4": "講義及び演習",
};

// 授業方法コードをラベルに変換する。
// 未知のコード / null / 空値は null を返し、バッジ自体を表示しない。
export const getMethodLabel = (
  method: string | null | undefined
): string | null => {
  if (!method) return null;
  return methodLabels[method.trim()] ?? null;
};

// KdB「備考」（remarks カラム）の部分一致で講義形式を判定する。
// 表記例：「対面」「対面(オンライン併用型)」「オンライン(オンデマンド型)」
// 「オンライン(同時双方向型)」（括弧は半角の場合がある）。
// 優先順位：対面 ＞ 同時双方向・オンデマンド。
// 1) 「対面」を含む → 「併用」も含めば「対面・オンライン」、なければ「対面」
//    （対面を含む場合、同時双方向/オンデマンドの個別バッジは出さない）
// 2) 含まない場合のみ「同時双方向」「オンデマンド」を判定し該当をすべて表示
//    どちらも無く「オンライン」のみ含む場合は「オンライン」
// 3) どれも該当しない → 空配列（バッジを出さない）
export const getClassFormats = (
  note: string | null | undefined
): string[] => {
  if (!note) return [];
  if (note.includes("対面")) {
    return note.includes("併用") ? ["対面・オンライン"] : ["対面"];
  }
  const online = (["同時双方向", "オンデマンド"] as const).filter((m) =>
    note.includes(m)
  );
  if (online.length > 0) return [...online];
  return note.includes("オンライン") ? ["オンライン"] : [];
};
