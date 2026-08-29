import { describe, expect, it } from "vitest";
import { checkGraduation, gradRequirementData } from "./index";

describe("osaka humanities and social faculty requirements", () => {
  it.each([
    ["osaka-letters-22", 144],
    ["osaka-human-sciences-22", 143],
    ["osaka-foreign-lang-22", 134],
    ["osaka-law-22", 122],
    ["osaka-economics-22", 128],
  ] as const)("%s requires %i total units", (id, total) => {
    const report = checkGraduation([], id);
    expect(report.summary.requiredUnits).toBe(total);
    expect(gradRequirementData[id].courses.compulsory).toContain("学問への扉");
  });
});
