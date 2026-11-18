export const LISTING_PAGE_SIZE = 20;

export const uniqueSorted = (values: string[]) =>
  [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "ja"),
  );

export const timestamp = (value: string) => {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export const paginateItems = <T,>(items: T[], page: number, pageSize = LISTING_PAGE_SIZE) => {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    start: items.length === 0 ? 0 : start + 1,
    end: Math.min(start + pageSize, items.length),
    total: items.length,
    pageCount: Math.max(1, Math.ceil(items.length / pageSize)),
  };
};
