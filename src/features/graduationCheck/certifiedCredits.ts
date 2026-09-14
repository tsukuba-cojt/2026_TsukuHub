/**
 * 認定単位（編入・検定など）を成績リストへ合成する
 *
 * TWINS の CSV には載らない「認」を、このツール上だけで足すための薄い層。
 * 判定自体は checkGraduation に任せる。
 */

import type { Course } from "./types";

export type CertifiedCredit = {
  /** 画面・保存用の一時 ID（科目番号ではない） */
  id: string;
  name: string;
  unit: number;
};

export const createCertifiedCredit = (
  name: string,
  unit: number
): CertifiedCredit => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `cert-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: name.trim(),
  unit,
});

/** 手追加の認定単位を grade=認 の Course として末尾に足す */
export const applyCertifiedCredits = (
  courses: Course[],
  extras: readonly CertifiedCredit[]
): Course[] => {
  if (extras.length === 0) return courses;
  const synthesized: Course[] = extras
    .filter((extra) => extra.name !== "" && extra.unit > 0)
    .map((extra) => ({
      id: "",
      name: extra.name,
      unit: extra.unit,
      grade: "認",
      year: 0,
    }));
  return [...courses, ...synthesized];
};
