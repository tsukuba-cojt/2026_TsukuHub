import { expect, test } from "vitest";
import { parseMenuText, validateMenu } from "./cafeteriaMenu";
test("全角数字・円記号・桁区切りを読み取り候補へ変換する", () => {
  expect(parseMenuText("カレー ５５０円\n定食 ¥1,200\nうどん 400")).toEqual([
    { name: "カレー", price: "550", sold_out: false },
    { name: "定食", price: "1200", sold_out: false },
    { name: "うどん", price: "400", sold_out: false },
  ]);
});
test("価格を判断できない行は推測せず未入力にする", () => {
  expect(parseMenuText("本日のおすすめ\n2種盛り定食")[1]).toEqual({ name: "2種盛り定食", price: "", sold_out: false });
  expect(() => validateMenu(parseMenuText("価格不明"))).toThrow("1行目");
});
test.each(["", "-1", "12.5", "100000", "550円"])("不正な価格 %s の登録を防ぐ", (price) => {
  expect(() => validateMenu([{ name: "定食", price, sold_out: false }])).toThrow();
});
test("空メニューと品名未入力を拒否し、売り切れを保持する", () => {
  expect(() => validateMenu([])).toThrow();
  expect(() => validateMenu([{ name: " ", price: "500", sold_out: false }])).toThrow();
  expect(validateMenu([{ name: " 定食 ", price: "500", sold_out: true }])).toEqual([{ name: "定食", price: 500, sold_out: true }]);
});
