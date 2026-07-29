import type { LucideIcon } from "lucide-react";

export type GuideArticle = {
  tag: string;
  title: string;
  description: string;
  meta: string;
  accent?: string;
};

export type GuideFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type CareerGuidePageProps = {
  theme: "blue" | "green" | "purple";
  eyebrow: string;
  title: string;
  lead: string;
  icon: LucideIcon;
  heroNote: string;
  featuresTitle: string;
  featuresLead: string;
  features: GuideFeature[];
  articlesTitle: string;
  articlesLead: string;
  articles: GuideArticle[];
  checklistTitle: string;
  checklist: string[];
  ctaTitle: string;
  ctaText: string;
  ctaLabel: string;
  ctaTo: string;
};
