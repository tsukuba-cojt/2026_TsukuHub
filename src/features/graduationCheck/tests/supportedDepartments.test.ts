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

  test("情報科学類は3主専攻と2022〜2026年度を選択できる", () => {
    const department = findDepartment("coins");
    expect(department?.majors.map((major) => major.key)).toEqual([
      "coins-ss",
      "coins-is",
      "coins-im",
    ]);

    const major = findMajor("coins", "coins-ss");
    expect(
      listAdmissionYearOptions(department, major).map((option) => option.value)
    ).toEqual([2022, 2023, 2024, 2025, 2026]);
    expect(resolveRequirementId("coins", "coins-ss", 2025)).toBe(
      "coins-ss-22"
    );
    expect(resolveRequirementId("coins", "coins-ss", 2026)).toBe(
      "coins-ss-26"
    );
  });

  test("工学システム学類は2主専攻と2022〜2026年度を選択できる", () => {
    const department = findDepartment("esys");
    expect(department?.majors.map((major) => major.key)).toEqual([
      "esys-ies",
      "esys-eme",
    ]);

    const major = findMajor("esys", "esys-ies");
    expect(
      listAdmissionYearOptions(department, major).map((option) => option.value)
    ).toEqual([2022, 2023, 2024, 2025, 2026]);
    expect(resolveRequirementId("esys", "esys-ies", 2022)).toBe(
      "esys-ies-22"
    );
    expect(resolveRequirementId("esys", "esys-ies", 2026)).toBe(
      "esys-ies-22"
    );
  });

  test("数学類は2022〜2026年度を選択できる", () => {
    const department = findDepartment("math");
    const major = findMajor("math", "math");
    expect(
      listAdmissionYearOptions(department, major).map((option) => option.value)
    ).toEqual([2022, 2023, 2024, 2025, 2026]);
    expect(resolveRequirementId("math", "math", 2026)).toBe("math-22");
  });

  test("物理学類は2025年度の要件変更を境に正しいデータへ解決する", () => {
    const department = findDepartment("physics");
    const major = findMajor("physics", "physics");
    expect(
      listAdmissionYearOptions(department, major).map((option) => option.value)
    ).toEqual([2022, 2023, 2024, 2025, 2026]);
    expect(resolveRequirementId("physics", "physics", 2024)).toBe(
      "physics-22"
    );
    expect(resolveRequirementId("physics", "physics", 2025)).toBe(
      "physics-25"
    );
  });

  test("化学類は2023年度・2025年度の要件変更を境に解決する", () => {
    const department = findDepartment("chem");
    const major = findMajor("chem", "chem");
    expect(
      listAdmissionYearOptions(department, major).map((option) => option.value)
    ).toEqual([2022, 2023, 2024, 2025, 2026]);
    expect(resolveRequirementId("chem", "chem", 2022)).toBe("chem-22");
    expect(resolveRequirementId("chem", "chem", 2024)).toBe("chem-23");
    expect(resolveRequirementId("chem", "chem", 2025)).toBe("chem-25");
  });

  test("応用理工学類は4主専攻と2022〜2026年度を選択できる", () => {
    const department = findDepartment("applied-science");
    expect(department?.majors.map((major) => major.key)).toEqual([
      "applied-physics",
      "applied-electron",
      "applied-materials",
      "applied-molecule",
    ]);

    const major = findMajor("applied-science", "applied-physics");
    expect(
      listAdmissionYearOptions(department, major).map((option) => option.value)
    ).toEqual([2022, 2023, 2024, 2025, 2026]);
    expect(
      resolveRequirementId("applied-science", "applied-physics", 2023)
    ).toBe("applied-physics-22");
    expect(
      resolveRequirementId("applied-science", "applied-physics", 2024)
    ).toBe("applied-physics-24");
  });

  test("生命環境学群の3学類は年度差を含めて選択できる", () => {
    expect(resolveRequirementId("biology", "biology", 2026)).toBe(
      "biology-22"
    );
    expect(
      resolveRequirementId("bioresources", "bioresources", 2023)
    ).toBe("bioresources-22");
    expect(
      resolveRequirementId("bioresources", "bioresources", 2024)
    ).toBe("bioresources-24");
    expect(resolveRequirementId("earth", "earth-environment", 2025)).toBe(
      "earth-environment-24"
    );
    expect(resolveRequirementId("earth", "earth-environment", 2026)).toBe(
      "earth-environment-26"
    );

    const earth = findDepartment("earth");
    expect(earth?.majors.map((major) => major.key)).toEqual([
      "earth-environment",
      "earth-evolution",
      "earth-interdisciplinary",
    ]);
  });

  test("社会工学類は3主専攻と2022〜2026年度を選択できる", () => {
    const department = findDepartment("policy");
    expect(department?.majors.map((major) => major.key)).toEqual([
      "policy-economics",
      "policy-engineering",
      "policy-urban",
    ]);
    const major = findMajor("policy", "policy-urban");
    expect(
      listAdmissionYearOptions(department, major).map((option) => option.value)
    ).toEqual([2022, 2023, 2024, 2025, 2026]);
  });
});
