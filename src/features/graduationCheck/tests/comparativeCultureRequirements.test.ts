import { describe, expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

describe("比較文化学類の年度別卒業要件", () => {
  test("2022年度を対象外とし、2026年度だけ新しいルール版へ分離する", () => {
    expect(
      resolveRequirementId(
        "comparative-culture",
        "comparative-culture",
        2022,
      ),
    ).toBeNull();
    expect(
      resolveRequirementId(
        "comparative-culture",
        "comparative-culture",
        2023,
      ),
    ).toBe("comparative-culture-23");
    expect(
      resolveRequirementId(
        "comparative-culture",
        "comparative-culture",
        2025,
      ),
    ).toBe("comparative-culture-23");
    expect(
      resolveRequirementId(
        "comparative-culture",
        "comparative-culture",
        2026,
      ),
    ).toBe("comparative-culture-26");
  });

  test("公式科目名とAC52科目群で専門必修11単位を判定する", () => {
    const report = checkGraduation(
      [
        course("AC70028", "卒業論文", 6, "A", 2024),
        course("AC70002", "卒業論文演習", 3, "A", 2024),
        course("AC52062", "専門英語I-C", 1, "A", 2024),
        course("AC52072", "専門英語I-A", 1, "A", 2024),
      ],
      "comparative-culture-23",
    );

    expect(
      report.details.compulsoryResults
        .filter((result) =>
          ["卒業論文", "卒業論文演習", "比較文化第一専門外国語"].includes(
            result.name,
          ),
        )
        .map((result) => result.passed),
    ).toEqual([true, true, true]);
  });

  test("AC67とその他AC6等の最低単位を別々に判定する", () => {
    const foundationalSeminars = [
      course("AC67002", "卒業論文基礎演習I", 1, "A", 2024),
      course("AC67012", "卒業論文基礎演習II", 1, "A", 2024),
    ];
    const mainSpecialized = course("AC60A01", "専門科目", 42, "A", 2024);
    const designatedEquivalent = course(
      "AB98A11",
      "指定読替専門科目",
      1,
      "A",
      2024,
    );
    const report = checkGraduation(
      [...foundationalSeminars, mainSpecialized, designatedEquivalent],
      "comparative-culture-23",
    );
    const specializedItems = report.details.requirementItems.filter(
      (item) => item.category === "specialized",
    );
    const categories = collectCategoryCourses(report);

    expect(specializedItems.map((item) => item.minimumUnits)).toEqual([2, 42]);
    expect(specializedItems.map((item) => item.isSatisfied)).toEqual([
      true,
      true,
    ]);
    expect(categories.specialized).toEqual([
      ...foundationalSeminars,
      mainSpecialized,
      designatedEquivalent,
    ]);
    expect(categories.specializedFoundation).not.toContain(mainSpecialized);
  });

  test("専門基礎5小区分の最低単位を個別に判定する", () => {
    const report = checkGraduation([], "comparative-culture-23");
    const foundationItems = report.details.requirementItems.filter(
      (item) => item.category === "specializedFoundation",
    );

    expect(foundationItems.map((item) => item.minimumUnits)).toEqual([
      3, 4, 2, 1, 1,
    ]);
  });

  test("AB5は2023〜2025年度では関連、2026年度では専門基礎へ分類する", () => {
    const ab5 = course("AB50001", "2026年度追加専門基礎科目", 1, "A", 2026);
    const before = collectCategoryCourses(
      checkGraduation([ab5], "comparative-culture-23"),
    );
    const after = collectCategoryCourses(
      checkGraduation([ab5], "comparative-culture-26"),
    );

    expect(before.related).toContain(ab5);
    expect(before.specializedFoundation).not.toContain(ab5);
    expect(after.specializedFoundation).toContain(ab5);
    expect(after.related).not.toContain(ab5);
  });

  test("関連科目2群の最低単位を別々に判定する", () => {
    const report = checkGraduation(
      [course("AA20001", "第1群関連科目", 6, "A", 2024)],
      "comparative-culture-23",
    );
    const relatedItems = report.details.requirementItems.filter(
      (item) => item.category === "related",
    );

    expect(relatedItems.map((item) => item.minimumUnits)).toEqual([4, 2, 0]);
    expect(relatedItems.map((item) => item.isSatisfied)).toEqual([
      true,
      false,
      true,
    ]);
  });
});
