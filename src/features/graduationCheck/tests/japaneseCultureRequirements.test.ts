import { describe, expect, test } from "vitest";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import type { RequirementId } from "../types";
import { course } from "./helpers";

const fixedSpecializedCourses = [
  course("AE10A01", "AE10A科目", 1, "A", 2025),
  course("AE10B01", "AE10B科目", 3, "A", 2025),
  course("AE10C01", "AE10C科目", 3, "A", 2025),
  course("AE10D01", "AE10D科目", 3, "A", 2025),
  course("AE10E01", "AE10E科目", 3, "A", 2025),
];

const getItem = (requirementId: RequirementId, label: string, courses = fixedSpecializedCourses) =>
  checkGraduation(courses, requirementId).details.requirementItems.find(
    (item) => item.label === label,
  );

describe("日本語・日本文化学類の卒業要件", () => {
  test("公式表の意味差に合わせて2023〜2025版と2026版を分ける", () => {
    expect(resolveRequirementId("japanese-culture", "japanese-culture", 2022)).toBeNull();
    expect(resolveRequirementId("japanese-culture", "japanese-culture", 2023)).toBe(
      "japanese-culture-23",
    );
    expect(resolveRequirementId("japanese-culture", "japanese-culture", 2025)).toBe(
      "japanese-culture-23",
    );
    expect(resolveRequirementId("japanese-culture", "japanese-culture", 2026)).toBe(
      "japanese-culture-26",
    );
  });

  test.each([
    ["japanese-culture-23", [26, 48, 16, 1, 6]],
    ["japanese-culture-26", [26, 43, 14, 1, 6]],
  ] satisfies [RequirementId, number[]][])(
    "%s は年度別公式表の区分下限を持つ",
    (requirementId, requiredUnits) => {
      expect(
        checkGraduation([], requirementId).categories.map(
          (category) => category.requiredUnits,
        ),
      ).toEqual(requiredUnits);
    },
  );

  test.each([
    ["japanese-culture-23", 35, 4],
    ["japanese-culture-26", 30, 2],
  ] satisfies [RequirementId, number, number][])(
    "%s はAE13・AE14とAE56の年度別下限を持つ",
    (requirementId, specializedMinimum, ae56Minimum) => {
      expect(
        getItem(
          requirementId,
          "日本語・日本文化専門科目（AE13・AE14）",
          [],
        ),
      ).toMatchObject({ minimumUnits: specializedMinimum });
      expect(getItem(requirementId, "AE56", [])).toMatchObject({
        minimumUnits: ae56Minimum,
        maximumUnits: ae56Minimum,
      });
    },
  );

  test("AE13だけで専門科目の単位数を満たしてもAE14内数条件は満たさない", () => {
    const report = checkGraduation(
      [course("AE13001", "AE13科目", 35, "A", 2025), ...fixedSpecializedCourses],
      "japanese-culture-23",
    );

    expect(
      report.details.requirementItems.find(
        (item) => item.label === "日本語・日本文化専門科目（AE13・AE14）",
      ),
    ).toMatchObject({ earnedUnits: 35, isSatisfied: true });
    expect(
      report.details.requirementItems.find(
        (item) => item.label === "AE14で始まる専門科目（内数）",
      ),
    ).toMatchObject({ earnedUnits: 0, minimumUnits: 1, isSatisfied: false });
    expect(
      report.categories.find((category) => category.category === "specialized"),
    ).toMatchObject({ earnedUnits: 48, isSatisfied: false });
  });

  test("AE14を1単位含めれば内数条件を満たし、親科目群へ二重計上しない", () => {
    const report = checkGraduation(
      [
        course("AE13001", "AE13科目", 34, "A", 2025),
        course("AE14001", "AE14科目", 1, "A", 2025),
        ...fixedSpecializedCourses,
      ],
      "japanese-culture-23",
    );

    expect(
      report.details.requirementItems.find(
        (item) => item.label === "AE14で始まる専門科目（内数）",
      ),
    ).toMatchObject({ earnedUnits: 1, isSatisfied: true });
    expect(
      report.categories.find((category) => category.category === "specialized"),
    ).toMatchObject({ earnedUnits: 48, isSatisfied: true });
  });
});
