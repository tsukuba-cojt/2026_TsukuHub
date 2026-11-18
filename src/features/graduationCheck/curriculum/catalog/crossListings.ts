import type { CrossListingLink } from "./types";

const courseCodePattern = /(?<![0-9A-Z])[0-9A-Z]{7}(?![0-9A-Z])/g;
const sameCoursePhrasePattern = /([^。\n]{0,160})と同一/g;

const normalizeCourseCode = (value: string) => value.trim().toUpperCase();

/** KDBの備考にある「XXXXXXXと同一」から、参照先の科目番号を抽出する。 */
export const extractCrossListedCourseCodes = (
  courseCode: string,
  remarks: string
): string[] => {
  const normalizedCourseCode = normalizeCourseCode(courseCode);
  const matches = new Set<string>();

  for (const phrase of remarks.matchAll(sameCoursePhrasePattern)) {
    for (const rawCode of phrase[1].match(courseCodePattern) ?? []) {
      const code = normalizeCourseCode(rawCode);
      if (code !== normalizedCourseCode) matches.add(code);
    }
  }

  return [...matches].sort();
};

export const buildCrossListingGroups = (
  links: readonly CrossListingLink[]
): string[][] => {
  const parent = new Map<string, string>();

  const find = (courseCode: string): string => {
    const currentParent = parent.get(courseCode);
    if (currentParent === undefined) {
      parent.set(courseCode, courseCode);
      return courseCode;
    }
    if (currentParent === courseCode) return courseCode;
    const root = find(currentParent);
    parent.set(courseCode, root);
    return root;
  };

  const union = (left: string, right: string) => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parent.set(rightRoot, leftRoot);
  };

  for (const link of links) {
    union(
      normalizeCourseCode(link.courseCode),
      normalizeCourseCode(link.sameCourseCode)
    );
  }

  const grouped = new Map<string, string[]>();
  for (const courseCode of parent.keys()) {
    const root = find(courseCode);
    const group = grouped.get(root) ?? [];
    group.push(courseCode);
    grouped.set(root, group);
  }

  return [...grouped.values()]
    .map((group) => group.sort())
    .filter((group) => group.length > 1)
    .sort((left, right) => left[0].localeCompare(right[0]));
};

/**
 * 候補科目と同じ授業グループに禁止区分の科目があれば、その候補を返す。
 * 直接リンクだけでなく A=B, B=C のような推移関係もたどる。
 */
export const findCrossListedExclusions = (
  links: readonly CrossListingLink[],
  isCandidate: (courseCode: string) => boolean,
  isDisallowed: (courseCode: string) => boolean
): string[] => {
  const excluded = new Set<string>();
  for (const group of buildCrossListingGroups(links)) {
    if (!group.some(isDisallowed)) continue;
    group.filter(isCandidate).forEach((courseCode) => excluded.add(courseCode));
  }
  return [...excluded].sort();
};
