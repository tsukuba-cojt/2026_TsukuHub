import {
  findCrossListedExclusions,
  tsukuba2024CatalogSnapshot,
} from "../catalog";
import { getOfficialCurriculumSource } from "../officialSources";
import type {
  NormalizedCurriculum,
  SourceCoverageItem,
  SourceReference,
} from "../types";
import { coinsSoftwareScience2023Pilot } from "./coinsSoftwareScience2023";

const documentId = "tsukuba-graduation-requirements-2024";
const catalogDocumentId =
  tsukuba2024CatalogSnapshot.sourceDocument.documentId;

const remapSourceRef = (sourceRef: SourceReference): SourceReference => ({
  ...sourceRef,
  documentId,
  pdfPages: sourceRef.note ? [86] : [84],
  printedPageLabels: sourceRef.note ? ["249"] : ["247"],
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
  tsukuba2024CatalogSnapshot.crossListingLinks,
  (courseCode) => !hasExcludedRelatedPrefix(courseCode),
  hasExcludedRelatedPrefix
);

const pilot = structuredClone(coinsSoftwareScience2023Pilot);
pilot.curriculumId = "tsukuba-inf-coins-software-science-2024-pilot";
pilot.sourceDocuments = [
  { ...getOfficialCurriculumSource(2024) },
  { ...tsukuba2024CatalogSnapshot.sourceDocument },
];
pilot.applicability = {
  admissionYearFrom: 2024,
  admissionYearTo: 2024,
  effectiveFrom: "2024-04-01",
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
pilot.sourceCoverage = pilot.sourceCoverage.map((item) => ({
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
  throw new Error("2024年度の関連科目要件を構築できませんでした。");
}
const relatedMatcher = relatedRequirement.fulfillment.matcher;
relatedRequirement.fulfillment = {
  ...relatedRequirement.fulfillment,
  matcher: {
    ...relatedMatcher,
    designationId: "coins-related-other-courses-2024",
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
        "2024年度KDB固定スナップショットの「同一」記載から、旧科目番号体系の二重開設を解決した。",
    },
  },
};

const transitionCoverage: SourceCoverageItem = {
  id: "coverage-transition-clause",
  label: "令和5年4月1日施行改正の経過措置",
  kind: "transition_clause",
  sourceRef: {
    documentId,
    pdfPages: [83],
    printedPageLabels: ["246"],
    rawText:
      "この部局細則の施行日前に情報学群に入学した者に適用される履修方法等は、所定の例外を除き、なお従前の例による。",
  },
  disposition: { type: "modeled", targetPaths: ["applicability"] },
};
pilot.sourceCoverage.push(transitionCoverage);
pilot.notes = [
  "2024年度版PDF第84ページ（冊子247ページ）の表と、第86ページ（冊子249ページ）の注記を使用した。",
  "関連科目の複数科目番号判定には、2024年度KDB固定スナップショットを使用した。",
  "PDF第83ページ（冊子246ページ）の経過措置から、2024年度入学者には掲載表を適用した。",
  "留年、3年次編入、早期卒業は正規化移行の対象外。",
];

export const coinsSoftwareScience2024Pilot: NormalizedCurriculum = pilot;
