import { describe, expect, test } from "vitest";
import { checkGraduation } from "../checkGraduation";
import { gradRequirementData } from "../data/gradRequirementData";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

const compulsoryNames = (requirementId: "medicine-22" | "medicine-26" | "new-medicine-22" | "new-medicine-26") =>
  gradRequirementData[requirementId].courses.compulsory;

describe("医学類の卒業要件", () => {
  test("2026年度の学術英語への変更を別ルール版にする", () => {
    expect(resolveRequirementId("medicine", "medicine", 2025)).toBe("medicine-22");
    expect(resolveRequirementId("medicine", "medicine", 2026)).toBe("medicine-26");
    expect(resolveRequirementId("medicine", "new-medicine", 2025)).toBe("new-medicine-22");
    expect(resolveRequirementId("medicine", "new-medicine", 2026)).toBe("new-medicine-26");

    expect(compulsoryNames("medicine-22")).toContain("TOEFL演習");
    expect(compulsoryNames("medicine-22")).not.toContain("学術英語");
    expect(compulsoryNames("medicine-26")).toContain("学術英語");
    expect(compulsoryNames("medicine-26")).not.toContain("TOEFL演習");
  });

  test("医学主専攻にはM6科目、新医学主専攻には研究室実習を要求する", () => {
    const medicine = compulsoryNames("medicine-22");
    const newMedicine = compulsoryNames("new-medicine-22");

    expect(medicine).toContain("M6クリニカル・クラークシップ (Phase IIB)");
    expect(medicine).toContain("M6アドヴァンスト・エレクティヴズ");
    expect(medicine).not.toContain("研究室実習");
    expect(newMedicine).toContain("研究室実習");
    expect(newMedicine).not.toContain("M6クリニカル・クラークシップ (Phase IIB)");
    expect(newMedicine).not.toContain("M6アドヴァンスト・エレクティヴズ");
  });

  test("専門基礎必修3単位を必修科目として判定する", () => {
    const report = checkGraduation(
      [
        course("HB11111", "Clinical Communication in English I", 1, "A", 2025),
        course("HB11112", "Clinical Communication in English II", 1, "A", 2025),
        course("HB13222", "TOEFL演習", 1, "A", 2025),
      ],
      "medicine-22",
    );

    for (const name of [
      "Clinical Communication in English I",
      "Clinical Communication in English II",
      "TOEFL演習",
    ]) {
      expect(
        report.details.compulsoryResults.find((item) => item.name === name),
      ).toMatchObject({ passed: true });
    }
  });

  test("専門基礎選択はPDF指定7科目だけを数え、同じFA系の別科目は数えない", () => {
    const report = checkGraduation(
      [
        course("FCB1201", "力学1", 5, "A", 2025),
        course("FA99999", "指定外のFA科目", 5, "A", 2025),
      ],
      "medicine-22",
    );
    const foundation = report.details.requirementItems.find(
      (item) => item.label === "医学類が指定する専門基礎科目",
    );

    expect(foundation).toMatchObject({ earnedUnits: 5, isSatisfied: true });
    expect(foundation?.courses.map((item) => item.name)).toEqual(["力学1"]);
  });

  test("関連科目は公式表の4小区分を個別に満たす必要がある", () => {
    const report = checkGraduation(
      [
        course("HB99991", "医学類の選択科目", 1, "A", 2025),
        course("FA99991", "指定自然科学科目", 2, "A", 2025),
        course("A999991", "A系科目", 2, "A", 2025),
        course("HC99991", "他学類科目", 2, "A", 2025),
      ],
      "medicine-22",
    );
    const relatedItems = report.details.requirementItems.filter(
      (item) => item.category === "related",
    );

    expect(relatedItems.map((item) => item.minimumUnits)).toEqual([1, 2, 2, 2]);
    expect(relatedItems.map((item) => item.isSatisfied)).toEqual([
      true,
      true,
      true,
      true,
    ]);
  });
});
