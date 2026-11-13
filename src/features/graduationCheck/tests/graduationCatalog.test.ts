import { afterEach, describe, expect, test, vi } from "vitest";
import { readFileSync } from "node:fs";
import { attachCatalogEquivalencies } from "../graduationCatalog";
import { checkGraduationWithCatalog } from "../checkGraduation";
import { matchesSelectRequirement } from "../selectMatcher";
import type { Course, SelectRequirementTuple } from "../types";

afterEach(() => {
  vi.unstubAllGlobals();
});

const course: Course = {
  id: "BA20021",
  name: "関連科目候補",
  unit: 1,
  grade: "A",
  year: 2026,
};

describe("graduation catalog", () => {
  test.each([2023, 2024, 2025, 2026])("%i年度の固定データで授業方法3と6を実験・実習へ区別できる", async (year) => {
    const payload = JSON.parse(readFileSync(`public/data/graduation/tsukuba-${year}-cross-listings.json`, "utf8"));
    expect(payload.instruction_methods.EB16073).toBe("practicum");
    expect(payload.instruction_methods.EB19116).toBe("practicum");
    expect(payload.instruction_methods.EB61083).toBe("experiment");
    expect(payload.instruction_methods.EB71156).toBe("experiment");
    expect(payload.instruction_methods.EB10013).toBeUndefined();
    payload.university = `biology-catalog-${year}`;
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", fetchMock);
    const transcript: Course[] = ["EB16073", "EB61083", "EB71156", "EB50146"].map((id) => ({ ...course, id, year }));
    const report = await checkGraduationWithCatalog(transcript, "biology-24", payload.university);
    const counts = report.details.requirementItems.filter((item) => item.courseCount);
    expect(counts.map((item) => item.isSatisfied)).toEqual([true, true]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("未収録年度・番号では名称から補完せず確認不能にする", async () => {
    const unknownCourses: Course[] = ["EB16073", "EB61083", "EB71156", "EB50146"].map((id) => ({
      ...course, id, name: "実習と名前にあっても推測しない", year: 2022,
      catalogInstructionMethod: "practicum",
    }));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const report = await checkGraduationWithCatalog(unknownCourses, "biology-22", "biology-unsupported-year");
    expect(report.details.requirementItems.filter((item) => item.courseCount).map((item) => item.courseCount?.status))
      .toEqual(["unknown", "unknown"]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("同じ科目番号でも取得年度の属性を使い、nullや不正な属性値は確認不能にする", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string) => ({
      ok: true,
      json: async () => ({
        schema_version: "graduation-cross-listings-1.0.0", university: "biology-year-test",
        academic_year: url.includes("2025") ? 2025 : 2026, groups: [],
        instruction_method_policy: "biology-name-and-method-v1",
        instruction_methods: { EB16073: url.includes("2025") ? "practicum" : "experiment", EB61083: null, EB71156: "invalid" },
      }),
    })));
    const result = await attachCatalogEquivalencies([
      { ...course, id: "EB16073", year: 2025 }, { ...course, id: "EB16073", year: 2026 },
      { ...course, id: "EB61083" }, { ...course, id: "EB71156" }, { ...course, id: "EB99999" },
    ], "biology-year-test");
    expect(result.courses.map((item) => item.catalogInstructionMethod)).toEqual(["practicum", "experiment", undefined, undefined, undefined]);
  });

  test("開講年度の静的JSONから同一授業番号を補う", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        schema_version: "graduation-cross-listings-1.0.0",
        university: "catalog-test",
        academic_year: 2026,
        groups: [["BA20021", "GA10001"]],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      attachCatalogEquivalencies([course], "catalog-test"),
    ).resolves.toEqual({
      courses: [{ ...course, equivalentCourseIds: ["GA10001"] }],
      verification: {
        source: "transcript_academic_year",
        verifiedAcademicYears: [2026],
        unsupportedAcademicYears: [],
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/data/graduation/catalog-test-2026-cross-listings.json",
    );
  });

  test("対応外年度では静的JSONを取得しない", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      attachCatalogEquivalencies([{ ...course, year: 2022 }], "catalog-test"),
    ).resolves.toEqual({
      courses: [{ ...course, year: 2022 }],
      verification: {
        source: "transcript_academic_year",
        verifiedAcademicYears: [],
        unsupportedAcademicYears: [2022],
      },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("除外区分との同一授業を補集合の関連科目へ算入しない", () => {
    const relatedFallback: SelectRequirementTuple = [
      ["GA", "GB", "GC", "GE"],
      6,
      10,
      true,
      "その他の関連科目",
      3,
    ];

    expect(matchesSelectRequirement(course, relatedFallback)).toBe(true);
    expect(
      matchesSelectRequirement(
        { ...course, equivalentCourseIds: ["GA10001"] },
        relatedFallback,
      ),
    ).toBe(false);
  });

  test("卒業要件チェック本体が年度別の同一授業情報を反映する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          schema_version: "graduation-cross-listings-1.0.0",
          university: "integration-test",
          academic_year: 2026,
          groups: [["BA20021", "GA10001"]],
        }),
      }),
    );

    const report = await checkGraduationWithCatalog(
      [course],
      "coins-ss-26",
      "integration-test",
    );

    expect(report.details.uncountedCourses).toEqual([
      { ...course, equivalentCourseIds: ["GA10001"] },
    ]);
    expect(report.catalogVerification).toEqual({
      source: "transcript_academic_year",
      verifiedAcademicYears: [2026],
      unsupportedAcademicYears: [],
    });
    expect(
      report.details.selectResults.find(
        (result) => result.message === "その他の関連科目",
      )?.courses,
    ).toEqual([]);
  });
});
