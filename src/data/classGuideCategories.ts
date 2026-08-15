export type ClassGuideCategory = "registration_strategy" | "course_selection";

export const classGuideCategories: Record<
  ClassGuideCategory,
  { label: string; slug: string; sectionLabel: string; description: string }
> = {
  registration_strategy: {
    label: "履修戦略",
    slug: "strategy",
    sectionLabel: "REGISTRATION",
    description: "履修登録の基本、留年防止、学群別の時間割の組み方",
  },
  course_selection: {
    label: "授業選び",
    slug: "selection",
    sectionLabel: "COURSE PICK",
    description: "おすすめ授業、科目区分の違い、低学年向けの選び方",
  },
};

export const classGuideCategoryFromSlug = (slug: string): ClassGuideCategory | null => {
  const entry = Object.entries(classGuideCategories).find(([, value]) => value.slug === slug);
  return entry ? (entry[0] as ClassGuideCategory) : null;
};
