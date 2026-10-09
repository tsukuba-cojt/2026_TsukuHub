import { describe, expect, it } from "vitest";
import {
  defaultsFromAccount,
  emptyApplicationForm,
  facultyChoices,
  graduationYearFromGrade,
  normalizeHttpUrl,
  textValue,
  validateApplicationForm,
} from "./applicationFormState";

const now = new Date("2026-09-13T00:00:00+09:00");

describe("graduationYearFromGrade", () => {
  it("derives undergrad graduation year from grade", () => {
    expect(graduationYearFromGrade(1, "undergraduate", now)).toBe("2030");
    expect(graduationYearFromGrade(4, "undergraduate", now)).toBe("2027");
  });

  it("derives graduate graduation year from grade", () => {
    expect(graduationYearFromGrade(1, "graduate", now)).toBe("2028");
    expect(graduationYearFromGrade(2, "graduate", now)).toBe("2027");
    expect(graduationYearFromGrade(1, "master", now)).toBe("2028");
    expect(graduationYearFromGrade(1, "doctor", now)).toBe("2029");
  });
});

describe("defaultsFromAccount", () => {
  it("fills identity fields from profile and auth email", () => {
    expect(
      defaultsFromAccount(
        { name: "山田太郎", major: "情報科学類", grade: 3, category: "undergraduate" },
        { email: "s1234567@u.tsukuba.ac.jp" },
        now,
      ),
    ).toEqual({
      applicant_name: "山田太郎",
      email: "s1234567@u.tsukuba.ac.jp",
      faculty: "情報科学類",
      graduation_year: "2028",
      category: "undergraduate",
    });
  });
});

describe("facultyChoices", () => {
  it("returns 学類 options for Tsukuba undergraduates", () => {
    const options = facultyChoices("tsukuba", "undergraduate", "情報科学類");
    expect(options.map((option) => option.value)).toContain("情報科学類");
    expect(options[0]?.value).toBe("人文学類");
  });
});

describe("応募フォームの入力確認", () => {
  const validForm = {
    ...emptyApplicationForm,
    applicant_name: "筑波 花子",
    email: "student@example.com",
    phone: "090-1234-5678",
    faculty: "情報学群",
    graduation_year: "2028",
    motivation: "授業で学んだことを実践したいです。",
    skills: "授業でWebアプリを制作しました。",
  };

  it("任意項目が空でも確認画面へ進める", () => {
    expect(validateApplicationForm(validForm)).toBe("");
  });

  it("前後の空白を除去したメールアドレスを受け付ける", () => {
    expect(validateApplicationForm({ ...validForm, email: " student@example.com ", portfolio_url: " " })).toBe("");
  });

  it.each(["applicant_name", "email", "faculty", "motivation"] as const)("必須項目 %s が空白のみなら進めない", (key) => {
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

  it("電話番号の形式を確認する", () => {
    expect(validateApplicationForm({ ...validForm, phone: "123" })).toContain("電話番号");
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
