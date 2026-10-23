import { supabase } from "../lib/supabase";
import type { CategoryKey } from "../features/graduationCheck";

export type ClassCategorizeInput = {
  className: string;
  categorized: CategoryKey;
  department: string;
};

const databaseCategory: Record<CategoryKey, string> = {
  compulsory: "compulsory",
  specialized: "specialized",
  specializedFoundation: "specialized_foundation",
  common: "common",
  related: "related",
};

const categoryFromDatabase = new Map<string, CategoryKey>(
  Object.entries(databaseCategory).map(([category, databaseValue]) => [
    databaseValue,
    category as CategoryKey,
  ]),
);

type ClassCategorizeRow = {
  classname: string;
  categorized: string;
  major: string;
};

/** 未分類科目について利用者が選んだ5区分をDBへ記録する。 */
export const saveClassCategorize = async (
  input: ClassCategorizeInput,
): Promise<void> => {
  const row = {
    classname: input.className.trim(),
    categorized: databaseCategory[input.categorized],
    // DBの列名は major だが、現在の仕様では「入力した人の学類」を保存する。
    major: input.department.trim(),
  };

  if (!row.classname || !row.major) {
    throw new Error("授業名と入力した人の学類は必須です。");
  }

  const { error } = await supabase.from("class_categorize").insert(row);
  if (error) throw error;
};

/** 科目名ごとの分類履歴を集計し、同じ学類を優先した一意な最多分類を返す。 */
export const getClassCategorizeSuggestions = async (
  classNames: string[],
  department: string,
): Promise<Map<string, CategoryKey>> => {
  const normalizedNames = [...new Set(classNames.map((name) => name.trim()).filter(Boolean))];
  const normalizedDepartment = department.trim();
  if (normalizedNames.length === 0) return new Map();

  const { data, error } = await supabase
    .from("class_categorize")
    .select("classname,categorized,major")
    .in("classname", normalizedNames);
  if (error) throw error;

  const rows = (data ?? []) as ClassCategorizeRow[];
  const suggestions = new Map<string, CategoryKey>();

  normalizedNames.forEach((className) => {
    const matchingRows = rows.filter((row) => row.classname.trim() === className);
    const sameDepartmentRows = matchingRows.filter(
      (row) => row.major.trim() === normalizedDepartment,
    );
    const candidateRows =
      sameDepartmentRows.length > 0 ? sameDepartmentRows : matchingRows;
    const counts = new Map<CategoryKey, number>();

    candidateRows.forEach((row) => {
      const category = categoryFromDatabase.get(row.categorized);
      if (category) counts.set(category, (counts.get(category) ?? 0) + 1);
    });

    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    if (ranked.length > 0 && (ranked.length === 1 || ranked[0][1] > ranked[1][1])) {
      suggestions.set(className, ranked[0][0]);
    }
  });

  return suggestions;
};
