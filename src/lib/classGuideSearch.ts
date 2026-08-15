import type { ClassGuideArticleRecord } from "../types/classGuide";
import { timestamp } from "./listingSearch";

export type ClassGuideSortKey = "recommended" | "newest";

export type ClassGuideSearchQuery = {
  query: string;
  sort: ClassGuideSortKey;
};

export const isClassGuideSearchFiltered = (query: ClassGuideSearchQuery) =>
  Boolean(query.query.trim());

export const filterClassGuideArticles = (
  articles: ClassGuideArticleRecord[],
  query: ClassGuideSearchQuery,
) => {
  const needle = query.query.trim().toLowerCase();
  const filtered = articles.filter((article) => {
    if (!needle) return true;
    const haystack = [
      article.title,
      article.description,
      article.badge_label ?? "",
      article.content,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });

  const sorted = [...filtered];
  if (query.sort === "newest") {
    sorted.sort((a, b) => timestamp(b.published_at) - timestamp(a.published_at));
  } else {
    sorted.sort(
      (a, b) =>
        a.sort_order - b.sort_order
        || timestamp(b.published_at) - timestamp(a.published_at),
    );
  }
  return sorted;
};
