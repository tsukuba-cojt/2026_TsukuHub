import type { GradRequirement, GradRequirementTable } from "../../types";

type HumanHealthArtsRequirementId =
  | "education-22"
  | "education-23"
  | "psychology-22"
  | "psychology-23"
  | "disability-22"
  | "disability-23"
  | "medicine-22"
  | "medicine-26"
  | "new-medicine-22"
  | "new-medicine-26"
  | "nursing-22"
  | "nursing-25"
  | "nursing-26"
  | "public-health-nursing-22"
  | "public-health-nursing-25"
  | "public-health-nursing-26"
  | "medical-science-22"
  | "medical-science-24"
  | "medical-science-25"
  | "medical-science-26"
  | "international-medical-science-22"
  | "international-medical-science-24"
  | "international-medical-science-25"
  | "international-medical-science-26"
  | "physical-education-22"
  | "physical-education-26"
  | "art-studies-22"
  | "japanese-art-22";

type RequirementSpec = {
  department: string;
  major: string;
  enrollYear?: number | string;
  compulsory: string[];
  compulsorySumUnit: number;
  selectMinimumUnit: number;
  minimums: [number, number, number, number];
  maximums: [number, number, number, number];
  specializedCodes?: string[];
  foundationCodes?: string[];
  selectRules?: GradRequirement["courses"]["select"];
};

const buildCommonRules = (
  commonMaximum: number,
): GradRequirement["courses"]["select"] => [
  [["*学士基盤科目"], 1, commonMaximum, false, "学士基盤科目", 2],
  [
    ["*体育", "*外国語", "*情報", "*国語", "*芸術"],
    0,
    commonMaximum,
    false,
    "その他の共通科目",
    2,
  ],
];

const buildRequirement = (spec: RequirementSpec): GradRequirement => {
  const [specialized, foundation, common, related] = spec.minimums;
  const [specializedMax, foundationMax, commonMax, relatedMax] = spec.maximums;
  const specializedCodes = spec.specializedCodes ?? [];
  const foundationCodes = spec.foundationCodes ?? [];
  const ownCodes = [...specializedCodes, ...foundationCodes];
  return {
    header: {
      department: spec.department,
      major: spec.major,
      enrollYear: spec.enrollYear ?? "2022~2026",
    },
    courses: {
      compulsory: spec.compulsory,
      compulsorySumUnit: spec.compulsorySumUnit,
      select: spec.selectRules ?? [
        [specializedCodes, specialized, specializedMax, false, `${spec.major}の専門科目`, 0],
        [foundationCodes, foundation, foundationMax, false, `${spec.department}の専門基礎科目`, 1],
        ...buildCommonRules(commonMax),
        [
          [...ownCodes, "*総合科目", "*体育", "*外国語", "*情報", "*国語", "*芸術", "*教職に関する科目", "*博物館に関する科目"],
          related,
          relatedMax,
          true,
          "他学群・他学類等の関連科目",
          3,
        ],
      ],
      selectMinimumUnit: spec.selectMinimumUnit,
      enforceSelectMinimums: true,
      groups: [
        [0, specialized, specializedMax, "専門科目選択"],
        [1, foundation, foundationMax, "専門基礎科目選択"],
        [2, common, commonMax, "共通科目選択"],
        [3, related, relatedMax, "関連科目選択"],
      ],
    },
  };
};

const physicalEducationSelectRules = (): GradRequirement["courses"]["select"] => [
  [
    ["W1"],
    28,
    43,
    false,
    "体育専門学群の専門科目",
    0,
    {
      minimumIncludedUnits: [
        { codes: ["W15"], minimum: 10, label: "分野別専門科目" },
        { codes: ["W16"], minimum: 7, label: "キャリア支援科目" },
        { codes: ["W18"], minimum: 6, label: "卒業研究領域科目" },
      ],
    },
  ],
  [
    ["W8", "W9"],
    31,
    39,
    false,
    "体育専門学群の専門基礎科目",
    1,
    {
      minimumIncludedUnits: [
        { codes: ["W87"], minimum: 10, label: "体育・スポーツ学領域科目" },
        { codes: ["W88"], minimum: 4, label: "コーチング学領域科目" },
        { codes: ["W89"], minimum: 10, label: "健康体力学領域科目" },
        { codes: ["W91"], minimum: 1, label: "実技理論・実習A群" },
        { codes: ["W92"], minimum: 1, label: "実技理論・実習B群" },
        { codes: ["W93"], minimum: 1, label: "実技理論・実習C群" },
        { codes: ["W94"], minimum: 1, label: "実技理論・実習D群" },
        { codes: ["W95"], minimum: 1, label: "実技理論・実習E群" },
        { codes: ["W96"], minimum: 1, label: "実技理論・実習F群" },
        { codes: ["W97"], minimum: 1, label: "実技理論・実習G群" },
      ],
    },
  ],
  ...buildCommonRules(10),
  [
    [
      "W1",
      "W8",
      "W9",
      "*総合科目",
      "*体育",
      "*外国語",
      "*情報",
      "*国語",
      "*芸術",
      "*教職に関する科目",
      "*博物館に関する科目",
    ],
    12,
    25,
    true,
    "他学群・他学類等の関連科目",
    3,
  ],
];

