import { afterEach, describe, expect, test, vi } from "vitest";
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
