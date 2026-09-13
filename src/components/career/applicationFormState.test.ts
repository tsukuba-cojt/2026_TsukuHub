import { describe, expect, it } from "vitest";
import {
  defaultsFromAccount,
  emptyApplicationForm,
  facultyChoices,
  graduationYearFromGrade,
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

describe("validateApplicationForm", () => {
  const filled = {
    ...emptyApplicationForm,
    applicant_name: "山田太郎",
    email: "s1234567@u.tsukuba.ac.jp",
    faculty: "情報科学類",
    graduation_year: "2028",
    phone: "090-1234-5678",
    motivation: "この求人に興味があります。",
  };

  it("allows empty skills, portfolio, and notes", () => {
    expect(validateApplicationForm(filled)).toBe("");
  });

  it("still requires motivation", () => {
    expect(validateApplicationForm({ ...filled, motivation: "" })).toBe("必須項目を入力してください。");
  });

  it("requires a valid phone number", () => {
    expect(validateApplicationForm({ ...filled, phone: "" })).toBe("必須項目を入力してください。");
    expect(validateApplicationForm({ ...filled, phone: "123" })).toBe("電話番号の形式を確認してください。");
  });
});
