/**
 * 卒業要件チェックエンジンのファクトリ
 */

import type { CourseCodeType } from "./courseCodeTypes";
import { createGpaCalculator, type GpaConfig } from "./gpa";
import type {
  CategoryKey,
  CategoryResult,
  CompulsoryResult,
  Course,
  GradRequirement,
  GradRequirementTable,
  GraduationCheckReport,
  RequirementId,
  SelectResult,
  UnitProgress,
} from "./types";
import { beginWithMatch, isFailed, sumUnits } from "./utils";

export type CategoryMapping = {
  groupLabelToCategory: Record<string, Exclude<CategoryKey, "compulsory">>;
  categoryLabels: Record<CategoryKey, string>;
  categoryOrder: readonly CategoryKey[];
};

export type SupportedDepartment = {
  key: string;
  label: string;
  majors: SupportedMajor[];
};

export type RequirementEntry = {
  admissionYears: number[];
  requirementId: RequirementId;
};

export type SupportedMajor = {
  key: string;
  label: string;
  requirements: RequirementEntry[];
};

export type GraduationEngineConfig = {
  courseCodeTypes: Record<string, CourseCodeType>;
  gradRequirementData: GradRequirementTable;
  categoryMapping: CategoryMapping;
  supportedDepartments: SupportedDepartment[];
  gpaConfig: GpaConfig;
  certifiedEnglishIds?: Record<string, string>;
  /** GPA・A率の集計から除外する科目（例: 他学科科目） */
  gpaExcludeCourse?: (course: Course) => boolean;
};

const toPercent = (earned: number, required: number): number =>
  required > 0 ? (earned / required) * 100 : 0;

const makeProgress = (
  requiredUnits: number,
  earnedUnits: number,
  prospectiveUnits: number
): UnitProgress => {
  const percent = toPercent(earnedUnits, requiredUnits);
  const prospectivePercent = toPercent(prospectiveUnits, requiredUnits);
  return {
    requiredUnits,
    earnedUnits,
    prospectiveUnits,
    percent,
    percentClamped: Math.min(percent, 100),
    prospectivePercent,
    prospectivePercentClamped: Math.min(prospectivePercent, 100),
  };
};