const physicalEducationRequirement = (
  version: "2022~2025" | 2026,
): GradRequirement =>
  buildRequirement({
    department: "体育専門学群",
    major: "体育学主専攻",
    enrollYear: version,
    compulsory: [
      "体育専門語学B::2",
      "卒業研究",
      "保健体育科(体力づくり運動)指導法",
      "種目別コーチング演習I～II::3//['種目別コーチング演習I', '種目別コーチング演習II']",
      ...(version === 2026
        ? ["スポーツキャリア形成A", "スポーツキャリア形成B"]
        : [
            "スポーツキャリア形成I",
            "スポーツキャリア形成II",
            "スポーツキャリア形成III",
          ]),
      "体育専門語学A::1",
      "体育専門基礎共通演習::1",
      "体育科学シンポジウム",
      "体育専門英語基礎演習::1",
      ...(version === 2026 ? ["体育実技H群::2"] : ["臨海実習"]),
      "テーピング・マッサージ",
      "ファーストイヤーセミナー",
      "学問への誘い",
      "外国語::4",
      "情報::4",
      "国語::2",
    ],
    compulsorySumUnit: 33,
    selectMinimumUnit: 91,
    minimums: [28, 31, 1, 12],
    maximums: [43, 39, 10, 25],
    selectRules: physicalEducationSelectRules(),
  });

// 公式表の「YAで始まる基礎演習／概論」を固定KdB 2023〜2026の番号で照合。
// 2023のデジタル写真(YAL1013)と2024以降(YAL1022)は同じ条件に含める。
const artBasicPracticeCodes = [
  "YAC1012", "YAC1112", "YAC1122", "YAD1012", "YAE1022", "YAE1112", "YAE1122",
  "YAF1012", "YAF1022", "YAF1032", "YAG1012", "YAG1022", "YAH1012", "YAH1022",
  "YAH1032", "YAJ1022", "YAK1012", "YAL1012", "YAL1013", "YAL1022", "YAN1012",
  "YAP1012", "YAQ1012",
];
const artIntroductionCodes = "ABCDEFGHJKLNPQ".split("").map((letter) => `YA${letter}1011`);
const artOtherSpecializedCodes = ["AB90", "AB93", "AC50", "AC60"];
const artSpecifiedSpecializedCodes = ["FG45901", "FH45051", "FH45061", "FH45071"];

const artSelectRules = (japanese: boolean): GradRequirement["courses"]["select"] => [
  [["YB"], 40, 64, false, "YB専門科目", 0],
  [artOtherSpecializedCodes, 0, 15, false, "AB90・AB93・AC50・AC60専門科目", 0],
  [artSpecifiedSpecializedCodes, 0, 5, false, "FG・FH指定専門科目", 0],
  // 3指定群の計8（日本芸術7）単位をYA全体の内数として判定する。
  // 残り5〜12単位にもYAを使えるが、同じ単位を合計へ二重加算しない。
  [["YA"], japanese ? 12 : 13, japanese ? 19 : 20, false, "YA専門基礎科目", 1, {
    minimumIncludedUnits: [
      { codes: ["YAZ"], minimum: 2, label: "美術史概説・デザイン史概説" },
      { codes: artBasicPracticeCodes, minimum: 3, label: "YA基礎演習" },
      { codes: artIntroductionCodes, minimum: japanese ? 2 : 3, label: "YA概論" },
    ],
  }],
  [["*学士基盤科目"], 1, 3, false, "学士基盤科目", 2],
  [["*体育"], 0, 2, false, "選択体育", 2],
  [[japanese ? "*日本語" : "*英語"], 0, 4, false, "選択第1外国語", 2],
  [["*初修外国語"], 0, 4, false, "選択第2外国語", 2, { excludeCodes: japanese ? ["39"] : [] }],
  [["*国語"], 0, 2, false, "選択国語", 2],
  [["*芸術"], 0, 3, false, "選択芸術", 2],
  [["*教職に関する科目", "*博物館に関する科目", "*自由科目特設"], 0, 18, false, "教職・博物館・特設関連科目", 3],
  [["E", "F"], 2, 14, false, "E・F系関連科目", 3,
    { excludeCodes: artSpecifiedSpecializedCodes }],
  [["YA", "YB", ...artOtherSpecializedCodes, ...artSpecifiedSpecializedCodes,
    "E", "F", "*総合科目", "*自由科目特設", "*教職に関する科目", "*博物館に関する科目"],
    japanese ? 3 : 4, 18, true, "他学群・他学類の関連科目", 3],
  // 指定一覧が未固定のため、他科目で自動代替せず不足として残す。
  ...(japanese ? [
    [[], 1, 1, false, "Japan-Expert共通科目（芸術を除く・指定一覧要確認）", 3] as GradRequirement["courses"]["select"][number],
  ] : []),
];

