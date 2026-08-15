import type { AlumniStoryRecord } from "../types/content";
import { paginateItems, timestamp, uniqueSorted } from "./listingSearch";

export type AlumniSortKey = "recommended" | "newest" | "year";

export type AlumniSearchQuery = {
  query: string;
  faculty: string | null;
  destination: string | null;
  jobRole: string | null;
  tag: string | null;
  sort: AlumniSortKey;
};

export const collectAlumniFacets = (stories: AlumniStoryRecord[]) => ({
  faculties: uniqueSorted(stories.map((story) => story.faculty)),
  destinations: uniqueSorted(stories.map((story) => story.destination)),
  jobRoles: uniqueSorted(stories.map((story) => story.job_role)),
  tags: uniqueSorted(stories.flatMap((story) => story.tags)),
});

const matchesQuery = (story: AlumniStoryRecord, query: string) => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    story.title,
    story.summary,
    story.faculty,
    story.destination,
    story.job_role,
    story.current_work,
    story.target_industries,
    story.challenge,
    story.actions,
    story.advice,
    ...story.tags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
};

export const isAlumniSearchFiltered = (query: AlumniSearchQuery) =>
  Boolean(
    query.query.trim() ||
      query.faculty ||
      query.destination ||
      query.jobRole ||
      query.tag,
  );

export const filterAlumniStories = (
  stories: AlumniStoryRecord[],
  query: AlumniSearchQuery,
) => {
  const filtered = stories.filter((story) => {
    if (query.faculty && story.faculty !== query.faculty) return false;
    if (query.destination && story.destination !== query.destination) return false;
    if (query.jobRole && story.job_role !== query.jobRole) return false;
    if (query.tag && !story.tags.includes(query.tag)) return false;
    return matchesQuery(story, query.query);
  });

  const sorted = [...filtered];
  if (query.sort === "newest") {
    sorted.sort((a, b) => timestamp(b.created_at) - timestamp(a.created_at));
  } else if (query.sort === "year") {
    sorted.sort((a, b) => b.graduation_year - a.graduation_year);
  }
  return sorted;
};

export const paginateAlumniStories = paginateItems;
