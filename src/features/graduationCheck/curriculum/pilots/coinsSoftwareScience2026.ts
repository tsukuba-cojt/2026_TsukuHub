import { getOfficialCurriculumSource } from "../officialSources";
import {
  findCrossListedExclusions,
  tsukuba2026CatalogSnapshot,
} from "../catalog";
import type {
  NormalizedCurriculum,
  SourceCoverageItem,
  SourceReference,
  SubjectMatcher,
} from "../types";

const documentId = "tsukuba-graduation-requirements-2026";
const catalogDocumentId =
  tsukuba2026CatalogSnapshot.sourceDocument.documentId;

const excludedRelatedPrefixes = [
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
const hasExcludedRelatedPrefix = (courseCode: string) =>
  excludedRelatedPrefixes.some((prefix) => courseCode.startsWith(prefix));
const crossListedRelatedExclusions = findCrossListedExclusions(
  tsukuba2026CatalogSnapshot.crossListingLinks,
  (courseCode) => !hasExcludedRelatedPrefix(courseCode),
  hasExcludedRelatedPrefix
);

const tableRef = (cell: string): SourceReference => ({
  documentId,
  pdfPages: [85],
  printedPageLabels: ["253"],
  tableName: "別表第1（第3条関係）（情報科学類）",
  cell,
});

const noteRef = (noteNumber: number): SourceReference => ({
  documentId,
  pdfPages: [87],
  printedPageLabels: ["255"],
  tableName: "別表第1（第3条関係）（情報科学類）",
  note: `注${noteNumber}`,
});

const coverage = (
  id: string,
  label: string,
  sourceRef: SourceReference,
  targetIds: string[]
): SourceCoverageItem => ({
  id,
  label,
  kind: sourceRef.note ? "footnote" : "table_cell",
  sourceRef,
  disposition: { type: "modeled", targetIds },
});

const coveragePath = (
  id: string,
  label: string,
  sourceRef: SourceReference,
  targetPaths: ("applicability" | "totalCredits" | "allocationPolicy")[]
): SourceCoverageItem => ({
  id,
  label,
  kind: sourceRef.note ? "footnote" : "table_cell",
  sourceRef,
  disposition: { type: "modeled", targetPaths },
});

const unresolvedCoverage = (
  id: string,
  label: string,
  sourceRef: SourceReference,
  issue: string
): SourceCoverageItem => ({
  id,
  label,
  kind: sourceRef.note ? "footnote" : "provision",
  sourceRef,
  disposition: { type: "manual_review", issue, blocksCompilation: true },
});

const notApplicableCoverage = (
  id: string,
  label: string,
  sourceRef: SourceReference,
  reason: string
): SourceCoverageItem => ({
  id,
  label,
  kind: sourceRef.note ? "footnote" : "provision",
  sourceRef,
  disposition: { type: "not_applicable", reason },
});

const commonTag = (
  designationId: string,
  values: string[],
  excludedValues: string[] = []
): SubjectMatcher => ({
  type: "external_designation",
  designationId,
  resolution: {
    method: "manual",
    matcher:
      excludedValues.length === 0
        ? { type: "code_prefix", values }
        : {
            type: "all_of",
            conditions: [
              { type: "code_prefix", values },
              {
                type: "not",
                condition: {
                  type: "code_prefix",
                  values: excludedValues,
                },
              },
            ],
          },
    note: "既存のcourseCodeTypesを固定した手動解決。科目番号体系変更時は再レビューする。",
  },
});

/**
 * 2026年度版PDFを使った最初の正規化パイロット。
 * 実行用データへはまだ切り替えず、表現力・出典追跡・静的検証の確認に用いる。
 */
export const coinsSoftwareScience2026Pilot: NormalizedCurriculum = {
  schemaVersion: "normalized-curriculum-1.0.0",
  curriculumId: "tsukuba-inf-coins-software-science-2026-pilot",
  sourceDocuments: [
    { ...getOfficialCurriculumSource(2026) },
    { ...tsukuba2026CatalogSnapshot.sourceDocument },
  ],
  organization: {
    universityId: "tsukuba",
    schoolId: "inf",
    schoolName: "情報学群",
    collegeId: "coins",
    collegeName: "情報科学類",
    programId: "software-science",
    programName: "ソフトウェアサイエンス主専攻",
  },
  applicability: {
    admissionYearFrom: 2026,
    admissionYearTo: 2026,
    effectiveFrom: "2026-04-01",
    transitionRuleText:
      "令和8年4月1日前に情報学群へ入学した者の履修方法等は従前の例による。",
  },
  totalCredits: { minimum: 125, displayText: "合計125単位" },
  requirements: [
    {
      id: "specialized-required-lab-language",
      label: "専門必修（実験・専門語学）",
      placement: { area: "specialized", kind: "required" },
      fulfillment: {
        type: "all_courses",
        courses: [
          { name: "ソフトウェアサイエンス実験A", expectedCredits: 3 },
          { name: "ソフトウェアサイエンス実験B", expectedCredits: 3 },
          { name: "専門語学A", expectedCredits: 2 },
          { name: "専門語学B", expectedCredits: 2 },
        ],
      },
      sourceRefs: [tableRef("専門科目・必修科目（実験・専門語学）")],
      reviewStatus: "approved",
    },
    {
      id: "specialized-required-graduation-research",
      label: "専門必修（卒業研究）",
      placement: { area: "specialized", kind: "required" },
      fulfillment: {
        type: "all_courses",
        courses: [
          { name: "卒業研究A", expectedCredits: 3 },
          { name: "卒業研究B", expectedCredits: 3 },
        ],
      },
      sourceRefs: [tableRef("専門科目・必修科目（卒業研究）")],
      reviewStatus: "approved",
    },
    {
      id: "specialized-elective-major",
      label: "主専攻専門選択",
      placement: { area: "specialized", kind: "elective_required" },
      fulfillment: {
        type: "credits_from",
        matcher: { type: "code_prefix", values: ["GB20", "GB30", "GB40"] },
        credits: { minimum: 16, maximum: 34, displayText: "16単位以上" },
      },
      allocation: { priority: 10 },
      sourceRefs: [tableRef("専門科目・選択科目（GB20、GB30、GB40）")],
      reviewStatus: "approved",
    },
    {
      id: "specialized-elective-other",
      label: "その他の専門選択・特別演習",
      placement: { area: "specialized", kind: "elective" },
      fulfillment: {
        type: "credits_from",
        matcher: {
          type: "any_of",
          conditions: [
            { type: "code_prefix", values: ["GB2", "GB3", "GB4", "GA4"] },
            {
              type: "course_name",
              values: ["情報科学特別演習", "情報特別演習I", "情報特別演習II"],
            },
          ],
        },
        credits: { minimum: 0, maximum: 18, displayText: "0〜18単位" },
      },
      allocation: { priority: 20 },
      sourceRefs: [tableRef("専門科目・選択科目（GB2、GB3、GB4、GA4等）")],
      reviewStatus: "approved",
    },
    {
      id: "foundation-required",
      label: "専門基礎必修",
      placement: { area: "specialized_foundation", kind: "required" },
      fulfillment: {
        type: "all_courses",
        courses: [
          { name: "線形代数A", expectedCredits: 2 },
          { name: "線形代数B", expectedCredits: 2 },
          { name: "微分積分A", expectedCredits: 2 },
          { name: "微分積分B", expectedCredits: 2 },
          { name: "情報数学A", expectedCredits: 2 },
          { name: "専門英語基礎", expectedCredits: 1 },
          { name: "プログラミング入門A", expectedCredits: 2 },
          { name: "プログラミング入門B", expectedCredits: 1 },
          { name: "コンピュータとプログラミング", expectedCredits: 3 },
          { name: "データ構造とアルゴリズム", expectedCredits: 3 },
          { name: "データ構造とアルゴリズム実験", expectedCredits: 2 },
          { name: "論理回路", expectedCredits: 2 },
          { name: "論理回路演習", expectedCredits: 2 },
        ],
      },
      sourceRefs: [tableRef("専門基礎科目・必修科目")],
      reviewStatus: "approved",
    },
    {
      id: "foundation-elective-designated",
      label: "確率論・統計学・数値計算法・論理系科目",
      placement: { area: "specialized_foundation", kind: "elective_required" },
      fulfillment: {
        type: "credits_from",
        matcher: {
          type: "course_name",
          values: [
            "確率論",
            "統計学",
            "数値計算法",
            "論理と形式化",
            "論理システム",
            "論理システム演習",
          ],
        },
        credits: { minimum: 8, maximum: 26, displayText: "8単位以上" },
      },
      sourceRefs: [tableRef("専門基礎科目・選択科目（指定6科目）")],
      reviewStatus: "approved",
    },
    {
      id: "foundation-elective-english",
      label: "Computer Science in English",
      placement: { area: "specialized_foundation", kind: "elective_required" },
      fulfillment: {
        type: "credits_from",
        matcher: {
          type: "course_name",
          values: ["Computer Science in English A", "Computer Science in English B"],
        },
        credits: { minimum: 2, maximum: 26, displayText: "2単位以上" },
      },
      sourceRefs: [tableRef("専門基礎科目・選択科目（Computer Science in English）")],
      reviewStatus: "approved",
    },
    {
      id: "foundation-elective-gb1",
      label: "GB1科目（特別演習を除く）",
      placement: { area: "specialized_foundation", kind: "elective_required" },
      fulfillment: {
        type: "credits_from",
        matcher: {
          type: "all_of",
          conditions: [
            { type: "code_prefix", values: ["GB1"] },
            {
              type: "not",
              condition: {
                type: "course_name",
                values: ["情報科学特別演習", "情報特別演習I", "情報特別演習II"],
              },
            },
          ],
        },
        credits: { minimum: 4, maximum: 26, displayText: "4単位以上" },
      },
      sourceRefs: [tableRef("専門基礎科目・選択科目（GB1、特別演習を除く）")],
      reviewStatus: "approved",
    },
    {
      id: "foundation-elective-ga1",
      label: "GA1科目",
      placement: { area: "specialized_foundation", kind: "elective_required" },
      fulfillment: {
        type: "credits_from",
        matcher: { type: "code_prefix", values: ["GA1"] },
        credits: { minimum: 8, maximum: 26, displayText: "8単位以上" },
      },
      sourceRefs: [tableRef("専門基礎科目・選択科目（GA1）")],
      reviewStatus: "approved",
    },
    {
      id: "common-required-intro",
      label: "ファーストイヤーセミナー・学問への誘い",
      placement: { area: "basic_common", kind: "required" },
      fulfillment: {
        type: "all_courses",
        courses: [
          { name: "ファーストイヤーセミナー", expectedCredits: 1 },
          { name: "学問への誘い", expectedCredits: 1 },
        ],
      },
      sourceRefs: [tableRef("基礎科目・共通科目・必修（総合科目）")],
      reviewStatus: "approved",
    },
    {
      id: "common-required-physical-education",
      label: "体育（必修）",
      placement: { area: "basic_common", kind: "required" },
      fulfillment: {
        type: "credits_from",
        matcher: commonTag("physical-education", ["2"]),
        credits: { exact: 2 },
      },
      sourceRefs: [tableRef("基礎科目・共通科目・必修（体育）")],
      reviewStatus: "approved",
    },
    {
      id: "common-required-english",
      label: "外国語（英語・必修）",
      placement: { area: "basic_common", kind: "required" },
      fulfillment: {
        type: "credits_from",
        matcher: commonTag("required-english", ["31H", "31J", "31K", "31L"]),
        credits: { exact: 4 },
      },
      sourceRefs: [tableRef("基礎科目・共通科目・必修（外国語・英語）")],
      reviewStatus: "approved",
    },
    {
      id: "common-required-information",
      label: "情報（必修）",
      placement: { area: "basic_common", kind: "required" },
      fulfillment: {
        type: "credits_from",
        matcher: commonTag("information", ["6"]),
        credits: { exact: 4 },
      },
      sourceRefs: [tableRef("基礎科目・共通科目・必修（情報）")],
      reviewStatus: "approved",
    },
    {
      id: "common-elective-bachelor-foundation",
      label: "学士基盤科目",
      placement: { area: "basic_common", kind: "elective" },
      fulfillment: {
        type: "credits_from",
        matcher: commonTag("bachelor-foundation", ["12", "14"], ["1227", "1228"]),
        credits: { minimum: 1, maximum: 5 },
      },
      sourceRefs: [tableRef("基礎科目・共通科目・選択（学士基盤科目）")],
      reviewStatus: "approved",
    },
    {
      id: "common-elective-physical-education",
      label: "体育（選択）",
      placement: { area: "basic_common", kind: "elective" },
      fulfillment: {
        type: "credits_from",
        matcher: commonTag("physical-education", ["2"]),
        credits: { minimum: 0, maximum: 4 },
      },
      sourceRefs: [tableRef("基礎科目・共通科目・選択（体育）")],
      reviewStatus: "approved",
    },
    {
      id: "common-elective-language",
      label: "外国語（選択）",
      placement: { area: "basic_common", kind: "elective" },
      fulfillment: {
        type: "credits_from",
        matcher: commonTag("foreign-language", ["3"]),
        credits: { minimum: 0, maximum: 4 },
      },
      sourceRefs: [tableRef("基礎科目・共通科目・選択（外国語）")],
      reviewStatus: "approved",
    },
    {
      id: "common-elective-japanese-art",
      label: "国語・芸術（選択）",
      placement: { area: "basic_common", kind: "elective" },
      fulfillment: {
        type: "credits_from",
        matcher: commonTag("japanese-art", ["4", "5"]),
        credits: { minimum: 0, maximum: 4 },
      },
      sourceRefs: [tableRef("基礎科目・共通科目・選択（国語・芸術）")],
      reviewStatus: "approved",
    },
    {
      id: "related-other-courses",
      label: "指定区分以外の関連科目",
      placement: { area: "basic_related", kind: "elective_required" },
      fulfillment: {
        type: "credits_from",
        matcher: {
          type: "external_designation",
          designationId: "coins-related-other-courses",
          resolution: {
            method: "catalog_snapshot",
            catalogDocumentId,
            matcher: {
              type: "all_of",
              conditions: [
                { type: "all_courses" },
                {
                  type: "not",
                  condition: {
                    type: "any_of",
                    conditions: [
                      { type: "code_prefix", values: ["GA", "GB", "GC", "GE"] },
                      { type: "code_prefix", values: ["1", "2", "3", "4", "5", "6", "9"] },
                    ],
                  },
                },
                {
                  type: "not",
                  condition: {
                    type: "course_code",
                    values: crossListedRelatedExclusions,
                  },
                },
              ],
            },
            note:
              "2026年度KDB固定スナップショットの「同一」記載から、除外区分との二重開設科目を解決した。",
          },
        },
        credits: { minimum: 6, maximum: 10 },
      },
      sourceRefs: [tableRef("基礎科目・関連科目・選択（指定区分以外）"), noteRef(6)],
      reviewStatus: "approved",
    },
    {
      id: "related-gc-ge",
      label: "GC・GE科目",
      placement: { area: "basic_related", kind: "elective" },
      fulfillment: {
        type: "credits_from",
        matcher: { type: "code_prefix", values: ["GC", "GE"] },
        credits: { minimum: 0, maximum: 4 },
      },
      sourceRefs: [tableRef("基礎科目・関連科目・選択（GC、GE）")],
      reviewStatus: "approved",
    },
  ],
  aggregateConstraints: [
    {
      id: "specialized-required-total",
      label: "専門必修合計",
      targetRequirementIds: [
        "specialized-required-lab-language",
        "specialized-required-graduation-research",
      ],
      credits: { exact: 16 },
      sourceRefs: [tableRef("専門科目・必修科目・単位合計")],
    },
    {
      id: "specialized-elective-total",
      label: "専門選択合計",
      targetRequirementIds: ["specialized-elective-major", "specialized-elective-other"],
      credits: { exact: 34 },
      sourceRefs: [tableRef("専門科目・選択科目・単位合計")],
    },
    {
      id: "foundation-elective-total",
      label: "専門基礎選択合計",
      targetRequirementIds: [
        "foundation-elective-designated",
        "foundation-elective-english",
        "foundation-elective-gb1",
        "foundation-elective-ga1",
      ],
      credits: { exact: 26 },
      sourceRefs: [tableRef("専門基礎科目・選択科目・単位合計")],
    },
    {
      id: "common-required-total",
      label: "共通科目必修合計",
      targetRequirementIds: [
        "common-required-intro",
        "common-required-physical-education",
        "common-required-english",
        "common-required-information",
      ],
      credits: { exact: 12 },
      sourceRefs: [tableRef("基礎科目・共通科目・必修科目・単位合計")],
    },
    {
      id: "common-elective-total",
      label: "共通科目選択合計",
      targetRequirementIds: [
        "common-elective-bachelor-foundation",
        "common-elective-physical-education",
        "common-elective-language",
        "common-elective-japanese-art",
      ],
      credits: { minimum: 1, maximum: 5 },
      sourceRefs: [tableRef("基礎科目・共通科目・選択科目・単位合計")],
    },
    {
      id: "related-total",
      label: "関連科目合計",
      targetRequirementIds: ["related-other-courses", "related-gc-ge"],
      credits: { minimum: 6, maximum: 10 },
      sourceRefs: [tableRef("基礎科目・関連科目・選択科目・単位合計")],
    },
    {
      id: "required-total",
      label: "必修科目合計",
      targetRequirementIds: [
        "specialized-required-lab-language",
        "specialized-required-graduation-research",
        "foundation-required",
        "common-required-intro",
        "common-required-physical-education",
        "common-required-english",
        "common-required-information",
      ],
      credits: { exact: 54 },
      sourceRefs: [tableRef("計・必修科目")],
    },
    {
      id: "elective-total",
      label: "選択科目合計",
      targetRequirementIds: [
        "specialized-elective-major",
        "specialized-elective-other",
        "foundation-elective-designated",
        "foundation-elective-english",
        "foundation-elective-gb1",
        "foundation-elective-ga1",
        "common-elective-bachelor-foundation",
        "common-elective-physical-education",
        "common-elective-language",
        "common-elective-japanese-art",
        "related-other-courses",
        "related-gc-ge",
      ],
      credits: { exact: 71 },
      sourceRefs: [tableRef("計・選択科目")],
    },
  ],
  equivalencies: [
    {
      id: "linear-algebra-transition",
      target: { name: "線形代数A" },
      alternative: {
        type: "all_courses",
        courses: [{ name: "線形代数1" }, { name: "線形代数2" }],
      },
      sourceRefs: [noteRef(14)],
    },
    {
      id: "calculus-transition",
      target: { name: "微分積分A" },
      alternative: {
        type: "all_courses",
        courses: [{ name: "微積分1" }, { name: "微積分2" }],
      },
      sourceRefs: [noteRef(14)],
    },
  ],
  additionalConstraints: [
    {
      id: "graduation-research-prerequisite",
      type: "prerequisite",
      targetRequirementId: "specialized-required-graduation-research",
      prerequisite: {
        type: "all_of",
        requirements: [
          {
            type: "credits_from",
            matcher: { type: "all_courses" },
            credits: { minimum: 100 },
          },
          {
            type: "all_courses",
            courses: [
              { name: "論理回路演習" },
              { name: "ソフトウェアサイエンス実験A" },
              { name: "ソフトウェアサイエンス実験B" },
            ],
          },
        ],
      },
      sourceRefs: [noteRef(11)],
    },
    {
      id: "graduation-research-remaining-credits-review",
      type: "manual_review",
      conditionText:
        "卒業研究履修時点で卒業に必要な未修得単位が25単位以下であること、または学類長の特例承認を確認する。",
      blocksCompilation: true,
      sourceRefs: [noteRef(11)],
    },
  ],
  sourceCoverage: [
    coverage("coverage-specialized-required", "専門必修欄", tableRef("専門科目・必修科目"), [
      "specialized-required-lab-language",
      "specialized-required-graduation-research",
      "specialized-required-total",
    ]),
    coverage("coverage-specialized-elective", "専門選択欄", tableRef("専門科目・選択科目"), [
      "specialized-elective-major",
      "specialized-elective-other",
      "specialized-elective-total",
    ]),
    coverage("coverage-foundation-required", "専門基礎必修欄", tableRef("専門基礎科目・必修科目"), [
      "foundation-required",
    ]),
    coverage("coverage-foundation-elective", "専門基礎選択欄", tableRef("専門基礎科目・選択科目"), [
      "foundation-elective-designated",
      "foundation-elective-english",
      "foundation-elective-gb1",
      "foundation-elective-ga1",
      "foundation-elective-total",
    ]),
    coverage("coverage-common", "共通科目欄", tableRef("基礎科目・共通科目"), [
      "common-required-intro",
      "common-required-physical-education",
      "common-required-english",
      "common-required-information",
      "common-elective-bachelor-foundation",
      "common-elective-physical-education",
      "common-elective-language",
      "common-elective-japanese-art",
      "common-required-total",
      "common-elective-total",
    ]),
    coverage("coverage-related", "関連科目欄", tableRef("基礎科目・関連科目"), [
      "related-other-courses",
      "related-gc-ge",
      "related-total",
    ]),
    coverage("coverage-totals", "必修・選択・総合計欄", tableRef("計・合計"), [
      "required-total",
      "elective-total",
    ]),
    coveragePath(
      "coverage-grand-total",
      "卒業に必要な合計単位数",
      tableRef("合計125単位"),
      ["totalCredits"]
    ),
    coverage("coverage-note-1", "単位数は卒業に必要な最少値", noteRef(1), [
      "required-total",
      "elective-total",
    ]),
    coveragePath("coverage-note-2", "同一科目の重複計上禁止", noteRef(2), [
      "allocationPolicy",
    ]),
    coverage("coverage-note-3", "科目番号による科目群指定", noteRef(3), [
      "specialized-elective-major",
      "foundation-elective-gb1",
    ]),
    coverage("coverage-note-4", "共通科目の履修方法", noteRef(4), [
      "common-required-intro",
      "common-elective-bachelor-foundation",
    ]),
    unresolvedCoverage(
      "coverage-note-5",
      "他学類開設の同内容科目",
      noteRef(5),
      "同内容科目の対応表が必要。"
    ),
    coverage("coverage-note-6", "二重開設科目の関連科目除外", noteRef(6), [
      "related-other-courses",
    ]),
    unresolvedCoverage(
      "coverage-note-7",
      "学類長許可によるGB科目の例外",
      noteRef(7),
      "個別許可の入力手段が必要。"
    ),
    unresolvedCoverage(
      "coverage-note-8",
      "外国人留学生の日本語選択",
      noteRef(8),
      "学生属性と選択内容の入力手段が必要。"
    ),
    unresolvedCoverage(
      "coverage-note-9",
      "単位互換協定",
      noteRef(9),
      "認定科目と原科目の対応情報が必要。"
    ),
    unresolvedCoverage(
      "coverage-note-10",
      "卒業研究履修条件の共通例外",
      noteRef(10),
      "学類長が認める例外を機械判定できない。"
    ),
    coverage("coverage-note-11", "主専攻別の卒業研究履修条件", noteRef(11), [
      "graduation-research-prerequisite",
      "graduation-research-remaining-credits-review",
    ]),
    notApplicableCoverage(
      "coverage-note-12",
      "情報システム主専攻の卒業研究履修条件",
      noteRef(12),
      "ソフトウェアサイエンス主専攻のカリキュラムには適用しない。"
    ),
    notApplicableCoverage(
      "coverage-note-13",
      "知能情報メディア主専攻の卒業研究履修条件",
      noteRef(13),
      "ソフトウェアサイエンス主専攻のカリキュラムには適用しない。"
    ),
    coverage("coverage-note-14", "移行学生の読み替え", noteRef(14), [
      "linear-algebra-transition",
      "calculus-transition",
    ]),
    unresolvedCoverage(
      "coverage-note-15",
      "同内容科目の読み替え",
      noteRef(15),
      "同内容と認める科目の対応表が必要。"
    ),
    {
      id: "coverage-transition-clause",
      label: "2026年度改正の経過措置",
      kind: "transition_clause",
      sourceRef: {
        documentId,
        pdfPages: [84],
        printedPageLabels: ["252"],
        rawText: "施行日前に情報学群に入学した者の履修方法等は、なお従前の例による。",
      },
      disposition: {
        type: "modeled",
        targetPaths: ["applicability"],
      },
    },
  ],
  allocationPolicy: {
    allowDoubleCounting: false,
    onMultipleMatch: "ambiguous",
    onNoMatch: "unclassified",
  },
  notes: [
    "このパイロットはPDF第85・87ページ（冊子253・255ページ）を中心に転記した。",
    "関連科目の二重開設判定には、2026-08-15のKDB固定スナップショットを使用した。",
    "学類長の個別許可など、カタログでも判別できない条件は未承認のまま残す。",
  ],
  review: { status: "needs_review" },
};