const artRequirement = (japanese: boolean): GradRequirement => buildRequirement({
  department: "芸術専門学群",
  major: japanese ? "日本芸術主専攻" : "芸術学主専攻",
  compulsory: [
    "芸術卒業研究::6", "芸術領域研究I::1", "芸術領域研究II::1",
    "芸術領域特別演習I::1", "芸術領域特別演習II::1", "芸術領域特別演習III::1",
    ...(japanese ? ["インターンシップ"] : []),
    "芸術キャリア教育",
    "アート&デザイン入門::1//['アート&デザイン入門', 'アート＆デザイン入門']",
    "芸術と文化", "芸術と社会",
    ...(japanese ? ["Japan-Expert総論"] : [
      "芸術基礎演習::1//['芸術基礎演習A', '芸術基礎演習B', '芸術基礎演習C']",
    ]),
    ...(japanese ? ["Japan-Expertファーストイヤーセミナー"] : ["ファーストイヤーセミナー"]),
    "学問への誘い", "体育::2", japanese ? "日本語::15" : "英語::4", "情報::4",
  ],
  compulsorySumUnit: japanese ? 41 : 28,
  selectMinimumUnit: japanese ? 95 : 96,
  minimums: [50, japanese ? 12 : 13, 1, 6],
  maximums: [64, japanese ? 19 : 20, 12, 24],
  selectRules: artSelectRules(japanese),
});

const humanCommon = ["ファーストイヤーセミナー", "学問への誘い", "体育::2", "外国語::7", "情報::4"];
const medicalCommon = ["ファーストイヤーセミナー", "学問への誘い", "体育::2", "英語::4", "情報::4", "国語::1"];
const medicalScienceCommon = ["ファーストイヤーセミナー", "学問への誘い", "体育::2", "英語::4", "情報::4"];

const medicalFoundationSelections = [
  "力学1",
  "電磁気学1",
  "生物学I",
  "生物学II",
  "化学2",
  "化学3",
  "医科生化学",
];

const medicalRelatedScienceCodes = [
  "FA", "FB", "FC", "FE", "FF", "FG", "GA", "GB", "GC", "EB",
];

const medicalCompulsory = (
  major: "medicine" | "new-medicine",
  academicEnglish: "TOEFL演習" | "学術英語",
): string[] => [
  "医学統計学",
  "医療・福祉現場でのふれあい等",
  "医療概論I",
  "医療概論I-B",
  "医学の基礎",
  "医学の基礎B",
  "医科分子生物学",
  "機能・構造と病態I",
  "医療概論II",
  "English Medical Terminology I",
  "機能・構造と病態II",
  "医療概論III",
  "English Medical Terminology II",
  "クリニカル・クラークシップ準備学習",
  "社会医学実習",
  "M4クリニカル・クラークシップ(Phase IA)",
  "医療概論IV",
  "アドヴァンストコース",
  "M5クリニカル・クラークシップ (Phase IB、Phase IIA)",
  ...(major === "medicine"
    ? [
        "M6クリニカル・クラークシップ (Phase IIB)",
        "M6アドヴァンスト・エレクティヴズ",
      ]
    : ["研究室実習"]),
  "医療概論V",
  "医学総括",
  "Clinical Communication in English I",
  "Clinical Communication in English II",
  academicEnglish,
  ...medicalCommon,
];

const medicalSelectRules = (): GradRequirement["courses"]["select"] => [
  [
    [],
    5,
    5,
    false,
    "医学類が指定する専門基礎科目",
    1,
    { includeCourseNames: medicalFoundationSelections },
  ],
  ...buildCommonRules(1),
  [
    ["HB"],
    1,
    1,
    false,
    "医学類が開設する関連科目",
    3,
    { excludeCourseNames: medicalFoundationSelections },
  ],
  [
    medicalRelatedScienceCodes,
    2,
    2,
    false,
    "指定された自然科学系の関連科目",
    3,
    { excludeCourseNames: medicalFoundationSelections },
  ],
  [["A", "B", "C"], 2, 2, false, "A・B・Cで始まる関連科目", 3],
  [
    ["A", "B", "C", "E", "F", "G", "H", "V", "W", "Y"],
    2,
    2,
    false,
    "他学群・他学類が開設する関連科目",
    3,
    { excludeCourseNames: medicalFoundationSelections },
  ],
];

