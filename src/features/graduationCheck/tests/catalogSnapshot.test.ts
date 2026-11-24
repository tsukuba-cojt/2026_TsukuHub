import { describe, expect, test } from "vitest";
import {
  buildCrossListingGroups,
  extractCrossListedCourseCodes,
  findCrossListedExclusions,
  supportedCatalogAcademicYears,
  tsukuba2023CatalogSnapshot,
  tsukuba2024CatalogSnapshot,
  tsukuba2025CatalogSnapshot,
  tsukuba2026CatalogSnapshot,
} from "../curriculum/catalog";
import { coinsSoftwareScience2023Pilot } from "../curriculum/pilots/coinsSoftwareScience2023";
import { coinsSoftwareScience2024Pilot } from "../curriculum/pilots/coinsSoftwareScience2024";
import { coinsSoftwareScience2025Pilot } from "../curriculum/pilots/coinsSoftwareScience2025";
import { coinsSoftwareScience2026Pilot } from "../curriculum/pilots/coinsSoftwareScience2026";

const excludedPrefixes = [
  "GA",
  "GB",
  "GC",
  "GE",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "9",
];
const isExcludedCategory = (courseCode: string) =>
  excludedPrefixes.some((prefix) => courseCode.startsWith(prefix));

describe("KDB course catalog snapshot", () => {
  test("備考から同一授業の科目番号だけを抽出する", () => {
    expect(
      extractCrossListedCourseCodes(
        "01LA029",
        "01LA033, 0ADL040と同一。\n単に同一の内容を扱う。"
      )
    ).toEqual(["01LA033", "0ADL040"]);
    expect(
      extractCrossListedCourseCodes(
        "01KA439",
        "01KA439と同一。0ADM127と同一。"
      )
    ).toEqual(["0ADM127"]);
  });

  test("同一授業リンクの推移関係をグループ化する", () => {
    expect(
      buildCrossListingGroups([
        { courseCode: "AAAA001", sameCourseCode: "BBBB001" },
        { courseCode: "BBBB001", sameCourseCode: "CCCC001" },
      ])
    ).toEqual([["AAAA001", "BBBB001", "CCCC001"]]);
  });

  test("2023〜2026年度固定CSVの出典と抽出件数を保持する", () => {
    expect(supportedCatalogAcademicYears).toEqual([2023, 2024, 2025, 2026]);
    const snapshots = [
      tsukuba2023CatalogSnapshot,
      tsukuba2024CatalogSnapshot,
      tsukuba2025CatalogSnapshot,
      tsukuba2026CatalogSnapshot,
    ];
    expect(
      snapshots.map((snapshot) => ({
        year: snapshot.academicYear,
        date: snapshot.sourceDocument.snapshotDate,
        rows: snapshot.sourceRowCount,
        courses: snapshot.courseCount,
        skipped: snapshot.skippedRowCount,
        warnings: snapshot.parseWarningCount,
        links: snapshot.crossListingLinks.length,
      }))
    ).toEqual([
      {
        year: 2023,
        date: "2024-03-31",
        rows: 16_010,
        courses: 15_943,
        skipped: 67,
        warnings: 6,
        links: 2_774,
      },
      {
        year: 2024,
        date: "2025-03-31",
        rows: 14_822,
        courses: 14_822,
        skipped: 0,
        warnings: 6,
        links: 2_201,
      },
      {
        year: 2025,
        date: "2025-10-31",
        rows: 13_888,
        courses: 13_888,
        skipped: 0,
        warnings: 5,
        links: 1_500,
      },
      {
        year: 2026,
        date: "2026-10-16",
        rows: 13_496,
        courses: 13_496,
        skipped: 0,
        warnings: 0,
        links: 1_470,
      },
    ]);
    expect(
      snapshots.map((snapshot) => snapshot.sourceDocument.repositoryCommit)
    ).toEqual(Array(4).fill("b3d77356c21bad19dd3578f316b9fcec7f7f47a7"));
    expect(coinsSoftwareScience2026Pilot.applicability.admissionYearTo).toBe(
      2026
    );
  });

  test("情報科学類の関連科目から二重開設科目を除外する", () => {
    const exclusions = findCrossListedExclusions(
      tsukuba2026CatalogSnapshot.crossListingLinks,
      (courseCode) => !isExcludedCategory(courseCode),
      isExcludedCategory
    );
    expect(exclusions).toEqual([
      "BA20021",
      "BC12601",
      "BC12621",
      "BC12624",
      "BC12651",
      "BC12671",
      "BC12681",
      "BC12871",
      "BC12881",
      "BC12883",
      "BC12893",
      "YBJ5412",
      "YBJ5422",
      "YBN13A2",
    ]);

    const related = coinsSoftwareScience2026Pilot.requirements.find(
      (requirement) => requirement.id === "related-other-courses"
    );
    expect(related?.reviewStatus).toBe("approved");
    expect(
      coinsSoftwareScience2026Pilot.additionalConstraints.some(
        (constraint) => constraint.id === "cross-listed-course-review"
      )
    ).toBe(false);
  });

  test("2023年度の旧科目番号体系でも関連科目の二重開設を固定する", () => {
    const oldExcludedPrefixes = [
      "E",
      "F",
      "G",
      "H",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "9",
    ];
    const isOldExcludedCategory = (courseCode: string) =>
      oldExcludedPrefixes.some((prefix) => courseCode.startsWith(prefix));
    const exclusions = findCrossListedExclusions(
      tsukuba2023CatalogSnapshot.crossListingLinks,
      (courseCode) => !isOldExcludedCategory(courseCode),
      isOldExcludedCategory
    );

    expect(exclusions).toEqual([
      "01BC701",
      "01BC702",
      "01BC703",
      "01BG012",
      "01BG013",
      "01BG014",
      "01BG019",
      "01BG020",
      "01BG021",
      "0AJG041",
      "0AJG042",
      "0AJG043",
      "0AJG061",
      "0AJG062",
      "0AJG063",
      "BA20021",
      "BB11531",
      "BB41281",
      "BB41341",
      "BB41441",
      "BB41521",
      "BB41601",
      "BC11411",
      "BC11431",
      "BC12521",
      "BC12541",
      "BC12551",
      "BC12571",
      "BC12601",
      "BC12621",
      "BC12624",
      "BC12631",
      "BC12651",
      "BC12671",
      "BC12681",
      "BC12701",
      "BC12712",
      "BC12721",
      "BC12751",
      "BC12831",
      "BC12871",
      "BC12881",
      "BC12883",
      "BC12893",
      "BE22271",
      "YBJ5412",
      "YBL5302",
      "YBN1372",
    ]);

    expect(
      coinsSoftwareScience2023Pilot.additionalConstraints.some(
        (constraint) => constraint.id === "cross-listed-course-review"
      )
    ).toBe(false);
  });

  test("2024年度カタログで関連科目の二重開設を年度別に固定する", () => {
    const oldExcludedPrefixes = [
      "E",
      "F",
      "G",
      "H",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "9",
    ];
    const isOldExcludedCategory = (courseCode: string) =>
      oldExcludedPrefixes.some((prefix) => courseCode.startsWith(prefix));
    const exclusions = findCrossListedExclusions(
      tsukuba2024CatalogSnapshot.crossListingLinks,
      (courseCode) => !isOldExcludedCategory(courseCode),
      isOldExcludedCategory
    );

    expect(exclusions).toEqual([
      "01BC701",
      "01BC702",
      "01BC703",
      "0AJG041",
      "0AJG042",
      "0AJG043",
      "0AJG061",
      "0AJG062",
      "0AJG063",
      "BA20021",
      "BB11531",
      "BB41281",
      "BB41341",
      "BB41441",
      "BB41521",
      "BB41601",
      "BC11411",
      "BC11431",
      "BC12521",
      "BC12541",
      "BC12551",
      "BC12571",
      "BC12601",
      "BC12621",
      "BC12624",
      "BC12631",
      "BC12651",
      "BC12671",
      "BC12681",
      "BC12701",
      "BC12712",
      "BC12721",
      "BC12751",
      "BC12831",
      "BC12871",
      "BC12881",
      "BC12883",
      "BC12893",
      "BE22271",
      "YBJ5412",
      "YBL5302",
      "YBN1372",
    ]);
    expect(
      coinsSoftwareScience2024Pilot.additionalConstraints.some(
        (constraint) => constraint.id === "cross-listed-course-review"
      )
    ).toBe(false);
  });

  test("2025年度カタログで関連科目の二重開設を年度別に固定する", () => {
    const oldExcludedPrefixes = [
      "E",
      "F",
      "G",
      "H",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "9",
    ];
    const isOldExcludedCategory = (courseCode: string) =>
      oldExcludedPrefixes.some((prefix) => courseCode.startsWith(prefix));
    const exclusions = findCrossListedExclusions(
      tsukuba2025CatalogSnapshot.crossListingLinks,
      (courseCode) => !isOldExcludedCategory(courseCode),
      isOldExcludedCategory
    );

    expect(exclusions).toEqual([
      "0AJG041",
      "0AJG042",
      "0AJG043",
      "0AJG061",
      "0AJG062",
      "0AJG063",
      "BA20021",
      "BB11531",
      "BB41281",
      "BB41341",
      "BB41441",
      "BB41521",
      "BB41601",
      "BC11411",
      "BC11431",
      "BC12521",
      "BC12541",
      "BC12551",
      "BC12571",
      "BC12601",
      "BC12621",
      "BC12624",
      "BC12631",
      "BC12651",
      "BC12671",
      "BC12681",
      "BC12701",
      "BC12712",
      "BC12721",
      "BC12751",
      "BC12831",
      "BC12871",
      "BC12881",
      "BC12883",
      "BC12893",
      "BE22271",
      "YBJ5412",
      "YBJ5422",
      "YBL5302",
      "YBN1372",
    ]);
    expect(
      coinsSoftwareScience2025Pilot.additionalConstraints.some(
        (constraint) => constraint.id === "cross-listed-course-review"
      )
    ).toBe(false);
  });
});
