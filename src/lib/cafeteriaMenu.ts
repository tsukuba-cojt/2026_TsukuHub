export type MenuDraft = { name: string; price: string; sold_out: boolean };
export type PublishedMenuItem = { name: string; price: number; sold_out: boolean };
export const japanMenuDate = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());

// OCR is a suggestion only: rows without an identifiable price remain editable.
export function parseMenuText(text: string): MenuDraft[] {
  return text.normalize("NFKC").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const match = line.match(/^(.*?)\s*(?:[¥￥]\s*([\d,]+)|([\d,]+)\s*円|\s+([\d,]+))\s*$/);
    const price = (match?.[2] ?? match?.[3] ?? match?.[4] ?? "").replaceAll(",", "");
    return { name: match?.[1]?.trim() || line, price, sold_out: false };
  }).slice(0, 100);
}

export function validateMenu(rows: MenuDraft[]): PublishedMenuItem[] {
  if (!rows.length || rows.length > 100) throw new Error("メニューは1〜100件で入力してください。");
  return rows.map((row, index) => {
    if (!row.name.trim() || row.name.trim().length > 120 || !/^\d{1,5}$/.test(row.price)) throw new Error(`${index + 1}行目の品名と価格（0〜99,999円）を確認してください。`);
    return { name: row.name.trim(), price: Number(row.price), sold_out: row.sold_out };
  });
}
