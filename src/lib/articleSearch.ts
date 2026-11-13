import type { CareerArticleRecord } from "../types/content";
import { timestamp, uniqueSorted } from "./listingSearch";

export type ArticleSortKey = "recommended" | "newest";

export type ArticleSearchQuery = {
  query: string;
  category: string | null;
  sort: ArticleSortKey;
};

export const collectArticleFacets = (articles: CareerArticleRecord[]) => ({
  categories: uniqueSorted(articles.map((article) => article.category)),
});

const matchesQuery = (article: CareerArticleRecord, query: string) => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [article.title, article.description, article.category, article.content]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
};

export const isArticleSearchFiltered = (query: ArticleSearchQuery) =>
  Boolean(query.query.trim() || query.category);

export const filterCareerArticles = (
  articles: CareerArticleRecord[],
  query: ArticleSearchQuery,
) => {
  const filtered = articles.filter((article) => {
    if (query.category && article.category !== query.category) return false;
    return matchesQuery(article, query.query);
  });

  const sorted = [...filtered];
  if (query.sort === "newest") {
    sorted.sort((a, b) => timestamp(b.published_at) - timestamp(a.published_at));
  }
  return sorted;
};
