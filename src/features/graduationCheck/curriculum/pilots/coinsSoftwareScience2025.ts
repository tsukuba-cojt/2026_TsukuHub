import {
  findCrossListedExclusions,
  tsukuba2025CatalogSnapshot,
} from "../catalog";
import { getOfficialCurriculumSource } from "../officialSources";
import type {
  NormalizedCurriculum,
  SourceCoverageItem,
  SourceReference,
} from "../types";
import { coinsSoftwareScience2024Pilot } from "./coinsSoftwareScience2024";

const documentId = "tsukuba-graduation-requirements-2025";
const catalogDocumentId =
  tsukuba2025CatalogSnapshot.sourceDocument.documentId;

const remapSourceRef = (sourceRef: SourceReference): SourceReference => ({
  ...sourceRef,
  documentId,
  pdfPages: sourceRef.note ? [87] : [85],
  printedPageLabels: sourceRef.note ? ["253"] : ["251"],
});

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
  tsukuba2025CatalogSnapshot.crossListingLinks,
  (courseCode) => !hasExcludedRelatedPrefix(courseCode),
  hasExcludedRelatedPrefix
);

const pilot = structuredClone(coinsSoftwareScience2024Pilot);
pilot.curriculumId = "tsukuba-inf-coins-software-science-2025-pilot";
pilot.sourceDocuments = [
  { ...getOfficialCurriculumSource(2025) },
  { ...tsukuba2025CatalogSnapshot.sourceDocument },
];
pilot.applicability = {
  admissionYearFrom: 2025,
  admissionYearTo: 2025,
  effectiveFrom: "2025-04-01",
};

pilot.requirements.forEach((requirement) => {
  requirement.sourceRefs = requirement.sourceRefs.map(remapSourceRef);
});
pilot.aggregateConstraints.forEach((constraint) => {
  constraint.sourceRefs = constraint.sourceRefs.map(remapSourceRef);
});
pilot.equivalencies.forEach((equivalence) => {
  equivalence.sourceRefs = equivalence.sourceRefs.map(remapSourceRef);
});
pilot.additionalConstraints.forEach((constraint) => {
  constraint.sourceRefs = constraint.sourceRefs.map(remapSourceRef);
});
pilot.sourceCoverage = pilot.sourceCoverage
  .filter((item) => item.id !== "coverage-transition-clause")
  .map((item) => ({
    ...item,
    sourceRef: remapSourceRef(item.sourceRef),
  }));

const relatedRequirement = pilot.requirements.find(
  (requirement) => requirement.id === "related-other-courses"
);
if (
  relatedRequirement?.fulfillment.type !== "credits_from" ||
  relatedRequirement.fulfillment.matcher.type !== "external_designation" ||
  relatedRequirement.fulfillment.matcher.resolution === undefined
) {
  throw new Error("2025年度の関連科目要件を構築できませんでした。");
}
const relatedMatcher = relatedRequirement.fulfillment.matcher;
relatedRequirement.fulfillment = {
  ...relatedRequirement.fulfillment,
  matcher: {
    ...relatedMatcher,
    designationId: "coins-related-other-courses-2025",
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
        "2025年度KDB固定スナップショットの「同一」記載から、旧科目番号体系の二重開設を解決した。",
    },
  },
};

const transitionCoverage: SourceCoverageItem = {
  id: "coverage-transition-clause",
  label: "令和7年4月1日施行改正の経過措置",
  kind: "transition_clause",
  sourceRef: {
    documentId,
    pdfPages: [84],
    printedPageLabels: ["250"],
    rawText:
      "この部局細則は令和7年4月1日から施行する。施行日前に情報学群へ入学した者の履修方法等は、所定の例外を除き、なお従前の例による。",
  },
  disposition: { type: "modeled", targetPaths: ["applicability"] },
};
pilot.sourceCoverage.push(transitionCoverage);
pilot.notes = [
  "2025年度版PDF第85ページ（冊子251ページ）の表と、第87ページ（冊子253ページ）の注記を使用した。",
  "関連科目の複数科目番号判定には、2025年度KDB固定スナップショットを使用した。",
  "PDF第84ページ（冊子250ページ）の経過措置から、2025年度入学者には掲載表を適用した。",
  "留年、3年次編入、早期卒業は正規化移行の対象外。",
];

export const coinsSoftwareScience2025Pilot: NormalizedCurriculum = pilot;
