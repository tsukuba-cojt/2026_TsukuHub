import type { Internship } from "../types/career";
import { timestamp, uniqueSorted } from "./listingSearch";

export type InternshipSortKey = "recommended" | "newest" | "deadline";

export type InternshipSearchQuery = {
  query: string;
  jobCategory: string | null;
  location: string | null;
  workStyle: string | null;
  tag: string | null;
  remoteOnly: boolean;
  sort: InternshipSortKey;
};

export const collectInternshipFacets = (items: Internship[]) => ({
  jobCategories: uniqueSorted(items.map((item) => item.job_category)),
  locations: uniqueSorted(items.map((item) => item.location)),
  workStyles: uniqueSorted(items.map((item) => item.work_style)),
  tags: uniqueSorted(items.flatMap((item) => item.tags)),
  hasRemote: items.some((item) => item.is_remote),
});

const matchesQuery = (item: Internship, query: string) => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    item.title,
    item.summary,
    item.company_name,
    item.job_category,
    item.location,
    item.work_style,
    item.description,
    ...item.tags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
};

export const isInternshipSearchFiltered = (query: InternshipSearchQuery) =>
  Boolean(
    query.query.trim() ||
      query.jobCategory ||
      query.location ||
      query.workStyle ||
      query.tag ||
      query.remoteOnly,
  );

export const filterInternships = (items: Internship[], query: InternshipSearchQuery) => {
  const filtered = items.filter((item) => {
    if (query.jobCategory && item.job_category !== query.jobCategory) return false;
    if (query.location && item.location !== query.location) return false;
    if (query.workStyle && item.work_style !== query.workStyle) return false;
    if (query.tag && !item.tags.includes(query.tag)) return false;
    if (query.remoteOnly && !item.is_remote) return false;
    return matchesQuery(item, query.query);
  });

  const sorted = [...filtered];
  if (query.sort === "newest") {
    sorted.sort((a, b) => timestamp(b.created_at) - timestamp(a.created_at));
  } else if (query.sort === "deadline") {
    sorted.sort((a, b) => timestamp(a.deadline) - timestamp(b.deadline));
  } else {
    sorted.sort((a, b) => {
      const featured = Number(b.is_featured) - Number(a.is_featured);
      if (featured !== 0) return featured;
      return timestamp(b.created_at) - timestamp(a.created_at);
    });
  }
  return sorted;
};
