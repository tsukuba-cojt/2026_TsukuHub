import type { ClassGuideCategory } from "../data/classGuideCategories";
import type { PublishStatus } from "./content";

export type ClassGuideCoverTheme = "strategy" | "selection";

export type ClassGuideArticleRecord = {
  id: string;
  category: ClassGuideCategory;
  title: string;
  description: string;
  badge_label: string | null;
  cover_theme: ClassGuideCoverTheme;
  cover_image_url: string | null;
  content: string;
  read_minutes: number;
  sort_order: number;
  published_at: string;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
};
