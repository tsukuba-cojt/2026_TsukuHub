import { describe, expect, test } from "vitest";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

describe("国際総合学類の卒業要件", () => {
  test("2022年度版と監査済みの2023〜2026年度版を主専攻ごとに分離する", () => {
    expect(resolveRequirementId("international", "international-relations", 2022)).toBeNull();
    expect(resolveRequirementId("international", "international-relations", 2025)).toBe("international-relations-23");
    expect(resolveRequirementId("international", "international-development", 2026)).toBe("international-development-23");
  });

  test.each([
    ["international-relations-23", "BC11001", "BC12001"],
    ["international-development-23", "BC12001", "BC11001"],
  ] as const)(
    "%s は指定4群32単位と主専攻側14単位を同時に判定する",
    (requirementId, ownCode, otherCode) => {
      const report = checkGraduation(
        [
          course(ownCode, "主専攻側科目", 14, "A", 2025),
          course(otherCode, "指定4群の他科目", 18, "A", 2025),
        ],
        requirementId,
      );
      const specialized = report.details.requirementItems.filter(
        (item) => item.category === "specialized",
      );

      expect(specialized.slice(0, 2)).toMatchObject([
        { minimumUnits: 32, earnedUnits: 32, isSatisfied: true },
        { minimumUnits: 14, earnedUnits: 14, isSatisfied: true },
      ]);
    },
  );

  test("主専攻側14単位があっても指定4群が32単位未満なら未充足にする", () => {
    const report = checkGraduation(
      [course("BC11001", "国際関係学科目", 14, "A", 2025)],
      "international-relations-23",
    );
    const specialized = report.details.requirementItems.filter(
      (item) => item.category === "specialized",
    );

    expect(specialized.slice(0, 2)).toMatchObject([
      { minimumUnits: 32, earnedUnits: 14, isSatisfied: false },
      { minimumUnits: 14, earnedUnits: 14, isSatisfied: true },
    ]);
  });

  test("専門基礎の英語討論科目4単位を独立して判定する", () => {
    const report = checkGraduation(
      [course("BC51001", "その他の専門基礎", 14, "A", 2025)],
      "international-relations-23",
    );

    expect(
      report.details.requirementItems.find(
        (item) => item.label === "英語による討論科目",
      ),
    ).toMatchObject({ minimumUnits: 4, earnedUnits: 0, isSatisfied: false });
  });

  test("関連科目の2系統を各3単位以上必要とする", () => {
    const report = checkGraduation(
      [course("A000001", "第1系統", 6, "A", 2025)],
      "international-relations-23",
    );
    const related = report.details.requirementItems.filter(
      (item) => item.category === "related",
    );

    expect(related.map((item) => item.minimumUnits)).toEqual([0, 3, 3, 0]);
    expect(related.map((item) => item.isSatisfied)).toEqual([true, true, false, true]);
  });
});
