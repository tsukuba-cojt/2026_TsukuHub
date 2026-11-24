export type AcademicOption = {
  value: string;
  label: string;
};


export type AcademicGroupOption = AcademicOption & {
  children: AcademicOption[];
};


export type AcademicLevel = {
  groupLabel: string;
  childLabel?: string;
  options: AcademicGroupOption[];
};

export type AcademicCategory = "undergraduate" | "master" | "doctor";

export type UniversityAcademicStructure = Partial<Record<AcademicCategory, AcademicLevel>>;

const toGroup = (label: string, children: string[]): AcademicGroupOption => ({
  value: label,
  label,
  children: children.map((child) => ({ value: child, label: child })),
});

const tsukubaUndergraduate: AcademicLevel = {
  groupLabel: "学群",
  childLabel: "学類",
  options: [
    toGroup("人文・文化学群", ["人文学類", "比較文化学類", "日本語・日本文化学類"]),
    toGroup("社会・国際学群", ["社会学類", "国際総合学類"]),
    toGroup("人間学群", ["教育学類", "心理学類", "障害科学類"]),
    toGroup("生命環境学群", ["生物学類", "生物資源学類", "地球学類"]),
    toGroup("理工学群", [
      "数学類",
      "物理学類",
      "化学類",
      "応用理工学類",
      "工学システム学類",
      "社会工学類",
    ]),
    toGroup("情報学群", ["情報科学類", "情報メディア創成学類", "知識情報・図書館学類"]),
    toGroup("医学群", ["医学類", "看護学類", "医療科学類"]),
    toGroup("体育専門学群", ["体育専門学群"]),
    toGroup("芸術専門学群", ["芸術専門学群"]),
    toGroup("総合学域群", ["総合学域群"]),
  ],
};

const tsukubaGraduate: AcademicLevel = {
  groupLabel: "学術院",
  childLabel: "研究群・専攻",
  options: [
    toGroup("人文社会ビジネス科学学術院", [
      "人文社会科学研究群",
      "ビジネス科学研究群",
      "法曹専攻",
      "国際経営プロフェッショナル専攻",
    ]),
    toGroup("理工情報生命学術院", [
      "数理物質科学研究群",
      "システム情報工学研究群",
      "生命地球科学研究群",
      "国際連携持続環境科学専攻",
    ]),
    toGroup("人間総合科学学術院", [
      "人間総合科学研究群",
      "スポーツ国際開発学共同専攻",
      "大学体育スポーツ高度化共同専攻",
      "国際連携食料健康科学専攻",
    ]),
    toGroup("グローバル教育院", ["ヒューマニクス学位プログラム"]),
  ],
};

const osakaUndergraduate: AcademicLevel = {
  groupLabel: "所属",
  options: [
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
  ].map((label) => toGroup(label, [])),
};

export const universityAcademicOptions: Record<string, UniversityAcademicStructure> = {
  tsukuba: {
    undergraduate: tsukubaUndergraduate,
    master: tsukubaGraduate,
    doctor: tsukubaGraduate,
  },
  osaka: {
    undergraduate: osakaUndergraduate,
    master: osakaUndergraduate,
    doctor: osakaUndergraduate,
  },
};
