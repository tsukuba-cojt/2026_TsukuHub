import { describe, expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

describe("教育学類の卒業要件", () => {
  test("2022年度版と監査済みの2023〜2026年度版を分離する", () => {
    expect(resolveRequirementId("education", "education", 2022)).toBeNull();
    expect(resolveRequirementId("education", "education", 2023)).toBe(
      "education-23",
    );
    expect(resolveRequirementId("education", "education", 2026)).toBe(
      "education-23",
    );
  });

  test("CB2を42単位取得しても科目番号末尾2が4単位未満なら専門要件を満たさない", () => {
    const report = checkGraduation(
      [course("CB20001", "末尾2ではない教育学専門科目", 42, "A", 2025)],
      "education-23",
    );

    expect(
      report.details.requirementItems.find(
        (item) => item.label === "教育学類の専門科目",
      ),
    ).toMatchObject({ earnedUnits: 42, isSatisfied: true });
    expect(
      report.details.requirementItems.find(
        (item) => item.label === "演習・探究科目（科目番号末尾2、内数）",
      ),
    ).toMatchObject({ earnedUnits: 0, minimumUnits: 4, isSatisfied: false });
    expect(
      report.categories.find((category) => category.category === "specialized"),
    ).toMatchObject({ earnedUnits: 42, isSatisfied: false });
  });

  test("末尾2を4単位含めれば内数条件を満たし、専門合計へ二重計上しない", () => {
    const report = checkGraduation(
      [
        course("CB20001", "その他の教育学専門科目", 38, "A", 2025),
        course("CB20012", "教育学演習", 4, "A", 2025),
      ],
      "education-23",
    );

    expect(
      report.details.requirementItems.find(
        (item) => item.label === "演習・探究科目（科目番号末尾2、内数）",
      ),
    ).toMatchObject({ earnedUnits: 4, isSatisfied: true });
    expect(
      report.categories.find((category) => category.category === "specialized"),
    ).toMatchObject({ earnedUnits: 42, isSatisfied: true });
  });

  test("CC・CE科目は関連科目ではなく専門科目の追加枠へ分類する", () => {
    const psychology = course("CC50001", "心理学類専門科目", 2, "A", 2025);
    const disability = course("CE50001", "障害科学類専門科目", 2, "A", 2025);
    const categories = collectCategoryCourses(
      checkGraduation([psychology, disability], "education-23"),
    );

    expect(categories.specialized).toEqual([psychology, disability]);
    expect(categories.related).toEqual([]);
  });
});
