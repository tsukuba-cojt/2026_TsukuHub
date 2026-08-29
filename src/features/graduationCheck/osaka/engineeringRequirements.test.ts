import { describe, expect, it } from "vitest";
import { checkGraduation, gradRequirementData } from "./index";

describe("osaka engineering requirements", () => {
  const engineeringIds = [
    "osaka-engineering-applied-22",
    "osaka-engineering-einfo-22",
    "osaka-engineering-applied-tech-22",
    "osaka-engineering-env-22",
    "osaka-engineering-earth-22",
  ] as const;

  it.each(engineeringIds)("%s requires graduation research and enforces minimums", (id) => {
    const report = checkGraduation([], id);
    expect(gradRequirementData[id].courses.compulsory).toContain("卒業研究");
    expect(gradRequirementData[id].courses.enforceSelectMinimums).toBe(true);
    expect(report.summary.requiredUnits).toBeGreaterThan(100);
  });
});

describe("osaka basic engineering requirements", () => {
  const fengIds = [
    "osaka-feng-electron-22",
    "osaka-feng-chemistry-22",
    "osaka-feng-systems-22",
    "osaka-feng-info-22",
  ] as const;

  it.each(fengIds)("%s requires graduation research", (id) => {
    expect(gradRequirementData[id].courses.compulsory).toContain("卒業研究");
    expect(gradRequirementData[id].courses.enforceSelectMinimums).toBe(true);
  });
});
