import type { University } from "../types/university";

/** 管理画面の新規作成時デフォルト: 全アクティブ大学を掲載対象にする */
export const defaultAdminTargetUniversityIds = (universities: University[]) =>
  universities.filter((university) => university.status === "active").map((university) => university.id);
