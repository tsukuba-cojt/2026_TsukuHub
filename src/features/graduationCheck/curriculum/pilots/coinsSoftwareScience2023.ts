import {
  findCrossListedExclusions,
  tsukuba2023CatalogSnapshot,
} from "../catalog";
import { officialCurriculumSources } from "../officialSources";
import { coinsSoftwareScience2026Pilot } from "./coinsSoftwareScience2026";
import type {
  AdditionalConstraint,
  NormalizedCurriculum,
  RequirementRule,
  SourceCoverageItem,
  SourceReference,
} from "../types";

const documentId = "tsukuba-graduation-requirements-2023";
const catalogDocumentId =
  tsukuba2023CatalogSnapshot.sourceDocument.documentId;

const tableRef = (cell: string): SourceReference => ({
  documentId,
  pdfPages: [83],
  printedPageLabels: ["242"],
  tableName: "別表第1（第3条関係）（情報科学類）",
  cell,
});

const noteRef = (noteNumber: number): SourceReference => ({
  documentId,
  pdfPages: [85],
  printedPageLabels: ["244"],
  tableName: "別表第1（第3条関係）（情報科学類）",
  note: `注${noteNumber}`,
});

const remapSourceRef = (sourceRef: SourceReference): SourceReference =>
  sourceRef.note
    ? noteRef(Number(sourceRef.note.replace("注", "")))
    : tableRef(sourceRef.cell ?? sourceRef.tableName ?? "卒業要件表");

const excludedRelatedPrefixes = [
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
const hasExcludedRelatedPrefix = (courseCode: string) =>
  excludedRelatedPrefixes.some((prefix) => courseCode.startsWith(prefix));
const crossListedRelatedExclusions = findCrossListedExclusions(
  tsukuba2023CatalogSnapshot.crossListingLinks,
  (courseCode) => !hasExcludedRelatedPrefix(courseCode),
  hasExcludedRelatedPrefix
);

const requirements = structuredClone(
  coinsSoftwareScience2026Pilot.requirements
).map((requirement): RequirementRule => ({
  ...requirement,
  sourceRefs: requirement.sourceRefs.map(remapSourceRef),
}));
const relatedRequirementIndex = requirements.findIndex(
  (requirement) => requirement.id === "related-other-courses"
);
if (relatedRequirementIndex < 0) {
  throw new Error("2023年度の関連科目要件を構築できませんでした。");
}
requirements[relatedRequirementIndex] = {
  id: "related-other-courses",
  label: "指定区分以外の関連科目",
  placement: { area: "basic_related", kind: "elective_required" },
  fulfillment: {
    type: "credits_from",
    matcher: {
      type: "external_designation",
      designationId: "coins-related-other-courses-2023",
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
                  { type: "code_prefix", values: ["E", "F", "G", "H"] },
                  {
                    type: "code_prefix",
                    values: ["1", "2", "3", "4", "5", "6", "9"],
                  },
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
          "2023年度KDB固定スナップショットの「同一」記載から、旧科目番号体系の二重開設を解決した。",
      },
    },
    credits: { minimum: 6, maximum: 10 },
  },
  sourceRefs: [
    tableRef("基礎科目・関連科目・選択（指定区分以外）"),
    noteRef(7),
  ],
  reviewStatus: "approved",
};

const relatedGcGeIndex = requirements.findIndex(
  (requirement) => requirement.id === "related-gc-ge"
);
if (relatedGcGeIndex < 0) {
  throw new Error("2023年度の関連科目上限要件を構築できませんでした。");
}
requirements[relatedGcGeIndex] = {
  ...requirements[relatedGcGeIndex],
  label: "E・F・GC・GE・H科目",
  fulfillment: {
    type: "credits_from",
    matcher: {
      type: "code_prefix",
      values: ["E", "F", "GC", "GE", "H"],
    },
    credits: { minimum: 0, maximum: 4 },
  },
  sourceRefs: [tableRef("基礎科目・関連科目・選択（E、F、GC、GE、H）")],
};

const additionalConstraints: AdditionalConstraint[] = [
  ...structuredClone(coinsSoftwareScience2026Pilot.additionalConstraints).map(
    (constraint) => ({
      ...constraint,
      sourceRefs: constraint.sourceRefs.map(remapSourceRef),
    })
  ),
  {
    id: "experiment-enrollment-review",
    type: "manual_review",
    conditionText:
      "実験科目の履修前に卒業必要科目を44単位以上修得していること。3年次編入学生の例外は対象外。",
    blocksCompilation: true,
    sourceRefs: [noteRef(10)],
  },
];

const tableCoverage = structuredClone(
  coinsSoftwareScience2026Pilot.sourceCoverage
)
  .filter(
    (item) =>
      !item.id.startsWith("coverage-note-") &&
      item.id !== "coverage-transition-clause"
  )
  .map((item): SourceCoverageItem => ({
    ...item,
    sourceRef: remapSourceRef(item.sourceRef),
  }));

const modeledNote = (
  noteNumber: number,
  label: string,
  targetIds: string[]
): SourceCoverageItem => ({
  id: `coverage-note-${noteNumber}`,
  label,
  kind: "footnote",
  sourceRef: noteRef(noteNumber),
  disposition: { type: "modeled", targetIds },
});
const unresolvedNote = (
  noteNumber: number,
  label: string,
  issue: string
): SourceCoverageItem => ({
  id: `coverage-note-${noteNumber}`,
  label,
  kind: "footnote",
  sourceRef: noteRef(noteNumber),
  disposition: { type: "manual_review", issue, blocksCompilation: true },
});
const notApplicableNote = (
  noteNumber: number,
  label: string,
  reason: string
): SourceCoverageItem => ({
  id: `coverage-note-${noteNumber}`,
  label,
  kind: "footnote",
  sourceRef: noteRef(noteNumber),
  disposition: { type: "not_applicable", reason },
});

