import type { Course } from "./types";

/** 年度をまたぐ再履修と、固定カタログが示す同一授業を連結する。名称だけでは統合しない。 */
export const groupEquivalentCourses = (courses: readonly Course[]): Course[][] => {
  const parent = new Map<string, string>();
  const find = (id: string): string => {
    const current = parent.get(id);
    if (current === undefined) { parent.set(id, id); return id; }
    if (current === id) return id;
    const root = find(current);
    parent.set(id, root);
    return root;
  };
  const ids = courses.map((course, index) => course.id.trim().toUpperCase() || `unnumbered:${index}`);
  courses.forEach((course, index) => {
    const root = find(ids[index]);
    for (const equivalent of course.equivalentCourseIds ?? []) {
      if (equivalent.trim()) parent.set(find(equivalent.trim().toUpperCase()), root);
    }
  });
  const groups = new Map<string, Course[]>();
  courses.forEach((course, index) => {
    const root = find(ids[index]);
    const group = groups.get(root) ?? [];
    group.push(course);
    groups.set(root, group);
  });
  return [...groups.values()];
};
