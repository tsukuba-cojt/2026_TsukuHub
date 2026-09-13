import { describe, expect, it } from "vitest";
import { checkGraduation, gradRequirementData } from "./index";
import { getCommonEducationSpec } from "./data/requirements/commonEducation";

describe("osaka science requirements", () => {
  const scienceIds = [
    ["osaka-science-math-22", "science-math"],
    ["osaka-science-physics-22", "science-physics"],
    ["osaka-science-chemistry-22", "science-chemistry"],
    ["osaka-science-biology-22", "science-biology"],
  ] as const;

  it.each(scienceIds)("%s requires foundation and specialized minimums", (id, specKey) => {
    const spec = getCommonEducationSpec(specKey);
    const report = checkGraduation([], id);
    const foundation = report.categories.find(
      (c) => c.category === "specializedFoundation"
    );
    const specialized = report.categories.find((c) => c.category === "specialized");

    expect(foundation?.requiredUnits).toBe(spec.foundation);
    expect(specialized?.requiredUnits).toBe(spec.specialized);
    expect(gradRequirementData[id].courses.enforceSelectMinimums).toBe(true);
  });

  it("osaka-science-math-22 includes named foundation compulsory courses", () => {
    const compulsory = gradRequirementData["osaka-science-math-22"].courses.compulsory;
    expect(compulsory).toContain("解析学1");
    expect(compulsory).toContain("卒業研究");
  });
});
