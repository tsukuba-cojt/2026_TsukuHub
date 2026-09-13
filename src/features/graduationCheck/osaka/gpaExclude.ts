import type { Course } from "../core/types";
import { SUB } from "./data/subGenreMaster";

/** KOAN-grade-analyzer 参考: 他学科・教免等は GPA 集計外 */
export const isOsakaGpaExcludedCourse = (course: Course): boolean => {
  const subGenre = course.subjectSubGenre ?? course.id.split("::")[1] ?? "";
  return (
    subGenre.includes("他学科") ||
    subGenre.includes("教免") ||
    course.id.includes(SUB.otherDept)
  );
};