export const coinsSoftwareScience2023Pilot: NormalizedCurriculum = {
  schemaVersion: "normalized-curriculum-1.0.0",
  curriculumId: "tsukuba-inf-coins-software-science-2023-pilot",
  sourceDocuments: [
    { ...officialCurriculumSources[0] },
    { ...tsukuba2023CatalogSnapshot.sourceDocument },
  ],
  organization: structuredClone(coinsSoftwareScience2026Pilot.organization),
  applicability: {
    admissionYearFrom: 2023,
    admissionYearTo: 2023,
    effectiveFrom: "2023-04-01",
  },
  totalCredits: { minimum: 125, displayText: "合計125単位" },
  requirements,
  aggregateConstraints: structuredClone(
    coinsSoftwareScience2026Pilot.aggregateConstraints
  ).map((constraint) => ({
    ...constraint,
    sourceRefs: constraint.sourceRefs.map(remapSourceRef),
  })),
  equivalencies: [
    ...structuredClone(coinsSoftwareScience2026Pilot.equivalencies).map(
      (equivalence) => ({
        ...equivalence,
        sourceRefs: [noteRef(15)],
      })
    ),
    {
      id: "programming-introduction-a-transition",
      target: { name: "プログラミング入門A" },
      alternative: {
        type: "all_courses",
        courses: [{ name: "プログラミング入門I" }],
      },
      sourceRefs: [noteRef(15)],
    },
    {
      id: "programming-introduction-b-transition",
      target: { name: "プログラミング入門B" },
      alternative: {
        type: "all_courses",
        courses: [{ name: "プログラミング入門II" }],
      },
      sourceRefs: [noteRef(15)],
    },
  ],
  additionalConstraints,
  sourceCoverage: [
    ...tableCoverage,
    modeledNote(1, "単位数は卒業に必要な最少値", [
      "required-total",
      "elective-total",
    ]),
    {
      id: "coverage-note-2",
      label: "同一科目の重複計上禁止",
      kind: "footnote",
      sourceRef: noteRef(2),
      disposition: {
        type: "modeled",
        targetPaths: ["allocationPolicy"],
      },
    },
    modeledNote(3, "科目番号による科目群指定", [
      "specialized-elective-major",
      "specialized-elective-other",
      "foundation-elective-designated",
      "foundation-elective-gb1",
      "foundation-elective-ga1",
    ]),
    modeledNote(4, "専門・専門基礎科目はGA・GB科目", [
      "specialized-elective-major",
      "specialized-elective-other",
      "foundation-required",
      "foundation-elective-designated",
      "foundation-elective-english",
      "foundation-elective-gb1",
      "foundation-elective-ga1",
    ]),
    modeledNote(5, "共通科目の履修方法", [
      "common-required-intro",
      "common-required-physical-education",
      "common-required-english",
      "common-required-information",
      "common-elective-bachelor-foundation",
      "common-elective-physical-education",
      "common-elective-language",
      "common-elective-japanese-art",
    ]),
    unresolvedNote(
      6,
      "他学類開設の同内容科目",
      "学類長が内容の重複を認定する科目の対応表が必要。"
    ),
    modeledNote(7, "複数科目番号を持つGB科目", ["related-other-courses"]),
    unresolvedNote(
      8,
      "外国人留学生の日本語選択",
      "学生属性と選択内容の入力手段が必要。"
    ),
    unresolvedNote(
      9,
      "単位互換協定",
      "認定科目と原科目の対応情報が必要。"
    ),
    modeledNote(10, "実験科目の履修条件", ["experiment-enrollment-review"]),
    modeledNote(11, "ソフトウェアサイエンス主専攻の卒業研究履修条件", [
      "graduation-research-prerequisite",
      "graduation-research-remaining-credits-review",
    ]),
    notApplicableNote(
      12,
      "情報システム主専攻の卒業研究履修条件",
      "ソフトウェアサイエンス主専攻には適用しない。"
    ),
    notApplicableNote(
      13,
      "知能情報メディア主専攻の卒業研究履修条件",
      "ソフトウェアサイエンス主専攻には適用しない。"
    ),
    notApplicableNote(
      14,
      "早期卒業の特別卒業研究",
      "通常の4年卒業判定のみを対象とするため、早期卒業制度は対象外。"
    ),
    modeledNote(15, "旧科目の読み替え", [
      "linear-algebra-transition",
      "calculus-transition",
      "programming-introduction-a-transition",
      "programming-introduction-b-transition",
    ]),
  ],
  allocationPolicy: {
    allowDoubleCounting: false,
    onMultipleMatch: "ambiguous",
    onNoMatch: "unclassified",
  },
  notes: [
    "2023年度版PDF第83ページ（冊子242ページ）の表と、第85ページ（冊子244ページ）の注記を使用した。",
    "関連科目の複数科目番号判定には、2023年度KDB固定スナップショットを使用した。",
    "留年、3年次編入、早期卒業は正規化移行の対象外。",
  ],
  review: { status: "needs_review" },
};
