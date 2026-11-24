import { searchQuery, type CourseFilters } from "../lib/courseSearch";
import type { CatalogCourse } from "../types/courseCatalog";
import { coursePath } from "./catalog";

export const defaultTitle = "TsukuHub｜大学生のためのキャンパス情報ポータル";
export const defaultDescription = "授業、サークル、就活、生活情報まで。大学生に必要な情報をまとめて見つけられるキャンパス情報ポータル。";

export type PageMetadata = {
  title: string;
  description: string;
  path: string;
  type?: "article";
};

export function homeMetadata(slug: string, name: string): PageMetadata {
  return { title: `${name}の授業・履修・就活情報｜TsukuHub`, path: `/${slug}`,
    description: `${name}の学生向けに、授業・履修ガイドや就活・インターンの情報を紹介します。` };
}

export function courseMetadata(slug: string, name: string, course: CatalogCourse, year: number): PageMetadata {
  return {
    title: `${course.course_name}（${course.course_number}）｜${name}・${year}年度｜TsukuHub`,
    description: [name, `${year}年度`, course.course_name, course.instructor, course.semester, course.overview]
      .filter(Boolean).join(" ").replace(/\s+/g, " ").slice(0, 160),
    path: coursePath(slug, course.course_number, year),
  };
}

export function guideMetadata(slug: string, name: string, article: { id: string; title: string; description: string }): PageMetadata {
  return { title: `${article.title}｜${name}の履修ガイド｜TsukuHub`, description: article.description || article.title,
    path: `/${slug}/class/guide/${encodeURIComponent(article.id)}`, type: "article" };
}

export function listMetadata(slug: string, name: string, filters: CourseFilters, page: number): PageMetadata {
  return {
    title: `${name}の授業検索｜${filters.academicYear}年度${page > 1 ? `・${page}ページ目` : ""}｜TsukuHub`,
    description: `${name}の${filters.academicYear}年度の授業を、科目名・教員名・開講時期などから探せます。`,
    path: `/${slug}/class${searchQuery(filters, page)}`,
  };
}

export function classTopMetadata(slug: string, name: string): PageMetadata {
  return { title: `${name}の授業・履修ガイド｜TsukuHub`, path: `/${slug}/class/top`,
    description: `${name}の授業検索と、履修登録・授業選びに役立つガイドをまとめています。` };
}
