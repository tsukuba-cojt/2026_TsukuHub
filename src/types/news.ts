export type NewsItemKind = "news" | "topic";

export type NewsItemRecord = {
  id: string;
  kind: NewsItemKind;
  category: string;
  title: string;
  description: string;
  published_at: string;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  university_ids?: string[];
};

export type NewsItemInput = Omit<
  NewsItemRecord,
  "id" | "created_at" | "updated_at" | "university_ids"
>;
