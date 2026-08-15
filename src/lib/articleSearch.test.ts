import { describe, expect, it } from "vitest";
import type { CareerArticleRecord } from "../types/content";
import { collectArticleFacets, filterCareerArticles, isArticleSearchFiltered } from "./articleSearch";

const articles: CareerArticleRecord[] = [
  {
    id: "1",
    category: "就活準備",
    title: "就活はいつから？",
    description: "スケジュール",
    content: "",
    published_at: "2026-01-01",
    read_minutes: 5,
    status: "published",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
  {
    id: "2",
    category: "面接対策",
    title: "面接で伝える方法",
    description: "研究経験",
    content: "",
    published_at: "2026-03-01",
    read_minutes: 5,
    status: "published",
    created_at: "2026-03-01",
    updated_at: "2026-03-01",
  },
];

describe("articleSearch", () => {
  it("カテゴリーと新着順で探す", () => {
    expect(
      filterCareerArticles(articles, {
        query: "",
        category: "面接対策",
        sort: "recommended",
      }).map((item) => item.id),
    ).toEqual(["2"]);
    expect(
      filterCareerArticles(articles, { query: "", category: null, sort: "newest" }).map(
        (item) => item.id,
      ),
    ).toEqual(["2", "1"]);
    expect(collectArticleFacets(articles).categories).toEqual(["就活準備", "面接対策"]);
    expect(isArticleSearchFiltered({ query: "面接", category: null, sort: "recommended" })).toBe(
      true,
    );
  });
});
