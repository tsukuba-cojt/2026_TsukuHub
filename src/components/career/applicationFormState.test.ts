import { describe, expect, it } from "vitest";
import { emptyApplicationForm, normalizeHttpUrl, textValue, validateApplicationForm } from "./applicationFormState";

const validForm = {
  ...emptyApplicationForm,
  applicant_name: "筑波 花子",
  email: "student@example.com",
  faculty: "情報学群",
  graduation_year: "2028",
  motivation: "授業で学んだことを実践したいです。",
  skills: "授業でWebアプリを制作しました。",
};

describe("応募フォームの入力確認", () => {
  it("任意項目が空でも確認画面へ進める", () => {
    expect(validateApplicationForm(validForm)).toBe("");
  });

  it("前後の空白を除去したメールアドレスを受け付ける", () => {
    expect(validateApplicationForm({ ...validForm, email: " student@example.com ", portfolio_url: " " })).toBe("");
  });

  it.each(["applicant_name", "email", "faculty", "motivation", "skills"] as const)("必須項目 %s が空白のみなら進めない", (key) => {
    expect(validateApplicationForm({ ...validForm, [key]: "  " })).toBe("必須項目を入力してください。");
  });

  it.each(["2025", "2101", "2028.5", "NaN", "Infinity"])("不正な卒業予定年 %s を送信させない", (graduation_year) => {
    expect(validateApplicationForm({ ...validForm, graduation_year })).toContain("卒業予定年");
  });

  it("プロフィールの数値の卒業予定年をフォームに反映できる", () => {
    expect(textValue(2028)).toBe("2028");
    expect(textValue(null)).toBe("");
    expect(textValue(Number.NaN)).toBe("");
  });

  it("HTTP以外のポートフォリオURLを拒否する", () => {
    expect(validateApplicationForm({ ...validForm, portfolio_url: "javascript:alert(1)" })).toContain("URL");
    expect(normalizeHttpUrl(" https://example.com/work ")).toBe("https://example.com/work");
  });

  it("文字数の上限を確認する", () => {
    expect(validateApplicationForm({ ...validForm, motivation: "あ".repeat(2000) })).toBe("");
    expect(validateApplicationForm({ ...validForm, motivation: "あ".repeat(2001) })).toContain("文字数");
  });
});
