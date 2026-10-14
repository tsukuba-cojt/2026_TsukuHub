export type CircleCategory = "文化系" | "体育系" | "学術系" | "ボランティア系";

export type CircleTag = "初心者歓迎" | "経験者優遇" | "兼サー可能" | "少人数";

export type Circle = {
  id: string;
  name: string;
  category: CircleCategory;
  description: string;
  tags: CircleTag[];
  frequency: string;
  members: string;
  image?: string;
};

export const circleCategories: CircleCategory[] = ["文化系", "体育系", "学術系", "ボランティア系"];

export const circleTags: CircleTag[] = ["初心者歓迎", "経験者優遇", "兼サー可能", "少人数"];

export const mockCircles: Circle[] = [
  {
    id: "c1",
    name: "アコースティックギターサークル",
    category: "文化系",
    description: "初心者から経験者まで、みんなで楽しく演奏しています！学祭での発表もあります♪",
    tags: ["初心者歓迎"],
    frequency: "週1回/火・金",
    members: "約15名",
  },
  {
    id: "c2",
    name: "つくばフットサル同好会",
    category: "体育系",
    description: "平砂の体育館を中心に、和気あいあいとボールを蹴っています。大会にも年数回出場します。",
    tags: ["初心者歓迎", "兼サー可能"],
    frequency: "週2〜3回/月・水・土",
    members: "約40名",
  },
  {
    id: "c3",
    name: "天体観測部ほしぞら",
    category: "学術系",
    description: "筑波山や構内で星空を観測しています。望遠鏡の扱い方は先輩が丁寧に教えます。",
    tags: ["初心者歓迎", "少人数"],
    frequency: "不定期",
    members: "約12名",
  },
  {
    id: "c4",
    name: "学生ボランティアネット つくば",
    category: "ボランティア系",
    description: "地域の子ども食堂や清掃活動に参加しています。都合の合う日だけの参加もOKです。",
    tags: ["兼サー可能"],
    frequency: "週1回/土",
    members: "約30名",
  },
  {
    id: "c5",
    name: "混声合唱団ハルモニア",
    category: "文化系",
    description: "宿舎近くの練習室で週2回練習しています。定期演奏会に向けて日々ハーモニーを磨いています。",
    tags: ["初心者歓迎"],
    frequency: "週2〜3回/火・木",
    members: "約45名",
  },
  {
    id: "c6",
    name: "硬式テニス部ウィングス",
    category: "体育系",
    description: "関東の大会入賞を目指して練習しています。経験者はもちろん、やる気のある方も歓迎です。",
    tags: ["経験者優遇"],
    frequency: "週4回以上",
    members: "約50名",
  },
  {
    id: "c7",
    name: "プログラミング研究会Bit",
    category: "学術系",
    description: "競技プログラミングやアプリ開発の勉強会を開催。ハッカソンにもチームで出場しています。",
    tags: ["初心者歓迎", "兼サー可能"],
    frequency: "週1回/水",
    members: "約25名",
  },
  {
    id: "c8",
    name: "写真部ファインダー",
    category: "文化系",
    description: "キャンパスや筑波山周辺で撮影会を行っています。年に一度の写真展が一番の見せ場です。",
    tags: ["兼サー可能", "少人数"],
    frequency: "不定期",
    members: "約18名",
  },
  {
    id: "c9",
    name: "バレーボールサークルRISE",
    category: "体育系",
    description: "経験・未経験問わず、楽しくバレーをしています。練習後のごはん会も人気です。",
    tags: ["初心者歓迎"],
    frequency: "週2〜3回/月・木",
    members: "約35名",
  },
  {
    id: "c10",
    name: "子ども学習支援サークルたけのこ",
    category: "ボランティア系",
    description: "市内の小中学生の学習をサポートしています。教育に興味がある方にぴったりです。",
    tags: ["少人数"],
    frequency: "週1回/金",
    members: "約14名",
  },
  {
    id: "c11",
    name: "ディベート研究会",
    category: "学術系",
    description: "社会問題をテーマに議論の力を鍛えています。全国大会への出場経験もあります。",
    tags: ["経験者優遇", "少人数"],
    frequency: "週1回/火",
    members: "約10名",
  },
  {
    id: "c12",
    name: "よさこい踊り隊 紫峰",
    category: "文化系",
    description: "学園祭や地域のお祭りで演舞を披露しています。踊りの経験がなくても大丈夫です！",
    tags: ["初心者歓迎", "兼サー可能"],
    frequency: "週2〜3回/水・土",
    members: "約60名",
  },
];
