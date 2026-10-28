import type { Course } from "./types";

type GraduationCrossListingFile = {
  schema_version: "graduation-cross-listings-1.0.0";
  university: string;
  academic_year: number;
  groups: string[][];
};

export type GraduationCatalogVerification = {
  source: "transcript_academic_year";
  verifiedAcademicYears: number[];
  unsupportedAcademicYears: number[];
};

export class GraduationCatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GraduationCatalogError";
  }
}

const SUPPORTED_ACADEMIC_YEARS = new Set([2023, 2024, 2025, 2026]);
const crossListingIndexCache = new Map<
  string,
  Promise<Map<string, readonly string[]>>
>();

const loadCrossListingIndex = (
  universitySlug: string,
  academicYear: number,
) => {
  const key = `${universitySlug}:${academicYear}`;
  const cached = crossListingIndexCache.get(key);
  if (cached) return cached;

  const request = fetch(
    `/data/graduation/${universitySlug}-${academicYear}-cross-listings.json`,
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new GraduationCatalogError(
          `${academicYear}年度の卒業要件用授業データを取得できませんでした。`,
        );
      }
      const payload = (await response.json()) as GraduationCrossListingFile;
      if (
        payload.schema_version !== "graduation-cross-listings-1.0.0" ||
        payload.academic_year !== academicYear ||
        payload.university !== universitySlug
      ) {
        throw new GraduationCatalogError(
          `${academicYear}年度の卒業要件用授業データの形式が一致しません。`,
        );
      }
      const index = new Map<string, readonly string[]>();
      for (const group of payload.groups) {
        for (const courseCode of group) index.set(courseCode, group);
      }
      return index;
    })
    .catch((error) => {
      crossListingIndexCache.delete(key);
      throw error;
    });
  crossListingIndexCache.set(key, request);
  return request;
};

/**
 * 成績はブラウザ外へ送らず、年度別の静的JSONをローカル照合して同一授業番号を補う。
 * 対応範囲外の年度は従来どおり成績CSVの情報だけで判定する。
 */
export const attachCatalogEquivalencies = async (
  courses: readonly Course[],
  universitySlug: string,
): Promise<{
  courses: Course[];
  verification: GraduationCatalogVerification;
}> => {
  const transcriptAcademicYears = [
    ...new Set(courses.map((course) => course.year)),
  ].sort((left, right) => left - right);
  const academicYears = transcriptAcademicYears.filter((year) =>
    SUPPORTED_ACADEMIC_YEARS.has(year),
  );
  const unsupportedAcademicYears = transcriptAcademicYears.filter(
    (year) => !SUPPORTED_ACADEMIC_YEARS.has(year),
  );
  const indexes = new Map(
    await Promise.all(
      academicYears.map(async (year) => [
        year,
        await loadCrossListingIndex(universitySlug, year),
      ] as const),
    ),
  );

  return {
    courses: courses.map((course) => {
      const courseCode = course.id.trim().toUpperCase();
      const group = indexes.get(course.year)?.get(courseCode);
      if (!group) return course;
      return {
        ...course,
        equivalentCourseIds: group.filter(
          (equivalentCourseCode) => equivalentCourseCode !== courseCode,
        ),
      };
    }),
    verification: {
      source: "transcript_academic_year",
      verifiedAcademicYears: academicYears,
      unsupportedAcademicYears,
    },
  };
};
