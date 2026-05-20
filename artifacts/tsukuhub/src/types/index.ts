export const CATEGORIES = [
  "就活・キャリア",
  "授業・履修",
  "サークル・課外活動",
  "生活・便利情報",
  "イベント・お知らせ",
  "留学・国際交流"
] as const;

export type Category = typeof CATEGORIES[number];

export interface ContentItem {
  id: string;
  title: string;
  category: Category;
  tags: string[];
  summary: string;
  body: string;
  updatedAt: string;
  isBookmarked?: boolean;
  // Course-specific
  instructor?: string;
  semester?: string;
  schedule?: string;
  credits?: number;
  ratings?: {
    overall: number;
    difficulty: number;
    workload: number;
    attendance: number;
  };
  testFormat?: string;
  reviews?: Review[];
}

export interface Review {
  id: string;
  author: string;
  overall: number;
  difficulty: number;
  workload: number;
  attendance: number;
  testFormat: string;
  studyMethod: string;
  comment: string;
  createdAt: string;
}
