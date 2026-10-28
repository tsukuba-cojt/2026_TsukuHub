import { describe, expect, test } from "vitest";
import {
  assessCurriculumCompilation,
  validateNormalizedCurriculum,
  type NormalizedCurriculum,
} from "../curriculum";
import { coinsSoftwareScience2023Pilot } from "../curriculum/pilots/coinsSoftwareScience2023";
import { coinsSoftwareScience2024Pilot } from "../curriculum/pilots/coinsSoftwareScience2024";
import { coinsSoftwareScience2025Pilot } from "../curriculum/pilots/coinsSoftwareScience2025";
import { coinsSoftwareScience2026Pilot } from "../curriculum/pilots/coinsSoftwareScience2026";

const validCurriculum = (): NormalizedCurriculum => ({
  schemaVersion: "normalized-curriculum-1.0.0",
  curriculumId: "tsukuba-test-2025",
  sourceDocuments: [
    {
      documentId: "regulations-5-2",
      fileName: "5-2.pdf",
      kind: "official_graduation_requirements",
      editionYear: 2025,
      pageCount: 127,
    },
  ],
  organization: {
    universityId: "tsukuba",
    schoolId: "test-school",
    schoolName: "テスト学群",
    collegeId: "test-college",
    collegeName: "テスト学類",
    programId: null,
    programName: null,
  },
  applicability: { admissionYearFrom: 2025, admissionYearTo: 2026 },
  totalCredits: { minimum: 124 },
  requirements: [
    {
      id: "specialized-elective",
      label: "専門選択科目",
      placement: { area: "specialized", kind: "elective" },
      fulfillment: {
        type: "credits_from",
        matcher: { type: "code_prefix", values: ["AA"] },
        credits: { minimum: 20, maximum: 30 },
      },
      sourceRefs: [{ documentId: "regulations-5-2", pdfPages: [10] }],
      reviewStatus: "approved",
    },
  ],
  aggregateConstraints: [],
  equivalencies: [],
  additionalConstraints: [],
  sourceCoverage: [
    {
      id: "specialized-elective-cell",
      label: "専門選択科目の単位欄",
      kind: "table_cell",
      sourceRef: { documentId: "regulations-5-2", pdfPages: [10] },
      disposition: {
        type: "modeled",
        targetIds: ["specialized-elective"],
      },
    },
  ],
  allocationPolicy: {
    allowDoubleCounting: false,
    onMultipleMatch: "ambiguous",
    onNoMatch: "unclassified",
  },
  notes: [],
  review: { status: "approved" },
});

