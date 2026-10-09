import { describe, expect, it } from "vitest";
import { checkGraduation, gradRequirementData } from "./index";

describe("osaka medical faculty requirements", () => {
  it.each([
    ["osaka-medicine-22", 140],
    ["osaka-medicine-nursing-22", 144],
    ["osaka-medicine-radiology-22", 138],
    ["osaka-medicine-lab-22", 134],
    ["osaka-dentistry-22", 126],
    ["osaka-pharmacy-22", 134],
  ] as const)("%s specialized minimum is %i units", (id, specializedMin) => {
    const report = checkGraduation([], id);
    const specialized = report.categories.find((c) => c.category === "specialized");
    expect(specialized?.requiredUnits).toBe(specializedMin);
    expect(gradRequirementData[id].courses.compulsory).toContain("学問への扉");
  });
});