const medicineRequirement = (
  enrollYear: number | string,
  major: "medicine" | "new-medicine",
  academicEnglish: "TOEFL演習" | "学術英語",
): GradRequirement =>
  buildRequirement({
    department: "医学類",
    major: major === "medicine" ? "医学主専攻" : "新医学主専攻",
    enrollYear,
    compulsory: medicalCompulsory(major, academicEnglish),
    compulsorySumUnit: 186,
    selectMinimumUnit: 13,
    minimums: [0, 5, 1, 7],
    maximums: [0, 5, 1, 7],
    selectRules: medicalSelectRules(),
  });

const nursingSpecializedBase = (asciiParentheses: boolean): string[] => [
  "基礎看護学概論",
  "基本看護技術",
  "基本看護技術演習",
  "フィジカルアセスメント",
  "看護過程",
  "看護生命倫理",
  "看護技術実習",
  "看護過程実習",
  "臨床看護学概論",
  "臨床看護方法論",
  "臨床看護学実習(クリティカルケア)",
  "臨床看護学実習(セルフケア)",
  "生涯発達と家族支援",
  "子どもの発達支援学概論",
  "子どもの発達支援方法論",
  asciiParentheses
    ? "子どもの発達支援実習(保育所・施設ふれあい実習)"
    : "子どもの発達支援実習（保育所・施設ふれあい実習）",
  asciiParentheses
    ? "子どもの発達支援実習(病院実習)"
    : "子どもの発達支援実習（病院実習）",
  "ウィメンズヘルス看護学概論",
  "ウィメンズヘルス看護学方法論",
  "ウィメンズヘルス看護学実習",
  "高齢者看護学概論",
  "高齢者看護方法論",
  "高齢者看護学実習",
  "地域・在宅看護論",
  "地域・在宅看護方法論",
  "地域・在宅看護論実習",
  "公衆衛生看護学概論",
  "職域における保健活動",
  "精神看護学概論",
  "精神看護方法論",
  "家族病理とメンタルヘルス",
  "精神看護学実習",
  "ヘルスプロモーションと看護",
  "災害看護学",
  "看護マネジメント",
  "国際看護学",
  "応用看護学演習I(OSCE)",
  "応用看護学演習II(IBT)",
  "研究方法概論",
  "看護学探究概説",
  "ヘルスプロモーション実習I",
  "ヘルスプロモーション実習II",
  "医療チーム連携演習",
  "応用看護学実習",
];

const nursingFoundationCompulsory = [
  "人間関係論",
  "心の健康と相談活動",
  "行動科学",
  "看護専門英語",
  "コミュニティ・エンパワメント論",
  "人体機能学",
  "人体構造学",
  "人体の代謝と栄養",
  "臨床薬理学",
  "遺伝と健康",
  "微生物学",
  "疾病の治療と看護I",
  "疾病の治療と看護II",
  "子どもの健康と障害",
  "老化と健康",
  "医療・生命科学とテクノロジー",
  "保健統計学",
  "保健医療福祉行政論I",
  "保健医療福祉行政論II",
  "疫学",
  "障害理解",
  "国際保健学",
];

const publicHealthNursingCourses = [
  "公衆衛生看護活動論",
  "公衆衛生看護活動方法論",
  "公衆衛生看護学応用論",
  "公衆衛生看護管理論",
  "公衆衛生看護学実習",
];

const nursingPhilosophyRequirement =
  "哲学通論（全学群対象）::2//['哲学通論BII', '哲学通論CI', '哲学通論-a', '哲学通論-b']";