describe("validateNormalizedCurriculum", () => {
  test("2023年度情報科学類パイロットを年度固有の出典と規則で保持する", () => {
    const issues = validateNormalizedCurriculum(coinsSoftwareScience2023Pilot);
    expect(issues.filter((issue) => issue.severity === "error")).toEqual([]);
    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "manual-review-blocks-compilation",
        "source-coverage-blocks-compilation",
        "unapproved-curriculum",
      ])
    );
    expect(
      assessCurriculumCompilation(coinsSoftwareScience2023Pilot).canCompile
    ).toBe(false);

    expect(coinsSoftwareScience2023Pilot.applicability).toEqual({
      admissionYearFrom: 2023,
      admissionYearTo: 2023,
      effectiveFrom: "2023-04-01",
    });
    expect(
      coinsSoftwareScience2023Pilot.sourceDocuments.map(
        (document) => document.documentId
      )
    ).toEqual([
      "tsukuba-graduation-requirements-2023",
      "tsukuba-kdb-course-catalog-2023-20240331",
    ]);
    expect(JSON.stringify(coinsSoftwareScience2023Pilot)).not.toContain(
      "tsukuba-graduation-requirements-2026"
    );

    const related = coinsSoftwareScience2023Pilot.requirements.find(
      (requirement) => requirement.id === "related-other-courses"
    );
    expect(related).toEqual(
      expect.objectContaining({
        reviewStatus: "approved",
        sourceRefs: expect.arrayContaining([
          expect.objectContaining({
            documentId: "tsukuba-graduation-requirements-2023",
            pdfPages: [83],
          }),
          expect.objectContaining({ note: "注7", pdfPages: [85] }),
        ]),
        fulfillment: expect.objectContaining({
          type: "credits_from",
          matcher: expect.objectContaining({
            type: "external_designation",
            resolution: expect.objectContaining({
              method: "catalog_snapshot",
              catalogDocumentId: "tsukuba-kdb-course-catalog-2023-20240331",
            }),
          }),
        }),
      })
    );
    expect(
      coinsSoftwareScience2023Pilot.equivalencies.map(
        (equivalence) => equivalence.id
      )
    ).toEqual([
      "linear-algebra-transition",
      "calculus-transition",
    ]);
  });

  test("2024年度情報科学類パイロットを年度固有の出典と規則で保持する", () => {
    const issues = validateNormalizedCurriculum(coinsSoftwareScience2024Pilot);
    expect(issues.filter((issue) => issue.severity === "error")).toEqual([]);
    expect(
      assessCurriculumCompilation(coinsSoftwareScience2024Pilot).canCompile
    ).toBe(false);
    expect(coinsSoftwareScience2024Pilot.applicability).toEqual({
      admissionYearFrom: 2024,
      admissionYearTo: 2024,
      effectiveFrom: "2024-04-01",
    });
    expect(
      coinsSoftwareScience2024Pilot.sourceDocuments.map(
        (document) => document.documentId
      )
    ).toEqual([
      "tsukuba-graduation-requirements-2024",
      "tsukuba-kdb-course-catalog-2024-20250331",
    ]);
    expect(JSON.stringify(coinsSoftwareScience2024Pilot)).not.toContain(
      "tsukuba-graduation-requirements-2023"
    );

    const related = coinsSoftwareScience2024Pilot.requirements.find(
      (requirement) => requirement.id === "related-other-courses"
    );
    expect(related).toEqual(
      expect.objectContaining({
        reviewStatus: "approved",
        sourceRefs: expect.arrayContaining([
          expect.objectContaining({ pdfPages: [84] }),
          expect.objectContaining({ note: "注7", pdfPages: [86] }),
        ]),
        fulfillment: expect.objectContaining({
          matcher: expect.objectContaining({
            designationId: "coins-related-other-courses-2024",
            resolution: expect.objectContaining({
              method: "catalog_snapshot",
              catalogDocumentId: "tsukuba-kdb-course-catalog-2024-20250331",
            }),
          }),
        }),
      })
    );
    expect(
      coinsSoftwareScience2024Pilot.sourceCoverage
        .find((item) => item.id === "coverage-transition-clause")
        ?.sourceRef
    ).toEqual(
      expect.objectContaining({
        documentId: "tsukuba-graduation-requirements-2024",
        pdfPages: [83],
        printedPageLabels: ["246"],
      })
    );
  });

  test("2025年度情報科学類パイロットを年度固有の出典と規則で保持する", () => {
    const issues = validateNormalizedCurriculum(coinsSoftwareScience2025Pilot);
    expect(issues.filter((issue) => issue.severity === "error")).toEqual([]);
    expect(
      assessCurriculumCompilation(coinsSoftwareScience2025Pilot).canCompile
    ).toBe(false);
    expect(coinsSoftwareScience2025Pilot.applicability).toEqual({
      admissionYearFrom: 2025,
      admissionYearTo: 2025,
      effectiveFrom: "2025-04-01",
    });
    expect(
      coinsSoftwareScience2025Pilot.sourceDocuments.map(
        (document) => document.documentId
      )
    ).toEqual([
      "tsukuba-graduation-requirements-2025",
      "tsukuba-kdb-course-catalog-2025-20251031",
    ]);
    expect(JSON.stringify(coinsSoftwareScience2025Pilot)).not.toContain(
      "tsukuba-graduation-requirements-2024"
    );

    const related = coinsSoftwareScience2025Pilot.requirements.find(
      (requirement) => requirement.id === "related-other-courses"
    );
    expect(related).toEqual(
      expect.objectContaining({
        reviewStatus: "approved",
        sourceRefs: expect.arrayContaining([
          expect.objectContaining({ pdfPages: [85] }),
          expect.objectContaining({ note: "注7", pdfPages: [87] }),
        ]),
        fulfillment: expect.objectContaining({
          matcher: expect.objectContaining({
            designationId: "coins-related-other-courses-2025",
            resolution: expect.objectContaining({
              method: "catalog_snapshot",
              catalogDocumentId: "tsukuba-kdb-course-catalog-2025-20251031",
            }),
          }),
        }),
      })
    );
    expect(
      coinsSoftwareScience2025Pilot.sourceCoverage
        .find((item) => item.id === "coverage-transition-clause")
        ?.sourceRef
    ).toEqual(
      expect.objectContaining({
        documentId: "tsukuba-graduation-requirements-2025",
        pdfPages: [84],
        printedPageLabels: ["250"],
      })
    );
  });

  test("2026年度情報科学類パイロットは構造エラーなく未解決条件を残す", () => {
    const issues = validateNormalizedCurriculum(coinsSoftwareScience2026Pilot);
    expect(issues.filter((issue) => issue.severity === "error")).toEqual([]);
    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "manual-review-blocks-compilation",
        "source-coverage-blocks-compilation",
        "unapproved-curriculum",
      ])
    );
    expect(
      assessCurriculumCompilation(coinsSoftwareScience2026Pilot).canCompile
    ).toBe(false);
  });

  test("承認済みの正規化データを受理する", () => {
    expect(validateNormalizedCurriculum(validCurriculum())).toEqual([]);
    expect(assessCurriculumCompilation(validCurriculum()).canCompile).toBe(true);
  });

  test("科目数・授業形態・学期・学生属性による要件を表現できる", () => {
    const curriculum = validCurriculum();
    curriculum.schemaVersion = "normalized-curriculum-1.1.0";
    curriculum.studentContextDimensions = [
      {
        id: "field",
        label: "分野",
        required: true,
        options: [
          { value: "biology", label: "生物学分野" },
          { value: "diversity", label: "多様性分野" },
        ],
      },
    ];
    curriculum.evaluationPolicy = {
      onMissingCatalogAttribute: "unknown",
      onMissingStudentContext: "unknown",
    };
    curriculum.requirements[0].studentScope = {
      dimensionId: "field",
      values: ["biology"],
    };
    curriculum.requirements[0].fulfillment = {
      type: "all_of",
      requirements: [
        {
          type: "course_count_from",
          matcher: {
            type: "instruction_method",
            values: ["experiment", "practicum"],
            resolution: {
              method: "manual",
              matcher: { type: "code_prefix", values: ["EB"] },
            },
          },
          count: { minimum: 4 },
        },
        {
          type: "course_count_from",
          matcher: {
            type: "all_of",
            conditions: [
              {
                type: "term",
                values: ["spring-ab"],
                resolution: {
                  method: "manual",
                  matcher: { type: "course_code", values: ["EB00001"] },
                },
              },
              { type: "code_prefix", values: ["EB"] },
            ],
          },
          count: { minimum: 1 },
        },
      ],
    };

    expect(validateNormalizedCurriculum(curriculum)).toEqual([]);
  });

  test("不正な科目数と学生属性参照を拒否する", () => {
    const curriculum = validCurriculum();
    curriculum.schemaVersion = "normalized-curriculum-1.1.0";
    curriculum.requirements[0].studentScope = {
      dimensionId: "missing-field",
      values: ["unknown"],
    };
    curriculum.requirements[0].fulfillment = {
      type: "course_count_from",
      matcher: { type: "code_prefix", values: ["AA"] },
      count: { minimum: 2.5 },
    };

    const codes = validateNormalizedCurriculum(curriculum).map(
      (issue) => issue.code,
    );
    expect(codes).toContain("invalid-count-value");
    expect(codes).toContain("unknown-student-context-dimension");
  });

  test("存在しないカタログで解決したmatcherを拒否する", () => {
    const curriculum = validCurriculum();
    curriculum.requirements[0].fulfillment = {
      type: "credits_from",
      matcher: {
        type: "external_designation",
        designationId: "test-designation",
        resolution: {
          method: "catalog_snapshot",
          catalogDocumentId: "missing-catalog",
          matcher: { type: "course_code", values: ["AAAA001"] },
        },
      },
      credits: { minimum: 1 },
    };
    expect(validateNormalizedCurriculum(curriculum)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "unknown-catalog-resolution-source" }),
      ])
    );
  });

  test("否定条件だけで関連科目を確定する規則を拒否する", () => {
    const curriculum = validCurriculum();
    curriculum.requirements[0].fulfillment = {
      type: "credits_from",
      matcher: {
        type: "not",
        condition: { type: "code_prefix", values: ["AA"] },
      },
      credits: { minimum: 6 },
    };
    expect(validateNormalizedCurriculum(curriculum)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "negative-only-matcher" }),
      ])
    );
  });

  test("履修科目全体を母集合にした明示的な補集合は許可する", () => {
    const curriculum = validCurriculum();
    curriculum.requirements[0].fulfillment = {
      type: "credits_from",
      matcher: {
        type: "all_of",
        conditions: [
          { type: "all_courses" },
          {
            type: "not",
            condition: { type: "code_prefix", values: ["AA"] },
          },
        ],
      },
      credits: { minimum: 6 },
    };
    expect(validateNormalizedCurriculum(curriculum)).toEqual([]);
  });

  test("肯定条件に付随する除外条件は許可する", () => {
    const curriculum = validCurriculum();
    curriculum.requirements[0].fulfillment = {
      type: "credits_from",
      matcher: {
        type: "all_of",
        conditions: [
          { type: "code_prefix", values: ["AA"] },
          {
            type: "not",
            condition: { type: "course_code", values: ["AA00001"] },
          },
        ],
      },
      credits: { minimum: 6 },
    };
    expect(validateNormalizedCurriculum(curriculum)).toEqual([]);
  });

  test("成績CSVにない組織情報は実行可能な条件への解決を要求する", () => {
    const curriculum = validCurriculum();
    curriculum.requirements[0].fulfillment = {
      type: "credits_from",
      matcher: {
        type: "offering_organization",
        operator: "inside",
        collegeIds: ["test-college"],
      },
      credits: { minimum: 6 },
    };
    expect(validateNormalizedCurriculum(curriculum)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "matcher-needs-transcript-resolution" }),
      ])
    );

    if (curriculum.requirements[0].fulfillment.type !== "credits_from") {
      throw new Error("test setup failure");
    }
    const matcher = curriculum.requirements[0].fulfillment.matcher;
    if (matcher.type !== "offering_organization") {
      throw new Error("test setup failure");
    }
    matcher.resolution = {
      method: "manual",
      matcher: { type: "code_prefix", values: ["AA"] },
    };
    expect(validateNormalizedCurriculum(curriculum)).toEqual([]);
  });

  test("矛盾した単位範囲と存在しない合算対象を検出する", () => {
    const curriculum = validCurriculum();
    curriculum.requirements[0].fulfillment = {
      type: "credits_from",
      matcher: { type: "code_prefix", values: ["AA"] },
      credits: { minimum: 10, maximum: 5 },
    };
    curriculum.aggregateConstraints.push({
      id: "combined",
      label: "合算要件",
      targetRequirementIds: ["missing"],
      credits: { exact: 10, minimum: 10 },
      sourceRefs: [{ documentId: "regulations-5-2", pdfPages: [10] }],
    });
    const codes = validateNormalizedCurriculum(curriculum).map(
      (issue) => issue.code
    );
    expect(codes).toContain("reversed-credit-range");
    expect(codes).toContain("unknown-requirement-reference");
    expect(codes).toContain("conflicting-credit-constraint");
  });

  test("出典なし・未承認の要件を検出する", () => {
    const curriculum = validCurriculum();
    curriculum.requirements[0].sourceRefs = [];
    curriculum.requirements[0].reviewStatus = "needs_review";
    expect(validateNormalizedCurriculum(curriculum)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "missing-source-reference" }),
        expect.objectContaining({ code: "unapproved-requirement" }),
      ])
    );
  });

  test("PDF総ページ数を超える参照を拒否する", () => {
    const curriculum = validCurriculum();
    curriculum.requirements[0].sourceRefs[0].pdfPages = [128];
    expect(validateNormalizedCurriculum(curriculum)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid-source-pages" }),
      ])
    );
  });

  test("出典台帳の未解決参照と拾い漏れを検出する", () => {
    const curriculum = validCurriculum();
    curriculum.sourceCoverage[0].disposition = {
      type: "modeled",
      targetIds: ["missing"],
    };
    expect(validateNormalizedCurriculum(curriculum)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "unknown-source-coverage-target" }),
      ])
    );

    curriculum.sourceCoverage = [];
    expect(validateNormalizedCurriculum(curriculum)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "missing-source-coverage" }),
      ])
    );
  });
});

