import type { SourceDocument } from "../types";

export type CatalogCourse = {
  courseCode: string;
  courseName: string;
  credits: string;
  remarks: string;
};

export type CrossListingLink = {
  courseCode: string;
  sameCourseCode: string;
};

/**
 * 元CSV全体ではなく、卒業要件の解決に必要な同一授業関係だけを保持する成果物。
 * sourceDocument のハッシュから、使用したCSVを再現・監査できる。
 */
export type CourseCatalogSnapshot = {
  schemaVersion: "course-catalog-snapshot-1.0.0";
  academicYear: number;
  sourceDocument: SourceDocument & {
    kind: "course_catalog_snapshot";
    sha256: string;
    sourceUrl: string;
    repositoryCommit: string;
    snapshotDate: string;
  };
  sourceRowCount: number;
  courseCount: number;
  skippedRowCount: number;
  duplicateCourseCodeCount: number;
  parseWarningCount: number;
  crossListingLinks: readonly CrossListingLink[];
};