const nursingRequirement = (
  enrollYear: number | string,
  track: "nursing" | "public-health-nursing",
  relatedVersion: "limited" | "other-departments",
  asciiParentheses: boolean,
): GradRequirement => {
  const publicHealth = track === "public-health-nursing";
  const specialized = nursingSpecializedBase(asciiParentheses);
  if (publicHealth) {
    specialized.splice(specialized.indexOf("看護学探究概説") + 1, 0, ...publicHealthNursingCourses);
  } else {
    specialized.splice(specialized.indexOf("看護学探究概説") + 1, 0, "看護学探究演習");
  }
  const foundationSelections = publicHealth
    ? ["医療経済学", "環境保健"]
    : ["医療経済学", "環境保健", "日本国憲法"];
  const relatedRule: GradRequirement["courses"]["select"][number] =
    relatedVersion === "limited"
      ? [
          ["CC", "CE", "W", "AB61", "AB62", "AB63", "AC65"],
          4,
          4,
          false,
          "指定された他学類等の関連科目",
          3,
          { includeCourseNames: ["化学", "物理学", "生物学"] },
        ]
      : [
          ["A", "B", "C", "E", "F", "G", "H", "V", "W", "Y"],
          4,
          4,
          false,
          "他学類が開設する関連科目",
          3,
          { excludeCodes: ["HC"] },
        ];

  return buildRequirement({
    department: "看護学類",
    major: publicHealth ? "保健師課程" : "看護師課程",
    enrollYear,
    compulsory: [
      ...specialized,
      ...nursingFoundationCompulsory,
      ...(publicHealth ? ["日本国憲法"] : []),
      nursingPhilosophyRequirement,
      ...medicalCommon,
    ],
    compulsorySumUnit: publicHealth ? 131 : 118,
    selectMinimumUnit: 6,
    minimums: [0, 1, 1, 4],
    maximums: [0, 1, 1, 4],
    selectRules: [
      [
        [],
        1,
        1,
        false,
        "看護学類が指定する専門基礎科目",
        1,
        { includeCourseNames: foundationSelections },
      ],
      ...buildCommonRules(1),
      relatedRule,
    ],
  });
};

const medicalScienceProfessionalCompulsory = [
  "臨床病態学",
  "病態検査学",
  "臨床薬理学",
  "臨床薬理学実習",
  "病理組織学",
  "病理組織学実習",
  "細胞検査学",
  "血液検査学",
  "血液検査学実習",
  "生化学成分検査学",
  "生化学成分検査学実習",
  "凝固・線溶学",
  "遺伝子検査学",
  "遺伝子検査学実習",
  "RI検査技術学",
  "病原微生物学",
  "病原微生物学実習I",
  "病原微生物学実習II",
  "医学物理学概論",
  "免疫検査学",
  "免疫検査学実習",
  "輸血学",
  "輸血学実習",
  "ゲノム医科学",
  "生理機能検査学",
  "生理機能検査学実習",
  "画像検査学",
  "検査機器学",
  "検査情報管理学",
  "医学検査学",
  "医療科学概論",
  "医学検査学実習",
  "医学検査学フロンティア",
  "医療安全管理学",
  "臨床実習",
  "卒業研究",
];

const medicalScienceFoundationCompulsory = [
  "人体構造学",
  "人体構造学実習",
  "人体機能学",
  "人体機能学実習",
  "医科生化学",
  "生化学実習",
  "医科分子生物学",
  "基礎医学総論",
  "微生物学",
  "微生物学実習",
  "保健衛生論",
  "医療法制",
  "計量生物学",
  "医用工学",
  "医用工学実習",
  "電磁気学I",
  "医療情報管理学",
  "医科学英語論文講読の基礎",
];

const medicalScienceProfessionalSelections = [
  "先端脳科学",
  "神経科学特論",
  "細胞・発生工学",
  "ためになる血液学",
  "血管生物学のトピックス",
  "バイオインフォマティクス",
  "医療工学",
  "人工臓器学",
  "胚操作・動物実験法(実験動物学)",
  "生体機能診断ワークショップ",
  "健幸医科学グループワーク",
  "主体性演習",
];

type MedicalScienceVersion = "2022~2023" | 2024 | 2025 | 2026;

const medicalScienceProfessionalSelectionsFor = (
  version: MedicalScienceVersion,
): string[] => [
  ...medicalScienceProfessionalSelections,
  ...(version === "2022~2023"
    ? []
    : [
        "ためになる内分泌代謝学",
        "自己免疫疾患・アレルギー疾患の病態と臨床",
        "実践的オンラインコンテンツ・ツール活用論",
        "検査医学とスポーツ医学の密接な接点",
      ]),
  ...(version === 2025 || version === 2026
    ? ["ケア・コロキウム", "法医学概論"]
    : ["多職種連携医療学概論"]),
  ...(version === 2026 ? ["発生工学と再生医療"] : []),
];

const medicalScienceFoundationSelections = [
  "イメージング総論",
  "生命倫理学",
  "医学史",
  "医療・生命科学とテクノロジー",
  "医療経済学",
  "キャリアデザイン研修",
  "国際生命医科学研修",
  "国際生命医科学研修II",
  "国際生命医科学研修III",
  "国際パートナーシップ研修",
  "国際パートナーシップ研修(中南米)",
  "国際パートナーシップ研修(東南アジア)",
  "国際生命医科学",
  "国際生命医科学II",
  "国際生命医科学III",
  "実践英語(TOEFL対策)",
];

