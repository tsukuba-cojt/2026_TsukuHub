import { describe, expect, it } from "vitest";
import type { Internship } from "../types/career";
import {
  collectInternshipFacets,
  filterInternships,
  isInternshipSearchFiltered,
} from "./internshipSearch";

const internship = (
  overrides: Partial<Internship> & Pick<Internship, "id" | "title">,
): Internship => ({
  company_name: "株式会社テスト",
  company_logo_url: null,
  cover_image_url: null,
  summary: "概要",
  company_description: "",
  job_category: "エンジニア",
  location: "つくば",
  work_style: "週3日",
  is_remote: false,
  work_conditions: "",
  compensation: "",
  description: "",
  requirements: "",
  preferred_skills: "",
  acquirable_skills: "",
  selection_process: "",
  tags: ["未経験歓迎"],
  deadline: "2026-12-01",
  status: "published",
  is_featured: false,
  created_by: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
  ...overrides,
});

describe("internshipSearch", () => {
  const items = [
    internship({ id: "a", title: "AIエンジニア", is_featured: true, created_at: "2026-01-01" }),
    internship({
      id: "b",
      title: "マーケティングインターン",
      job_category: "マーケティング",
      is_remote: true,
      created_at: "2026-03-01",
      deadline: "2026-06-01",
    }),
  ];

  it("キーワードとリモートで絞り込む", () => {
    const result = filterInternships(items, {
      query: "マーケ",
      jobCategory: null,
      location: null,
      workStyle: null,
      tag: null,
      remoteOnly: true,
      sort: "recommended",
    });
    expect(result.map((item) => item.id)).toEqual(["b"]);
    expect(
      isInternshipSearchFiltered({
        query: "",
        jobCategory: null,
        location: null,
        workStyle: null,
        tag: null,
        remoteOnly: true,
        sort: "recommended",
      }),
    ).toBe(true);
  });

  it("おすすめ順は注目求人を先にする", () => {
    const result = filterInternships(items, {
      query: "",
      jobCategory: null,
      location: null,
      workStyle: null,
      tag: null,
      remoteOnly: false,
      sort: "recommended",
    });
    expect(result.map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("新着順とファセットを返す", () => {
    expect(
      filterInternships(items, {
        query: "",
        jobCategory: null,
        location: null,
        workStyle: null,
        tag: null,
        remoteOnly: false,
        sort: "newest",
      }).map((item) => item.id),
    ).toEqual(["b", "a"]);
    expect(collectInternshipFacets(items).jobCategories).toEqual([
      "エンジニア",
      "マーケティング",
    ]);
  });
});
