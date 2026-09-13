import { universityAcademicOptions, type AcademicCategory } from "../../data/universityAcademicOptions";

export type ApplicationFormState = {
  applicant_name: string;
  email: string;
  phone: string;
  faculty: string;
  graduation_year: string;
  motivation: string;
  skills: string;
  portfolio_url: string;
  additional_notes: string;
};

export const emptyApplicationForm: ApplicationFormState = {
  applicant_name: "",
  email: "",
  phone: "",
  faculty: "",
  graduation_year: "",
  motivation: "",
  skills: "",
  portfolio_url: "",
  additional_notes: "",
};

export const textValue = (value: unknown) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
};

export const academicYearOf = (now = new Date()) =>
  now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;

export const programYearsFromCategory = (category: unknown) => {
  if (category === "doctor") return 3;
  if (category === "master" || category === "graduate") return 2;
  return 4;
};

export const graduationYearFromGrade = (
  grade: unknown,
  category: unknown,
  now = new Date(),
) => {
  const parsed = typeof grade === "number" ? grade : Number(grade);
  if (!Number.isInteger(parsed) || parsed < 1) return "";
  const programYears = programYearsFromCategory(category);
  return String(academicYearOf(now) + Math.max(programYears - parsed + 1, 1));
};

export const defaultsFromAccount = (
  profile: Record<string, unknown> | null,
  user: { email?: string | null; user_metadata?: Record<string, unknown> },
  now = new Date(),
) => {
  const meta = user.user_metadata ?? {};
  const category = textValue(profile?.category) || textValue(meta.category);
  return {
    applicant_name: textValue(profile?.name) || textValue(meta.name),
    email: textValue(user.email),
    faculty: textValue(profile?.major) || textValue(meta.major) || textValue(meta.school),
    graduation_year:
      textValue(profile?.graduation_year) ||
      graduationYearFromGrade(profile?.grade ?? meta.grade, category, now),
    category,
  };
};

const isAcademicCategory = (value: string): value is AcademicCategory =>
  value === "undergraduate" || value === "master" || value === "doctor";

export const facultyChoices = (
  universitySlug: string,
  category: string,
  currentFaculty = "",
) => {
  const structure = universityAcademicOptions[universitySlug];
  const level = isAcademicCategory(category) ? structure?.[category] : structure?.undergraduate;
  const options = (level?.options ?? []).flatMap((group) =>
    group.children.length > 0 ? group.children : [{ value: group.value, label: group.label }],
  );
  if (currentFaculty && !options.some((option) => option.value === currentFaculty)) {
    return [{ value: currentFaculty, label: currentFaculty }, ...options];
  }
  return options;
};

export const phoneDigits = (value: string) => value.replace(/\D/g, "");

export const isValidPhone = (value: string) => {
  const trimmed = value.trim();
  const digits = phoneDigits(trimmed);
  if (digits.length < 10 || digits.length > 15) return false;
  return /^[+]?[0-9\s\-()]{10,20}$/.test(trimmed);
};

export const normalizeHttpUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
};

export const validateApplicationForm = (form: ApplicationFormState) => {
  if (
    !form.applicant_name.trim() ||
    !form.email.trim() ||
    !form.phone.trim() ||
    !form.faculty.trim() ||
    !form.graduation_year ||
    !form.motivation.trim()
  ) {
    return "必須項目を入力してください。";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    return "メールアドレスの形式を確認してください。";
  }
  if (!isValidPhone(form.phone)) {
    return "電話番号の形式を確認してください。";
  }
  if (form.portfolio_url) {
    if (!normalizeHttpUrl(form.portfolio_url)) {
      return "ポートフォリオURLの形式を確認してください。";
    }
  }
  if (
    form.motivation.length > 2000 ||
    form.skills.length > 2000 ||
    form.additional_notes.length > 1000
  ) {
    return "入力できる文字数を超えています。";
  }
  return "";
};