const medicalScienceRelatedRules = (): GradRequirement["courses"]["select"] => [
  [
    ["A", "B", "C", "V", "W", "Y"],
    3,
    3,
    false,
    "E・F・G・H以外で始まる他学群・他学類科目",
    3,
  ],
  [["E", "F", "G", "H"], 3, 3, false, "E・F・G・Hで始まる授業科目", 3],
];

const medicalScienceRequirement = (
  version: MedicalScienceVersion,
): GradRequirement =>
  buildRequirement({
    department: "医療科学類",
    major: "医療科学主専攻",
    enrollYear: version,
    compulsory: [
      ...medicalScienceProfessionalCompulsory,
      ...medicalScienceFoundationCompulsory,
      "科学実験の基礎",
      "医療科学キャリアセミナー",
      ...medicalScienceCommon,
    ],
    compulsorySumUnit: 109,
    selectMinimumUnit: 18,
    minimums: [6, 5, 1, 6],
    maximums: [6, 5, 1, 6],
    selectRules: [
      [[], 6, 6, false, "公式表で指定された専門選択科目", 0, { includeCourseNames: medicalScienceProfessionalSelectionsFor(version) }],
      [[], 5, 5, false, "公式表で指定された専門基礎選択科目", 1, { includeCourseNames: medicalScienceFoundationSelections }],
      ...buildCommonRules(1),
      ...medicalScienceRelatedRules(),
    ],
  });

const internationalMedicalScienceCompulsory = [
  "健幸医科学グループワーク",
  "医療科学概論",
  "医療科学特論I",
  "医療科学特論II",
  "医科学演習",
  "研究演習",
  "卒業研究",
];

const internationalMedicalScienceRequirement = (
  version: MedicalScienceVersion,
): GradRequirement =>
  buildRequirement({
    department: "医療科学類",
    major: "国際医療科学主専攻",
    enrollYear: version,
    compulsory: [
      ...internationalMedicalScienceCompulsory,
      "医科学英語論文講読の基礎",
      "科学実験の基礎",
      "医療科学キャリアセミナー",
      ...medicalScienceCommon,
    ],
    compulsorySumUnit: 35,
    selectMinimumUnit: 89,
    minimums: [55, 27, 1, 6],
    maximums: [55, 27, 1, 6],
    selectRules: [
      [
        [],
        55,
        55,
        false,
        "国際医療科学主専攻の専門選択科目",
        0,
        {
          includeCourseNames: [
            ...medicalScienceProfessionalCompulsory.filter(
              (name) => name !== "卒業研究",
            ),
            ...medicalScienceProfessionalSelectionsFor(version),
          ],
          excludeCourseNames: internationalMedicalScienceCompulsory,
        },
      ],
      [
        [],
        27,
        27,
        false,
        "国際医療科学主専攻の専門基礎選択科目",
        1,
        {
          includeCourseNames: [
            ...medicalScienceFoundationCompulsory.filter(
              (name) => name !== "医科学英語論文講読の基礎",
            ),
            ...medicalScienceFoundationSelections,
          ],
        },
      ],
      ...buildCommonRules(1),
      ...medicalScienceRelatedRules(),
    ],
  });

const humanRelatedRules = (
  relatedCodes: string[],
  relatedMaximum: number,
  excludedCredentialCourseNames: string[] = [],
): GradRequirement["courses"]["select"] => {
  const internalRules: GradRequirement["courses"]["select"] =
    relatedCodes.length === 0
      ? []
      : [[relatedCodes, 0, relatedMaximum, false, "人間学群内の関連科目", 3]];
  return [
    ...internalRules,
    [
    ["A", "B", "E", "F", "G", "H", "V", "W", "Y"],
    6,
    relatedMaximum,
    false,
    "他学群が開設する関連科目",
    3,
    ],
    [
    [
      "*自由科目特設",
      "*教職に関する科目",
      "*博物館に関する科目",
    ],
    0,
    relatedMaximum,
    false,
    "特設自由・教職・博物館科目",
    3,
    { excludeCourseNames: excludedCredentialCourseNames },
    ],
  ];
};

const disabilitySpecifiedCourses = [
  "視覚障害児の心理・生理・病理",
  "聴覚障害児の心理・生理・病理",
  "知的障害児の心理・生理・病理",
  "肢体不自由児の心理・生理・病理",
  "病弱児の心理・生理・病理",
  "医学概論I",
  "医学概論II",
  "保健医療論",
  "相談援助の基盤と専門職I",
  "相談援助の基盤と専門職II",
  "相談援助の理論と方法I",
  "相談援助の理論と方法II",
];

