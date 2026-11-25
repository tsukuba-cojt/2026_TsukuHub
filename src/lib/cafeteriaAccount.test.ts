import { expect, test } from "vitest";
import { cafeteriaAccountEmail, cafeteriaAccountName } from "./cafeteriaAccount";
test("アカウント名を正規化し、メール形式の入力を拒否する", () => {
  expect(cafeteriaAccountEmail(" Suzuya ")).toBe("suzuya@cafeteria.tsukuhub.com");
  expect(() => cafeteriaAccountEmail("admin@example.com")).toThrow();
  expect(() => cafeteriaAccountEmail("")).toThrow();
});
test("画面には内部アドレスではなくアカウント名を表示する", () => {
  expect(cafeteriaAccountName("suzuya@cafeteria.tsukuhub.com")).toBe("suzuya");
  expect(cafeteriaAccountName("staff@example.com")).toBe("staff@example.com");
});
