import { describe, expect, test } from "vitest";
import {
  findDepartment,
  findMajor,
  listAdmissionYearOptions,
  resolveRequirementId,
} from "../data/supportedDepartments";

describe("supportedDepartments admission year options", () => {
  test("複数年度を同じ要件データで扱う場合も年度ごとに選べる", () => {
    const department = findDepartment("mast");
    const major = findMajor("mast", "mast");
    const options = listAdmissionYearOptions(department, major);

    expect(options.map((option) => option.value)).toEqual([
      2021,
      2022,
      2023,
      2024,
      2025,
    ]);
    expect(options.map((option) => option.label)).toContain("2023年度");
    expect(options.map((option) => option.label)).not.toContain("2022〜2024年度");
  });

  test("2022〜2024の各年度は同じ要件データに解決される", () => {
    expect(resolveRequirementId("mast", "mast", 2022)).toBe("mast-22");
    expect(resolveRequirementId("mast", "mast", 2023)).toBe("mast-22");
    expect(resolveRequirementId("mast", "mast", 2024)).toBe("mast-22");
  });
});