const disabilityLegacyMedicalCourses = [
  "視覚障害生理病理特講", "聴覚障害生理病理特講", "肢体不自由の生理病理", "病弱者の生理病理",
  "知的・発達障害生理病理特講", "医学概論I", "医学概論II", "保健医療論",
];
const disabilityLegacyPsychologyCourses = [
  "視覚障害心理", "聴覚障害心理", "運動障害と心理", "健康障害と心理", "知的・発達障害と心理",
  "相談援助の基盤と専門職I", "相談援助の基盤と専門職II", "相談援助の理論と方法I", "相談援助の理論と方法II",
];

const educationRequirement = (
  enrollYear: number | string,
): GradRequirement =>
  buildRequirement({
    department: "教育学類",
    major: "教育学主専攻",
    enrollYear,
    compulsory: ["卒業研究", "人間学I", "教育基礎論", "学校の経営・制度・社会", "心理学概論", "障害科学::2//['障害科学I', '障害科学II']", "キャリアデザイン入門", "教育学研究法A", "教育学研究法B", "教育インターンシップ基礎論", "教育インターンシップ実践演習", "教育学実践演習", ...humanCommon],
    compulsorySumUnit: 38,
    selectMinimumUnit: 86,
    minimums: [42, 0, 1, 6],
    maximums: [79, 20, 38, 43],
    selectRules: [
      [
        ["CB2"],
        42,
        79,
        false,
        "教育学類の専門科目",
        0,
        {
          minimumIncludedUnits: [
            {
              courseIdSuffixes: ["2"],
              minimum: 4,
              label: "演習・探究科目（科目番号末尾2、内数）",
            },
          ],
        },
      ],
      [["CC", "CE"], 0, 37, false, "心理学類・障害科学類の専門科目", 0],
      [["CA", "CB1"], 0, 20, false, "人間学群コア・学類共通科目", 1],
      ...buildCommonRules(38),
      ...humanRelatedRules([], 43),
    ],
  });

/** 根拠: 筑波大学「学群等履修細則」別表（2022〜2026年度）。 */
/** 根拠・年度差・未対応条件は curriculum/audits/psychology.md を参照。 */
const psychologyRequirement = (modern: boolean): GradRequirement => buildRequirement({
  department: "心理学類",
  major: "心理学主専攻",
  enrollYear: modern ? "2023~2026" : 2022,
  compulsory: ["知覚・認知心理学", "学習・言語心理学", "感情・人格心理学", "神経・生理心理学", "社会・集団・家族心理学", "発達心理学", "臨床心理学概論", "卒業研究セミナー", "心理学卒業研究::6", "人間学I", "心理学類概論::2", "教育科目::2//['教育基礎論', '学校の経営・制度・社会']", "障害科学::2//['障害科学I', '障害科学II']", "キャリアデザイン入門", "心理学研究法", "心理学統計法I", "心理学統計法II", "心理学統計法実習", "心理学英語セミナー", "心理学実験", "心理学研究実習I", ...humanCommon],
  compulsorySumUnit: 59,
  selectMinimumUnit: 65,
  minimums: [21, 0, 1, 6],
  maximums: [58, 13, 28, 33],
  selectRules: [
    // CC全体へ割り当てる前に、専門基礎へ指定された実習IIを消し込む。
    [["CC11293"], 0, 3, false, "心理学研究実習II", 1,
      { includeCourseNames: ["心理学研究実習II", "心理学研究実習Ⅱ"] }],
    [["CA"], 0, 10, false, "人間学群コア科目", 1],
    [["CC"], 21, 58, false, "心理学類の専門科目", 0,
      { minimumIncludedUnits: [{ codes: ["CC27"], minimum: 6, label: "CC27で始まる心理学専門科目（内数）" }] }],
    [["CB", "CE"], 0, 37, false, "教育学類・障害科学類の専門科目", 0],
    [["*学士基盤科目"], 1, modern ? 28 : 1, false, "学士基盤科目", 2],
    [["*体育", "*外国語", "*国語", "*芸術"], 0, 27, false, "その他の共通科目", 2],
    ...(modern ? [
      [["A", "B", "E", "F", "G", "H", "V", "W", "Y"], 6, 33, false,
        "他学群が開設する関連科目", 3] as GradRequirement["courses"]["select"][number],
      [["8", "9"], 0, 33, false, "特設自由・教職・博物館科目", 3,
        { excludeCourseNames: ["こころの発達", "学習の心理"] }] as GradRequirement["courses"]["select"][number],
    ] : [
      [["CA", "CB", "CC", "CE"], 6, 33, true, "人間学群以外の関連科目（2022）", 3,
        // 否定規則ではincludeCourseNamesも補集合から除く側の集合となる。
        { includeCourseNames: ["こころの発達", "学習の心理"] }] as GradRequirement["courses"]["select"][number],
    ]),
  ],
});

