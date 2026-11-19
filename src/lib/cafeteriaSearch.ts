import type {
  Cafeteria,
  CafeteriaCategory,
  CafeteriaHours,
  PaymentMethod,
} from "../components/life/mockCafeterias";

export type CafeteriaCategoryFilter = "all" | CafeteriaCategory;

export type CafeteriaPaymentFilter = "all" | PaymentMethod;

export type CafeteriaSortKey = "recommended" | "rating" | "reviews";

export type CafeteriaFilters = {
  category: CafeteriaCategoryFilter;
  openOnly: boolean;
  payment: CafeteriaPaymentFilter;
  sort: CafeteriaSortKey;
};

const PRIOR_RATING = 3.5;
const PRIOR_WEIGHT = 10;

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isOpenAt(hours: CafeteriaHours, day: number, minutes: number): boolean {
  return hours.slots.some(
    (slot) =>
      slot.days.includes(day) &&
      minutes >= toMinutes(slot.open) &&
      minutes < toMinutes(slot.close),
  );
}

export function isOpenNow(cafeteria: Cafeteria, now: Date): boolean {
  return isOpenAt(cafeteria.hours, now.getDay(), now.getHours() * 60 + now.getMinutes());
}

function recommendScore(cafeteria: Cafeteria): number {
  return (
    (cafeteria.rating * cafeteria.reviewCount + PRIOR_RATING * PRIOR_WEIGHT) /
    (cafeteria.reviewCount + PRIOR_WEIGHT)
  );
}

const comparators: Record<CafeteriaSortKey, (a: Cafeteria, b: Cafeteria) => number> = {
  recommended: (a, b) => recommendScore(b) - recommendScore(a),
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  reviews: (a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating,
};

export function searchCafeterias(
  cafeterias: Cafeteria[],
  filters: CafeteriaFilters,
  now: Date,
): Cafeteria[] {
  return cafeterias
    .filter((cafeteria) => filters.category === "all" || cafeteria.category === filters.category)
    .filter((cafeteria) => filters.payment === "all" || cafeteria.payments[filters.payment])
    .filter((cafeteria) => !filters.openOnly || isOpenNow(cafeteria, now))
    .sort(comparators[filters.sort]);
}
