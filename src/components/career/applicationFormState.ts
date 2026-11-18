export type ApplicationFormState = {
  applicant_name: string;
  email: string;
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
  faculty: "",
  graduation_year: "",
  motivation: "",
  skills: "",
  portfolio_url: "",
  additional_notes: "",
};

export const textValue = (value: unknown) =>
  typeof value === "string" ? value : "";

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
    !form.faculty.trim() ||
    !form.graduation_year ||
    !form.motivation.trim() ||
    !form.skills.trim()
  ) {
    return "必須項目を入力してください。";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    return "メールアドレスの形式を確認してください。";
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