const parseAlternative = (
  entry: string
): { name: string; alternatives: string[] | null } => {
  if (!entry.includes("//")) return { name: entry, alternatives: null };
  const [name, altText] = entry.split("//");
  return {
    name,
    alternatives: JSON.parse(altText.replace(/'/g, '"')) as string[],
  };
};

export const createGraduationEngine = (config: GraduationEngineConfig) => {
  const {
    courseCodeTypes,
    gradRequirementData,
    categoryMapping: { groupLabelToCategory, categoryLabels, categoryOrder },
    supportedDepartments,
    gpaConfig,
    certifiedEnglishIds = {},
    gpaExcludeCourse,
  } = config;

  const { calcGpa, calcARatePercent, max: gpaMax } = createGpaCalculator(gpaConfig);

  const normalizeCertifiedCourses = (courses: Course[]): Course[] =>
    courses.map((course) =>
      course.grade === "認" && certifiedEnglishIds[course.name] !== undefined
        ? { ...course, id: certifiedEnglishIds[course.name] }
        : course
    );

  const expandCodes = (
    codes: readonly string[]
  ): { included: string[]; excepted: string[] } => {
    const included: string[] = [];
    const excepted: string[] = [];
    for (const code of codes) {
      if (code.startsWith("*")) {
        const tag = courseCodeTypes[code.slice(1)];
        if (!tag) continue;
        included.push(...tag.codes);
        excepted.push(...tag.except);
      } else {
        included.push(code);
      }
    }
    return { included, excepted };
  };

  const checkCompulsory = (
    courseListSource: Course[],
    requirement: GradRequirement
  ) => {
    const courseList = normalizeCertifiedCourses(courseListSource);
    const consumed = new Set<Course>();
    const compulsoryResults: CompulsoryResult[] = [];

    const takeByName = (name: string): Course[] => {
      const matched = courseList.filter(
        (course) => !consumed.has(course) && course.name === name
      );
      for (const course of matched) consumed.add(course);
      return matched;
    };

    for (const entry of requirement.courses.compulsory) {
      const { name, alternatives } = parseAlternative(entry);

      if (name.includes("::") && alternatives !== null) {
        const [label, unitText] = name.split("::");
        const minimumUnit = Number.parseInt(unitText, 10);
        const matched = alternatives.flatMap((courseName) => takeByName(courseName));
        compulsoryResults.push({
          name: label,
          isCourseGroup: true,
          passed: sumUnits(matched, true) >= minimumUnit,
          minimumUnit,
          courses: matched,
          alternative: alternatives.join(", "),
        });
        continue;
      }

      if (name.includes("::")) {
        const [tag, unitText] = name.split("::");
        const minimumUnit = Number.parseInt(unitText, 10);
        const tagConfig = courseCodeTypes[tag];
        const codes = tagConfig?.codes ?? [];
        const except = tagConfig?.except ?? [];
        const matched = courseList.filter(
          (course) =>
            !consumed.has(course) &&
            beginWithMatch(course.id, codes) &&
            !beginWithMatch(course.id, except)
        );
        for (const course of matched) consumed.add(course);
        compulsoryResults.push({
          name: tag,
          isCourseGroup: true,
          passed: sumUnits(matched, true) >= minimumUnit,
          minimumUnit,
          courses: matched,
        });
        continue;
      }

      const matched = takeByName(name);
      if (matched.length > 0) {
        compulsoryResults.push({
          name,
          isCourseGroup: false,
          passed: matched.some((course) => !isFailed(course.grade)),
          courses: matched,
        });
        continue;
      }

      if (alternatives !== null) {
        const altCourses = alternatives.flatMap((altName) => takeByName(altName));
        const allFound = alternatives.every((altName) =>
          altCourses.some((course) => course.name === altName)
        );
        compulsoryResults.push({
          name,
          isCourseGroup: false,
          passed:
            allFound && altCourses.every((course) => !isFailed(course.grade)),
          courses: altCourses,
          alternative: alternatives.join(", "),
        });
        continue;
      }

      compulsoryResults.push({
        name,
        isCourseGroup: false,
        passed: false,
        courses: [],
      });
    }

    return {
      compulsoryResults,
      remainingCourses: courseList.filter((course) => !consumed.has(course)),
    };
  };

  const countCompulsoryUnits = (
    compulsoryResults: CompulsoryResult[],
    includeTaking: boolean
  ): number => {
    let total = 0;
    for (const result of compulsoryResults) {
      const units = sumUnits(result.courses, includeTaking);
      total +=
        result.isCourseGroup && result.minimumUnit !== undefined
          ? Math.min(units, result.minimumUnit)
          : units;
    }
    return total;
  };

  const checkSelect = (courseList: Course[], requirement: GradRequirement) => {
    const consumed = new Set<Course>();
    const selectResults: SelectResult[] = [];

    for (const [
      codes,
      minimum,
      maximum,
      isExcludeRequirement,
      message,
      group,
      options,
    ] of requirement.courses.select) {
      const { included, excepted } = expandCodes(codes);

      const matchesRequirement = (course: Course): boolean => {
        const matchesPrefix =
          beginWithMatch(course.id, included) &&
          !beginWithMatch(course.id, excepted);
        const matchesName =
          options?.includeCourseNames?.includes(course.name) ?? false;
        const isExceptedName =
          options?.excludeCourseNames?.includes(course.name) ?? false;
        const isExceptedCode = beginWithMatch(
          course.id,
          options?.excludeCodes ?? []
        );
        const isExcepted = isExceptedName || isExceptedCode;
        const matchesConfiguredRule = matchesPrefix || matchesName;

        return isExcludeRequirement
          ? !matchesConfiguredRule || isExcepted
          : matchesConfiguredRule && !isExcepted;
      };

      const matched = courseList.filter(
        (course) => !consumed.has(course) && matchesRequirement(course)
      );
      for (const course of matched) consumed.add(course);

      selectResults.push({
        codes: [...codes],
        minimum,
        maximum,
        isExcludeRequirement,
        message,
        group,
        courses: matched,
      });
    }

    return {
      selectResults,
      leftCourses: courseList.filter((course) => !consumed.has(course)),
    };
  };

  const checkGraduation = (
    courses: Course[],
    requirementId: RequirementId
  ): GraduationCheckReport => {
    const requirement = gradRequirementData[requirementId];
    const { compulsorySumUnit, selectMinimumUnit, groups } = requirement.courses;

    const { compulsoryResults, remainingCourses } = checkCompulsory(
      courses,
      requirement
    );
    const { selectResults, leftCourses } = checkSelect(
      remainingCourses,
      requirement
    );

    const groupUnits = groups.map(([groupNo, minimum, maximum, label]) => {
      const groupResults = selectResults.filter(
        (result) => result.group === groupNo
      );
      const countGroupUnits = (includeTaking: boolean) => {
        const resultUnits = groupResults.map((result) => ({
          minimum: result.minimum,
          units: Math.min(
            sumUnits(result.courses, includeTaking),
            result.maximum
          ),
        }));
        const total = resultUnits.reduce(
          (sum, result) => sum + result.units,
          0
        );
        if (!requirement.courses.enforceSelectMinimums) {
          return Math.min(total, maximum);
        }

        const minimumShortage = resultUnits.reduce(
          (sum, result) => sum + Math.max(result.minimum - result.units, 0),
          0
        );
        const progressMaximum =
          minimumShortage > 0
            ? Math.max(minimum - minimumShortage, 0)
            : maximum;
        return Math.min(total, progressMaximum);
      };
      return {
        groupNo,
        minimum,
        maximum,
        label,
        earned: countGroupUnits(false),
        prospective: countGroupUnits(true),
      };
    });

    const compulsoryEarned = Math.min(
      countCompulsoryUnits(compulsoryResults, false),
      compulsorySumUnit
    );
    const compulsoryProspective = Math.min(
      countCompulsoryUnits(compulsoryResults, true),
      compulsorySumUnit
    );

    const categories: CategoryResult[] = [
      {
        category: "compulsory",
        label: categoryLabels.compulsory,
        ...makeProgress(
          compulsorySumUnit,
          compulsoryEarned,
          compulsoryProspective
        ),
      },
    ];
    const unmappedGroupUnits: Record<string, number> = {};
    for (const group of groupUnits) {
      const category = groupLabelToCategory[group.label];
      if (category === undefined) {
        unmappedGroupUnits[group.label] = group.prospective;
        continue;
      }
      categories.push({
        category,
        label: categoryLabels[category],
        maxUnits: group.maximum,
        ...makeProgress(group.minimum, group.earned, group.prospective),
      });
    }

    const requiredTotal = compulsorySumUnit + selectMinimumUnit;
    const selectEarned = Math.min(
      groupUnits.reduce((total, group) => total + group.earned, 0),
      selectMinimumUnit
    );
    const selectProspective = Math.min(
      groupUnits.reduce((total, group) => total + group.prospective, 0),
      selectMinimumUnit
    );
    const summaryProgress = makeProgress(
      requiredTotal,
      compulsoryEarned + selectEarned,
      compulsoryProspective + selectProspective
    );

    const gpaCourses = gpaExcludeCourse
      ? courses.filter((course) => !gpaExcludeCourse(course))
      : courses;
    const gpa = calcGpa(gpaCourses);

    return {
      requirement: { id: requirementId, ...requirement.header },
      summary: {
        ...summaryProgress,
        shortageUnits: Math.max(requiredTotal - summaryProgress.earnedUnits, 0),
        prospectiveShortageUnits: Math.max(
          requiredTotal - summaryProgress.prospectiveUnits,
          0
        ),
      },
      gpa: {
        value: gpa.value,
        max: gpaMax,
        targetUnits: gpa.targetUnits,
        aRatePercent: calcARatePercent(gpaCourses),
      },
      categories,
      details: {
        compulsoryResults,
        selectResults,
        uncountedCourses: leftCourses,
        unmappedGroupUnits,
      },
    };
  };

  const listSupportedRequirements = () =>
    Object.keys(gradRequirementData).map((id) => ({
      id,
      ...gradRequirementData[id].header,
    }));

  const resolveRequirementIds = (
    department: string,
    admissionYear: number | string
  ): RequirementId[] => {
    const normalize = (name: string) => name.replaceAll("・", "");
    const year = Number(admissionYear);
    if (!Number.isFinite(year)) return [];

    const supported = supportedDepartments.find(
      (candidate) => normalize(candidate.label) === normalize(department)
    );
    return (
      supported?.majors.flatMap((major) =>
        major.requirements
          .filter((requirement) => requirement.admissionYears.includes(year))
          .map((requirement) => requirement.requirementId)
      ) ?? []
    );
  };

  return {
    checkGraduation,
    checkCompulsory,
    checkSelect,
    countCompulsoryUnits,
    listSupportedRequirements,
    resolveRequirementIds,
    categoryLabels,
    categoryOrder,
    groupLabelToCategory,
  };
};

export const findDepartment = (
  supportedDepartments: SupportedDepartment[],
  key: string
) => supportedDepartments.find((department) => department.key === key);

export const findMajor = (
  departmentKey: string,
  majorKey: string,
  supportedDepartments: SupportedDepartment[]
) =>
  findDepartment(supportedDepartments, departmentKey)?.majors.find(
    (major) => major.key === majorKey
  );

export const resolveRequirementId = (
  departmentKey: string,
  majorKey: string,
  admissionYear: string,
  supportedDepartments: SupportedDepartment[]
): RequirementId | null => {
  const major = findMajor(departmentKey, majorKey, supportedDepartments);
  if (!major) return null;
  const year = Number(admissionYear);
  if (!Number.isFinite(year)) return null;
  return (
    major.requirements.find((requirement) =>
      requirement.admissionYears.includes(year)
    )?.requirementId ?? null
  );
};

export type AdmissionYearOption = {
  value: number;
  label: string;
  years: number[];
};

const toAdmissionYearOptions = (
  requirement: RequirementEntry
): AdmissionYearOption[] =>
  requirement.admissionYears.map((year) => ({
    value: year,
    label: `${year}年度`,
    years: [year],
  }));

export const listAdmissionYearOptions = (
  _supportedDepartments: SupportedDepartment[],
  department: SupportedDepartment | undefined,
  major: SupportedMajor | undefined
): AdmissionYearOption[] => {
  const requirements = major
    ? major.requirements
    : (department?.majors ?? []).flatMap((m) => m.requirements);
  const options = new Map<number, AdmissionYearOption>();
  for (const requirement of requirements) {
    for (const option of toAdmissionYearOptions(requirement)) {
      options.set(option.value, option);
    }
  }
  return [...options.values()].sort((a, b) => a.value - b.value);
};

export const listMajorAdmissionYears = (major: SupportedMajor): number[] =>
  [
    ...new Set(
      major.requirements.flatMap((requirement) => requirement.admissionYears)
    ),
  ].sort((a, b) => a - b);

export const listDepartmentAdmissionYears = (
  department: SupportedDepartment
): number[] =>
  [
    ...new Set(
      department.majors.flatMap((major) => listMajorAdmissionYears(major))
    ),
  ].sort((a, b) => a - b);
