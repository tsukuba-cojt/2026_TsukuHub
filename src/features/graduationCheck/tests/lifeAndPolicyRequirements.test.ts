import { describe, expect, test } from "vitest";
import { checkGraduation } from "../checkGraduation";
import type { RequirementId } from "../types";

type RequirementCase = [RequirementId, number[]];

describe("生命環境学群の卒業要件", () => {
  test.each([
    ["biology-22", [40, 40, 0, 1, 21]],
    ["bioresources-22", [30, 53, 17, 1, 10]],
    ["bioresources-24", [29, 53, 18, 1, 10]],
    ["bioresources-interdisciplinary-22", [43, 46, 10, 1, 13]],
    ["bioresources-interdisciplinary-24", [28, 45, 15, 1, 13]],
    ["earth-environment-22", [29, 45, 14, 1, 13]],
    ["earth-environment-24", [28, 45, 15, 1, 13]],
    ["earth-environment-26", [32, 41, 16, 1, 6]],
    ["earth-evolution-22", [30, 40, 15, 1, 13]],
    ["earth-evolution-24", [33, 40, 16, 1, 6]],
    ["earth-interdisciplinary-22", [43, 47, 10, 1, 13]],
    ["earth-interdisciplinary-24", [41.5, 47, 11.5, 1, 9]],
  ] satisfies RequirementCase[])(
    "%s は公式表の区分別最低単位と合計124単位を持つ",
    (requirementId, minimums) => {
      const report = checkGraduation([], requirementId);

      expect(report.categories.map((category) => category.requiredUnits)).toEqual(
        minimums
      );
      expect(report.summary.requiredUnits).toBe(124);
    }
  );
});

describe("社会工学類の卒業要件", () => {
  test.each([
    ["policy-economics-22", [29, 52, 11, 1, 6]],
    ["policy-engineering-22", [31, 50, 11, 1, 6]],
    ["policy-urban-22", [36, 45, 11, 1, 6]],
  ] satisfies RequirementCase[])(
    "%s は公式表の区分別最低単位と合計124単位を持つ",
    (requirementId, minimums) => {
      const report = checkGraduation([], requirementId);

      expect(report.categories.map((category) => category.requiredUnits)).toEqual(
        minimums
      );
      expect(report.summary.requiredUnits).toBe(124);
    }
  );
});
