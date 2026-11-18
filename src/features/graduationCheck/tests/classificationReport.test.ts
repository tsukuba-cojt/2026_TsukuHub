import { describe, expect, test } from "vitest";
import { buildClassificationReports, type ClassificationReportSelection } from "../classificationReport";

const selection: ClassificationReportSelection = {
  courseCode: "GA12345",
  courseName: "テスト科目",
  originalClassification: "specialized",
  correctedClassification: "related",
};

describe("誤分類報告データ", () => {
  test("報告者のメールと各科目の変更前後の分類を5項目で出力する", () => {
    const selections = [selection, { ...selection, courseCode: "GA54321", originalClassification: "unclassified" as const }];
    expect(buildClassificationReports(" student@example.com ", selections)).toEqual(
      selections.map((item) => ({ ...item, reporterEmail: "student@example.com" })),
    );
    expect(selection.originalClassification).toBe("specialized");
  });

  test("未分類の科目を5区分へ変更して報告できる", () => {
    expect(buildClassificationReports("student@example.com", [{ ...selection, originalClassification: "unclassified" }])[0]).toMatchObject({
      originalClassification: "unclassified",
      correctedClassification: "related",
    });
  });

  test("メール未入力・不正、未選択、変更のない報告を拒否する", () => {
    for (const email of ["", "invalid", "a b@example.com"]) {
      expect(() => buildClassificationReports(email, [selection])).toThrow("メールアドレス");
    }
    expect(() => buildClassificationReports("student@example.com", [])).toThrow("選択");
    expect(() => buildClassificationReports("student@example.com", [{ ...selection, correctedClassification: "specialized" }])).toThrow("異なる分類");
  });

  test("科目番号が空でも報告でき、空文字を保持する", () => {
    expect(buildClassificationReports("student@example.com", [{ ...selection, courseCode: "" }])).toEqual([
      { ...selection, courseCode: "", reporterEmail: "student@example.com" },
    ]);
  });

  test("科目名のない報告を拒否する", () => {
    for (const courseName of ["", " "]) {
      expect(() => buildClassificationReports("student@example.com", [{ ...selection, courseName }])).toThrow("科目名");
    }
  });
});
