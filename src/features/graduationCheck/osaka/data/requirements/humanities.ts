/**
 * 文学部・人間科学部・外国語学部
 */
import type { GradRequirementTable } from "../../../core/types";
import { buildOsakaRequirement, ENROLL_YEARS } from "./buildRequirement";

export const humanitiesRequirements: GradRequirementTable = {
  "osaka-letters-22": buildOsakaRequirement({
    department: "文学部",
    major: "文学部",
    enrollYear: ENROLL_YEARS,
    specKey: "letters",
  }),
  "osaka-human-sciences-22": buildOsakaRequirement({
    department: "人間科学部",
    major: "人間科学部",
    enrollYear: ENROLL_YEARS,
    specKey: "human-sciences",
  }),
  "osaka-foreign-lang-22": buildOsakaRequirement({
    department: "外国語学部",
    major: "外国語学部",
    enrollYear: ENROLL_YEARS,
    specKey: "foreign-lang",
  }),
};
