export const supportedNormalizedAdmissionYears = [2023, 2024, 2025, 2026] as const;

export const normalizedCurriculumScope = {
  admissionYearFrom: 2023,
  admissionYearTo: 2026,
  includesExtendedEnrollment: false,
} as const;

export const isSupportedNormalizedAdmissionYear = (year: number) =>
  supportedNormalizedAdmissionYears.some(
    (supportedYear) => supportedYear === year
  );
