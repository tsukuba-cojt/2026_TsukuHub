import type { CourseCatalogSnapshot } from "../types";
import { tsukuba2023CatalogSnapshot } from "./tsukuba2023";
import { tsukuba2024CatalogSnapshot } from "./tsukuba2024";
import { tsukuba2025CatalogSnapshot } from "./tsukuba2025";
import { tsukuba2026CatalogSnapshot } from "./tsukuba2026";

export {
  tsukuba2023CatalogSnapshot,
  tsukuba2024CatalogSnapshot,
  tsukuba2025CatalogSnapshot,
  tsukuba2026CatalogSnapshot,
};

export const supportedCatalogAcademicYears = [2023, 2024, 2025, 2026] as const;

export const tsukubaCatalogSnapshots = {
  2023: tsukuba2023CatalogSnapshot,
  2024: tsukuba2024CatalogSnapshot,
  2025: tsukuba2025CatalogSnapshot,
  2026: tsukuba2026CatalogSnapshot,
} as const satisfies Record<
  (typeof supportedCatalogAcademicYears)[number],
  CourseCatalogSnapshot
>;
