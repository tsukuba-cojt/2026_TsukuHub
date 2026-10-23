export {
  assessCurriculumCompilation,
  validateNormalizedCurriculum,
} from "./validate";
export { officialCurriculumSources } from "./officialSources";
export {
  isSupportedNormalizedAdmissionYear,
  normalizedCurriculumScope,
  supportedNormalizedAdmissionYears,
} from "./scope";
export {
  buildCrossListingGroups,
  extractCrossListedCourseCodes,
  findCrossListedExclusions,
} from "./catalog";
export type {
  CurriculumCompilationAssessment,
  CurriculumValidationIssue,
} from "./validate";
export type {
  AdditionalConstraint,
  AggregateConstraint,
  CourseEquivalence,
  CourseReference,
  CreditConstraint,
  CurriculumApplicability,
  CurriculumArea,
  FulfillmentRule,
  MatcherResolution,
  NormalizedCurriculum,
  RequirementKind,
  RequirementPlacement,
  RequirementRule,
  SourceCoverageItem,
  SourceDocument,
  SourceReference,
  SubjectMatcher,
  TranscriptSubjectMatcher,
} from "./types";
export type {
  CatalogCourse,
  CourseCatalogSnapshot,
  CrossListingLink,
} from "./catalog";