/** 根拠・未確定の短期留学生対象科目等は curriculum/audits/disability.md を参照。 */
const disabilityRequirement = (modern: boolean): GradRequirement => buildRequirement({
  department: "障害科学類",
  major: "障害科学主専攻",
  enrollYear: modern ? "2023~2026" : 2022,
  compulsory: ["卒業研究I", "卒業研究II", "人間学I", "障害科学I", "障害科学II", "キャリアデザイン入門", "Current Topics in Disability Sciences", "教育科目::2//['教育基礎論', '学校の経営・制度・社会']", "心理学類概論::2", "障害科学実践入門", "障害原理論I", "障害者福祉論I", "障害者福祉論II", "障害科学セミナー", "障害者教育基礎理論I", "障害者教育基礎理論II", "心理学統計法II", "障害科学研究法入門", "障害科学研究法実習", ...humanCommon],
  compulsorySumUnit: 46,
  selectMinimumUnit: 78,
  minimums: [32, 0, 1, 6],
  maximums: [71, 10, 40, 45],
  selectRules: [
    [["CA"], 0, 10, false, "人間学群コア科目", 1],
    // 指定8単位とその他24単位を親32単位・内数で表し、指定科目の余剰を失わない。
    [["CE"], 32, 71, false, "障害科学類の専門科目", 0, {
      minimumIncludedUnits: modern
        ? [{ courseNames: disabilitySpecifiedCourses, minimum: 8, label: "指定された障害科学専門科目（内数）" }]
        : [
          { courseNames: disabilityLegacyMedicalCourses, minimum: 4, label: "生理・病理等の指定4単位（内数）" },
          { courseNames: disabilityLegacyPsychologyCourses, minimum: 4, label: "心理・相談等の指定4単位（内数）" },
        ],
    }],
    [["CB", "CC"], 0, 40, false, "教育学類・心理学類の専門科目", 0],
    [["*学士基盤科目"], 1, 40, false, "学士基盤科目", 2],
    [["*体育", "*外国語", "*国語", "*芸術", ...(modern ? [] : ["*情報"])], 0, 39, false, "その他の共通科目", 2],
    ...(modern ? [
      [["A", "B", "E", "F", "G", "H", "V", "W", "Y"], 6, 45, false,
        "他学群が開設する関連科目", 3] as GradRequirement["courses"]["select"][number],
      [["8", "9"], 0, 45, false, "特設自由・教職・博物館科目", 3] as GradRequirement["courses"]["select"][number],
    ] : [
      [["CA", "CB", "CC", "CE"], 6, 45, true,
        "人間学群以外の関連科目（2022）", 3] as GradRequirement["courses"]["select"][number],
    ]),
  ],
});

export const humanHealthArtsRequirements = {
  "education-22": educationRequirement(2022),
  "education-23": educationRequirement("2023~2026"),
  "psychology-22": psychologyRequirement(false),
  "psychology-23": psychologyRequirement(true),
  "disability-22": disabilityRequirement(false),
  "disability-23": disabilityRequirement(true),
  "medicine-22": medicineRequirement("2022~2025", "medicine", "TOEFL演習"),
  "medicine-26": medicineRequirement(2026, "medicine", "学術英語"),
  "new-medicine-22": medicineRequirement("2022~2025", "new-medicine", "TOEFL演習"),
  "new-medicine-26": medicineRequirement(2026, "new-medicine", "学術英語"),
  "nursing-22": nursingRequirement("2022~2024", "nursing", "limited", false),
  "nursing-25": nursingRequirement(2025, "nursing", "other-departments", false),
  "nursing-26": nursingRequirement(2026, "nursing", "other-departments", true),
  "public-health-nursing-22": nursingRequirement("2022~2024", "public-health-nursing", "limited", false),
  "public-health-nursing-25": nursingRequirement(2025, "public-health-nursing", "other-departments", false),
  "public-health-nursing-26": nursingRequirement(2026, "public-health-nursing", "other-departments", true),
  "medical-science-22": medicalScienceRequirement("2022~2023"),
  "medical-science-24": medicalScienceRequirement(2024),
  "medical-science-25": medicalScienceRequirement(2025),
  "medical-science-26": medicalScienceRequirement(2026),
  "international-medical-science-22": internationalMedicalScienceRequirement("2022~2023"),
  "international-medical-science-24": internationalMedicalScienceRequirement(2024),
  "international-medical-science-25": internationalMedicalScienceRequirement(2025),
  "international-medical-science-26": internationalMedicalScienceRequirement(2026),
  "physical-education-22": physicalEducationRequirement("2022~2025"),
  "physical-education-26": physicalEducationRequirement(2026),
  "art-studies-22": artRequirement(false),
  "japanese-art-22": artRequirement(true),
} satisfies Pick<GradRequirementTable, HumanHealthArtsRequirementId>;
