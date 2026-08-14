export type AcademicOption = {
  value: string;
  label: string;
};
const tsukubaUndergraduate: AcademicOption[] = [
  "人文・文化学群",
  "社会・国際学群",
  "人間学群",
  "生命環境学群",
  "理工学群",
  "情報学群",
  "医学群",
  "体育専門学群",
  "芸術専門学群",
].map((label) => ({ value: label, label }));

const osakaUndergraduate: AcademicOption[] = [
  "文学部",
  "人間科学部",
  "外国語学部",
  "法学部",
  "経済学部",
  "理学部",
  "医学部",
  "歯学部",
  "薬学部",
  "工学部",
  "基礎工学部",
].map((label) => ({ value: label, label }));

export const universityAcademicOptions: Record<string, AcademicOption[]> = {
  tsukuba: tsukubaUndergraduate,
  osaka: osakaUndergraduate,
};
