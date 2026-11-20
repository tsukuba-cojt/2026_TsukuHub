export const AVATAR_COLOR_KEYS = [
  "gray",
  "blue",
  "purple",
  "pink",
  "orange",
  "yellow",
  "green",
  "teal",
] as const;

export type AvatarColor = (typeof AVATAR_COLOR_KEYS)[number];

export const DEFAULT_AVATAR_COLOR: AvatarColor = "gray";

export const AVATAR_COLORS: Record<
  AvatarColor,
  { label: string; background: string; silhouette: string }
> = {
  gray: {
    label: "グレー",
    background: "linear-gradient(151deg, #d9d9d9 0%, #bdbdbd 100%)",
    silhouette: "#666666",
  },
  blue: { label: "ブルー", background: "#1578FD", silhouette: "#FFFFFF" },
  purple: { label: "パープル", background: "#6958EB", silhouette: "#FFFFFF" },
  pink: { label: "ピンク", background: "#E8508A", silhouette: "#FFFFFF" },
  orange: { label: "オレンジ", background: "#EC7A1C", silhouette: "#FFFFFF" },
  yellow: { label: "イエロー", background: "#D99A00", silhouette: "#FFFFFF" },
  green: { label: "グリーン", background: "#1E9E6E", silhouette: "#FFFFFF" },
  teal: { label: "ティール", background: "#0FA3B1", silhouette: "#FFFFFF" },
};

export const GENDER_KEYS = ["male", "female", "other", "unspecified"] as const;

export type Gender = (typeof GENDER_KEYS)[number];

export const DEFAULT_GENDER: Gender = "unspecified";

export const GENDER_LABELS: Record<Gender, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
  unspecified: "回答しない",
};

export const normalizeAvatarColor = (value: unknown): AvatarColor =>
  typeof value === "string" && (AVATAR_COLOR_KEYS as readonly string[]).includes(value)
    ? (value as AvatarColor)
    : DEFAULT_AVATAR_COLOR;

export const normalizeGender = (value: unknown): Gender =>
  typeof value === "string" && (GENDER_KEYS as readonly string[]).includes(value)
    ? (value as Gender)
    : DEFAULT_GENDER;
