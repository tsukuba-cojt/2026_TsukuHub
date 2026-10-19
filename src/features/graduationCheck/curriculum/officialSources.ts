import type { SourceDocument } from "./types";

/**
 * 現在保管している公式卒業要件PDF。
 * editionYear はPDFの版を表し、学生の入学年度を表すものではない。
 */
export const officialCurriculumSources = [
  {
    documentId: "tsukuba-graduation-requirements-2023",
    fileName: "2023.pdf",
    kind: "official_graduation_requirements",
    editionYear: 2023,
    pageCount: 120,
    sha256: "e3ba733af90a4e273fce25959f00bf6a07ab32c762153c5e69ce4213ef2ca647",
  },
  {
    documentId: "tsukuba-graduation-requirements-2024",
    fileName: "2024.pdf",
    kind: "official_graduation_requirements",
    editionYear: 2024,
    pageCount: 121,
    sha256: "506f814c8dfc630f414cff49f440ac59cf1fda64306d1581cbd605152ef94c54",
  },
  {
    documentId: "tsukuba-graduation-requirements-2025",
    fileName: "2025.pdf",
    kind: "official_graduation_requirements",
    editionYear: 2025,
    pageCount: 127,
    sha256: "54030f8fe0e8d9e096a20e408300381d8f03ccaec08efab0412833c95e890174",
  },
  {
    documentId: "tsukuba-graduation-requirements-2026",
    fileName: "2026.pdf",
    kind: "official_graduation_requirements",
    editionYear: 2026,
    pageCount: 127,
    sha256: "745bab5a17c7612ccdf8aa3e6df3b670e2f224b434e895c3d01b36c0d313030b",
  },
] as const satisfies readonly SourceDocument[];
