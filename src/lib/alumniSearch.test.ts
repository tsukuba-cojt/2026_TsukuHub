import { describe, expect, it } from "vitest";
import type { AlumniStoryRecord } from "../types/content";
import {
  collectAlumniFacets,
  filterAlumniStories,
  isAlumniSearchFiltered,
  paginateAlumniStories,
} from "./alumniSearch";

const story = (
  overrides: Partial<AlumniStoryRecord> & Pick<AlumniStoryRecord, "id" | "title">,
): AlumniStoryRecord => ({
  university_id: "u1",
  graduation_year: 2024,
  faculty: "情報学群",
  destination: "IT・SaaS業界",
  job_role: "エンジニア",
  summary: "要約",
  tags: ["長期インターン"],
  started_at: "",
  target_industries: "IT",
  challenge: "",
  actions: "",
  advice: "",
  current_work: "開発",
  cover_image_url: null,
  status: "published",
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
  ...overrides,
});

const stories = [
  story({ id: "a", title: "研究と開発", created_at: "2026-02-01", graduation_year: 2025 }),
  story({
    id: "b",
    title: "コンサルの仕事",
    faculty: "社会・国際学群",
    destination: "コンサルティング業界",
    job_role: "コンサルタント",
    tags: ["自己分析"],
    created_at: "2026-03-01",
    graduation_year: 2024,
  }),
];

describe("alumniSearch", () => {
  it("フリーワードでタイトルや職種を探す", () => {
    const result = filterAlumniStories(stories, {
      query: "コンサル",
      faculty: null,
      destination: null,
      jobRole: null,
      tag: null,
      sort: "recommended",
    });
    expect(result.map((item) => item.id)).toEqual(["b"]);
  });

  it("職種やタグで絞り込む", () => {
    const byRole = filterAlumniStories(stories, {
      query: "",
      faculty: null,
      destination: null,
      jobRole: "エンジニア",
      tag: null,
      sort: "recommended",
    });
    expect(byRole.map((item) => item.id)).toEqual(["a"]);
  });

  it("新着順に並べ替える", () => {
    const result = filterAlumniStories(stories, {
      query: "",
      faculty: null,
      destination: null,
      jobRole: null,
      tag: null,
      sort: "newest",
    });
    expect(result.map((item) => item.id)).toEqual(["b", "a"]);
  });

  it("ファセットと件数表示用のページングを返す", () => {
    expect(collectAlumniFacets(stories).jobRoles).toEqual(["エンジニア", "コンサルタント"]);
    expect(isAlumniSearchFiltered({
      query: "IT",
      faculty: null,
      destination: null,
      jobRole: null,
      tag: null,
      sort: "recommended",
    })).toBe(true);
    expect(paginateAlumniStories(stories, 1, 1)).toMatchObject({
      start: 1,
      end: 1,
      total: 2,
      pageCount: 2,
    });
  });
});
