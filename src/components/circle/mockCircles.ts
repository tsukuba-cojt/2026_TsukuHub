export type CircleCategory = "文化系" | "体育系" | "学術系" | "ボランティア系";

export type CircleTag = "初心者歓迎" | "経験者優遇" | "兼サー可能" | "少人数";

export type CircleNotice = {
  date: string;
  title: string;
  body: string;
};

export type CircleGradeMembers = {
  grade: 1 | 2 | 3 | 4;
  count: number;
};

export type CircleFacultyRatio = {
  name: string;
  percent: number;
};

export type CircleExternalLink = {
  label: string;
  text: string;
  url: string;
};

export type CircleReview = {
  date: string;
  rating: number;
  grade: string;
  department: string;
  comment: string;
};

export type CircleDetail = {
  activityDays: string;
  activityTime: string;
  activityPlace: string;
  notices: CircleNotice[];
  gradeMembers: CircleGradeMembers[];
  facultyRatios: CircleFacultyRatio[];
  atmosphereTags: string[];
  atmosphereDescription: string;
  links: CircleExternalLink[];
  additionalInfo?: string;
  reviews: CircleReview[];
};

export type Circle = {
  id: string;
  name: string;
  category: CircleCategory;
  description: string;
  tags: CircleTag[];
  frequency: string;
  members: string;
  image?: string;
  detail: CircleDetail;
};

export const circleCategories: CircleCategory[] = ["文化系", "体育系", "学術系", "ボランティア系"];

export const circleCategoryClass: Record<CircleCategory, string> = {
  文化系: "isCulture",
  体育系: "isSports",
  学術系: "isAcademic",
  ボランティア系: "isVolunteer",
};

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
    detail: {
      activityDays: "毎週 火・金（週2回）",
      activityTime: "18:00 - 21:00",
      activityPlace: "文化系サークル棟",
      notices: [
        {
          date: "2026/04/01",
          title: "新入生歓迎会のお知らせ",
          body: "4月20日（火）に新入生歓迎会を行います！みんなで楽しく交流しましょう！ギターを持っていなくても大丈夫です。",
        },
        {
          date: "2026/03/15",
          title: "春のミニライブ開催",
          body: "3月28日（土）に文化系サークル棟で春のミニライブを開催します。どなたでも観覧できます。",
        },
        {
          date: "2026/02/10",
          title: "練習日変更のお知らせ",
          body: "2月は試験期間のため、金曜日のみの練習となります。",
        },
      ],
      gradeMembers: [
        { grade: 3, count: 12 },
        { grade: 2, count: 10 },
        { grade: 1, count: 10 },
      ],
      facultyRatios: [
        { name: "情報メディア創成学類", percent: 40 },
        { name: "国際総合学類", percent: 30 },
        { name: "その他", percent: 30 },
      ],
      atmosphereTags: ["アットホーム", "初心者歓迎", "真面目"],
      atmosphereDescription: "初心者から経験者まで、みんなで楽しく活動しています！学年・学類関係なく仲が良く、和気あいあいとした雰囲気です。",
      links: [
        {
          label: "公式サイト",
          text: "https://acoustic-guitar.example.com/",
          url: "https://acoustic-guitar.example.com/",
        },
        {
          label: "X（Twitter）",
          text: "@aco_guitar_sample",
          url: "https://x.example.com/aco_guitar_sample",
        },
        {
          label: "Instagram",
          text: "@aco_guitar_sample",
          url: "https://instagram.example.com/aco_guitar_sample",
        },
      ],
      additionalInfo: "合宿や発表の様子など、各種SNSで随時発信しています！ぜひチェックお願いします！",
      reviews: [
        {
          date: "2026/04/01",
          rating: 4,
          grade: "3年",
          department: "情報学群",
          comment: "サンプルコメント　初心者でも優しく教えてくれて、楽しく活動しています！先輩が優しいです",
        },
        {
          date: "2026/03/28",
          rating: 5,
          grade: "2年",
          department: "人文・文化学群",
          comment: "ギター未経験で入りましたが、半年で学祭のステージに立てました。練習の雰囲気も良いです。",
        },
        {
          date: "2026/03/20",
          rating: 4,
          grade: "1年",
          department: "理工学群",
          comment: "週2回でも無理なく続けられます。好きな曲を自由に選べるのが楽しいです。",
        },
        {
          date: "2026/03/02",
          rating: 5,
          grade: "4年",
          department: "社会・国際学群",
          comment: "4年間ずっと居心地の良いサークルでした。卒業ライブは一生の思い出です。",
        },
        {
          date: "2026/02/18",
          rating: 3,
          grade: "2年",
          department: "情報学群",
          comment: "練習場所が少し狭いのが気になりますが、メンバーはみんな優しいです。",
        },
        {
          date: "2026/02/05",
          rating: 4,
          grade: "3年",
          department: "生命環境学群",
          comment: "合宿が楽しいです！他学類の友達がたくさんできました。",
        },
        {
          date: "2026/01/22",
          rating: 4,
          grade: "1年",
          department: "情報学群",
          comment: "初心者向けの講習会があり、コードの押さえ方から丁寧に教えてもらえました。",
        },
        {
          date: "2026/01/10",
          rating: 5,
          grade: "2年",
          department: "芸術専門学群",
          comment: "弾き語りもバンド形式も挑戦できて、音楽の幅が広がりました。",
        },
        {
          date: "2025/12/12",
          rating: 4,
          grade: "3年",
          department: "人間学群",
          comment: "兼サーしている人も多く、自分のペースで参加できるのがありがたいです。",
        },
        {
          date: "2025/11/30",
          rating: 4,
          grade: "1年",
          department: "理工学群",
          comment: "学祭でのライブ発表がとても盛り上がりました。来年も出たいです。",
        },
      ],
    },
  },
  {
    id: "c2",
    name: "つくばフットサル同好会",
    category: "体育系",
    description: "平砂の体育館を中心に、和気あいあいとボールを蹴っています。大会にも年数回出場します。",
    tags: ["初心者歓迎", "兼サー可能"],
    frequency: "週2〜3回/月・水・土",
    members: "約40名",
    detail: {
      activityDays: "毎週 月・水・土（週3回）",
      activityTime: "19:00 - 21:00",
      activityPlace: "平砂体育館",
      notices: [
        {
          date: "2026/04/05",
          title: "新歓体験練習のお知らせ",
          body: "4月中の練習はすべて体験参加OKです。運動できる服装でお越しください。",
        },
        {
          date: "2026/03/10",
          title: "春季大会の結果報告",
          body: "春季大会でベスト8に入りました！応援ありがとうございました。",
        },
      ],
      gradeMembers: [
        { grade: 4, count: 8 },
        { grade: 3, count: 10 },
        { grade: 2, count: 12 },
        { grade: 1, count: 10 },
      ],
      facultyRatios: [
        { name: "体育専門学群", percent: 35 },
        { name: "社会工学類", percent: 25 },
        { name: "その他", percent: 40 },
      ],
      atmosphereTags: ["ワイワイ", "初心者歓迎"],
      atmosphereDescription: "経験者も未経験者も一緒にプレーしています。練習後にご飯に行くことも多い、にぎやかなサークルです。",
      links: [
        {
          label: "公式サイト",
          text: "https://futsal-circle.example.com/",
          url: "https://futsal-circle.example.com/",
        },
        {
          label: "Instagram",
          text: "@tsukuba_futsal_sample",
          url: "https://instagram.example.com/tsukuba_futsal_sample",
        },
      ],
      reviews: [
        {
          date: "2026/03/30",
          rating: 5,
          grade: "2年",
          department: "体育専門学群",
          comment: "雰囲気が明るくて、毎回の練習が楽しみです。",
        },
        {
          date: "2026/03/01",
          rating: 4,
          grade: "1年",
          department: "理工学群",
          comment: "未経験でもパスを回してもらえるので楽しめます。",
        },
      ],
    },
  },
  {
    id: "c3",
    name: "天体観測部ほしぞら",
    category: "学術系",
    description: "筑波山や構内で星空を観測しています。望遠鏡の扱い方は先輩が丁寧に教えます。",
    tags: ["初心者歓迎", "少人数"],
    frequency: "不定期",
    members: "約12名",
    detail: {
      activityDays: "不定期（月2〜3回）",
      activityTime: "20:00 - 23:00",
      activityPlace: "筑波山・第一エリア屋上",
      notices: [
        {
          date: "2026/04/10",
          title: "新歓観望会のお知らせ",
          body: "4月25日（土）に構内で新歓観望会を行います。雨天時は中止です。",
        },
      ],
      gradeMembers: [
        { grade: 3, count: 4 },
        { grade: 2, count: 5 },
        { grade: 1, count: 3 },
      ],
      facultyRatios: [
        { name: "物理学類", percent: 50 },
        { name: "地球学類", percent: 30 },
        { name: "その他", percent: 20 },
      ],
      atmosphereTags: ["少人数", "まったり"],
      atmosphereDescription: "少人数でのんびりと星を眺めています。天文の知識がなくても先輩が丁寧に教えてくれます。",
      links: [
        {
          label: "X（Twitter）",
          text: "@hoshizora_sample",
          url: "https://x.example.com/hoshizora_sample",
        },
      ],
      additionalInfo: "観測会は天候により直前に中止となる場合があります。最新情報はXをご確認ください。",
      reviews: [
        {
          date: "2026/02/14",
          rating: 5,
          grade: "2年",
          department: "理工学群",
          comment: "筑波山で見た星空が忘れられません。少人数なので仲良くなりやすいです。",
        },
      ],
    },
  },
  {
    id: "c4",
    name: "学生ボランティアネット つくば",
    category: "ボランティア系",
    description: "地域の子ども食堂や清掃活動に参加しています。都合の合う日だけの参加もOKです。",
    tags: ["兼サー可能"],
    frequency: "週1回/土",
    members: "約30名",
    detail: {
      activityDays: "毎週 土（週1回）",
      activityTime: "10:00 - 15:00",
      activityPlace: "つくば市内各所",
      notices: [
        {
          date: "2026/04/02",
          title: "4月の活動予定",
          body: "4月は子ども食堂の手伝いと公園清掃を予定しています。",
        },
        {
          date: "2026/03/18",
          title: "説明会のお知らせ",
          body: "3月30日（月）にオンライン説明会を開催します。",
        },
        {
          date: "2026/03/01",
          title: "活動報告",
          body: "2月の清掃活動に延べ40名が参加しました。ご協力ありがとうございました。",
        },
        {
          date: "2026/02/01",
          title: "参加登録方法の変更",
          body: "参加登録はフォームから行うよう変更になりました。",
        },
      ],
      gradeMembers: [
        { grade: 4, count: 6 },
        { grade: 3, count: 8 },
        { grade: 2, count: 8 },
        { grade: 1, count: 8 },
      ],
      facultyRatios: [
        { name: "社会学類", percent: 30 },
        { name: "教育学類", percent: 30 },
        { name: "その他", percent: 40 },
      ],
      atmosphereTags: ["自由参加", "地域貢献"],
      atmosphereDescription: "都合の合う日だけ参加できる、ゆるやかなサークルです。地域の方との交流を大切にしています。",
      links: [
        {
          label: "公式サイト",
          text: "https://volunteer-net.example.com/",
          url: "https://volunteer-net.example.com/",
        },
        {
          label: "X（Twitter）",
          text: "@vnet_tsukuba_sample",
          url: "https://x.example.com/vnet_tsukuba_sample",
        },
        {
          label: "Instagram",
          text: "@vnet_tsukuba_sample",
          url: "https://instagram.example.com/vnet_tsukuba_sample",
        },
      ],
      reviews: [
        {
          date: "2026/03/12",
          rating: 4,
          grade: "3年",
          department: "社会・国際学群",
          comment: "自分のペースで参加でき、地域とのつながりを実感できます。",
        },
        {
          date: "2026/01/20",
          rating: 5,
          grade: "1年",
          department: "人間学群",
          comment: "子どもたちと関われる活動が多く、とてもやりがいがあります。",
        },
      ],
    },
  },
  {
    id: "c5",
    name: "混声合唱団ハルモニア",
    category: "文化系",
    description: "宿舎近くの練習室で週2回練習しています。定期演奏会に向けて日々ハーモニーを磨いています。",
    tags: ["初心者歓迎"],
    frequency: "週2〜3回/火・木",
    members: "約45名",
    detail: {
      activityDays: "毎週 火・木（週2回）",
      activityTime: "18:30 - 21:00",
      activityPlace: "宿舎近くの練習室",
      notices: [
        {
          date: "2026/04/03",
          title: "定期演奏会のお知らせ",
          body: "6月14日（日）に定期演奏会を開催します。",
        },
        {
          date: "2026/03/25",
          title: "新入団員募集",
          body: "パート問わず団員を募集しています。見学は随時受付中です。",
        },
      ],
      gradeMembers: [
        { grade: 4, count: 10 },
        { grade: 3, count: 12 },
        { grade: 2, count: 11 },
        { grade: 1, count: 12 },
      ],
      facultyRatios: [
        { name: "人文学類", percent: 35 },
        { name: "比較文化学類", percent: 25 },
        { name: "その他", percent: 40 },
      ],
      atmosphereTags: ["真面目", "初心者歓迎"],
      atmosphereDescription: "演奏会に向けて真剣に練習しつつ、オフの日はみんなで出かける仲の良い合唱団です。",
      links: [
        {
          label: "公式サイト",
          text: "https://harmonia-choir.example.com/",
          url: "https://harmonia-choir.example.com/",
        },
      ],
      reviews: [
        {
          date: "2026/03/05",
          rating: 5,
          grade: "2年",
          department: "人文・文化学群",
          comment: "ハーモニーがぴったり合った瞬間が最高です。",
        },
      ],
    },
  },
  {
    id: "c6",
    name: "硬式テニス部ウィングス",
    category: "体育系",
    description: "関東の大会入賞を目指して練習しています。経験者はもちろん、やる気のある方も歓迎です。",
    tags: ["経験者優遇"],
    frequency: "週4回以上",
    members: "約50名",
    detail: {
      activityDays: "毎週 月〜木（週4回）",
      activityTime: "16:30 - 19:30",
      activityPlace: "テニスコート",
      notices: [
        {
          date: "2026/04/08",
          title: "入部説明会",
          body: "4月15日（水）にテニスコート横で入部説明会を行います。",
        },
      ],
      gradeMembers: [
        { grade: 4, count: 12 },
        { grade: 3, count: 13 },
        { grade: 2, count: 13 },
        { grade: 1, count: 12 },
      ],
      facultyRatios: [
        { name: "体育専門学群", percent: 50 },
        { name: "工学システム学類", percent: 20 },
        { name: "その他", percent: 30 },
      ],
      atmosphereTags: ["本格派", "大会志向"],
      atmosphereDescription: "大会での入賞を目指して練習に打ち込んでいます。メリハリのある雰囲気です。",
      links: [
        {
          label: "公式サイト",
          text: "https://wings-tennis.example.com/",
          url: "https://wings-tennis.example.com/",
        },
        {
          label: "Instagram",
          text: "@wings_tennis_sample",
          url: "https://instagram.example.com/wings_tennis_sample",
        },
      ],
      additionalInfo: "ラケットの貸し出しがあります。体験練習には運動靴のみご持参ください。",
      reviews: [
        {
          date: "2026/02/22",
          rating: 4,
          grade: "3年",
          department: "体育専門学群",
          comment: "練習はハードですが、確実に上達できます。",
        },
        {
          date: "2026/01/15",
          rating: 4,
          grade: "2年",
          department: "理工学群",
          comment: "先輩のアドバイスが的確で頼りになります。",
        },
      ],
    },
  },
  {
    id: "c7",
    name: "プログラミング研究会Bit",
    category: "学術系",
    description: "競技プログラミングやアプリ開発の勉強会を開催。ハッカソンにもチームで出場しています。",
    tags: ["初心者歓迎", "兼サー可能"],
    frequency: "週1回/水",
    members: "約25名",
    detail: {
      activityDays: "毎週 水（週1回）",
      activityTime: "18:00 - 20:00",
      activityPlace: "第三エリア計算機室",
      notices: [
        {
          date: "2026/04/06",
          title: "新歓ハッカソン",
          body: "4月26日（日）に新入生向けミニハッカソンを開催します。",
        },
        {
          date: "2026/03/20",
          title: "勉強会の再開",
          body: "春休み明けから競プロ勉強会を再開します。",
        },
      ],
      gradeMembers: [
        { grade: 4, count: 5 },
        { grade: 3, count: 7 },
        { grade: 2, count: 7 },
        { grade: 1, count: 6 },
      ],
      facultyRatios: [
        { name: "情報科学類", percent: 45 },
        { name: "情報メディア創成学類", percent: 35 },
        { name: "その他", percent: 20 },
      ],
      atmosphereTags: ["初心者歓迎", "勉強熱心"],
      atmosphereDescription: "プログラミング初心者から競プロ上級者まで幅広く在籍。気軽に質問できる環境です。",
      links: [
        {
          label: "公式サイト",
          text: "https://bit-programming.example.com/",
          url: "https://bit-programming.example.com/",
        },
        {
          label: "X（Twitter）",
          text: "@bit_prog_sample",
          url: "https://x.example.com/bit_prog_sample",
        },
      ],
      reviews: [
        {
          date: "2026/03/18",
          rating: 5,
          grade: "1年",
          department: "情報学群",
          comment: "勉強会のおかげで授業の課題も楽になりました。",
        },
        {
          date: "2026/02/26",
          rating: 4,
          grade: "2年",
          department: "理工学群",
          comment: "ハッカソンでチーム開発を経験できたのが良かったです。",
        },
      ],
    },
  },
  {
    id: "c8",
    name: "写真部ファインダー",
    category: "文化系",
    description: "キャンパスや筑波山周辺で撮影会を行っています。年に一度の写真展が一番の見せ場です。",
    tags: ["兼サー可能", "少人数"],
    frequency: "不定期",
    members: "約18名",
    detail: {
      activityDays: "不定期（月1〜2回）",
      activityTime: "10:00 - 16:00",
      activityPlace: "キャンパス・筑波山周辺",
      notices: [
        {
          date: "2026/03/30",
          title: "春の撮影会",
          body: "4月12日（日）に構内で桜の撮影会を行います。",
        },
      ],
      gradeMembers: [
        { grade: 3, count: 6 },
        { grade: 2, count: 6 },
        { grade: 1, count: 6 },
      ],
      facultyRatios: [
        { name: "芸術専門学群", percent: 60 },
        { name: "その他", percent: 40 },
      ],
      atmosphereTags: ["マイペース", "少人数"],
      atmosphereDescription: "それぞれのペースで撮影を楽しんでいます。カメラはスマホでも大丈夫です。",
      links: [
        {
          label: "Instagram",
          text: "@finder_photo_sample",
          url: "https://instagram.example.com/finder_photo_sample",
        },
      ],
      reviews: [
        {
          date: "2026/02/10",
          rating: 4,
          grade: "2年",
          department: "芸術専門学群",
          comment: "写真展に向けた準備がとても楽しかったです。",
        },
      ],
    },
  },
  {
    id: "c9",
    name: "バレーボールサークルRISE",
    category: "体育系",
    description: "経験・未経験問わず、楽しくバレーをしています。練習後のごはん会も人気です。",
    tags: ["初心者歓迎"],
    frequency: "週2〜3回/月・木",
    members: "約35名",
    detail: {
      activityDays: "毎週 月・木（週2回）",
      activityTime: "19:00 - 21:30",
      activityPlace: "大学会館体育館",
      notices: [
        {
          date: "2026/04/04",
          title: "新歓練習のお知らせ",
          body: "4月中は毎回の練習が体験参加OKです。",
        },
      ],
      gradeMembers: [
        { grade: 4, count: 8 },
        { grade: 3, count: 9 },
        { grade: 2, count: 9 },
        { grade: 1, count: 9 },
      ],
      facultyRatios: [
        { name: "国際総合学類", percent: 30 },
        { name: "社会学類", percent: 30 },
        { name: "その他", percent: 40 },
      ],
      atmosphereTags: ["ワイワイ", "初心者歓迎"],
      atmosphereDescription: "経験・未経験問わず楽しくバレーをしています。練習後のごはん会も人気です。",
      links: [
        {
          label: "X（Twitter）",
          text: "@rise_volley_sample",
          url: "https://x.example.com/rise_volley_sample",
        },
        {
          label: "Instagram",
          text: "@rise_volley_sample",
          url: "https://instagram.example.com/rise_volley_sample",
        },
      ],
      reviews: [
        {
          date: "2026/03/08",
          rating: 5,
          grade: "1年",
          department: "社会・国際学群",
          comment: "練習後のごはん会が楽しくて、すぐに馴染めました。",
        },
      ],
    },
  },
  {
    id: "c10",
    name: "子ども学習支援サークルたけのこ",
    category: "ボランティア系",
    description: "市内の小中学生の学習をサポートしています。教育に興味がある方にぴったりです。",
    tags: ["少人数"],
    frequency: "週1回/金",
    members: "約14名",
    detail: {
      activityDays: "毎週 金（週1回）",
      activityTime: "17:00 - 19:00",
      activityPlace: "つくば市内の公民館",
      notices: [
        {
          date: "2026/04/01",
          title: "新年度の活動開始",
          body: "4月10日（金）から新年度の学習支援を開始します。",
        },
      ],
      gradeMembers: [
        { grade: 4, count: 3 },
        { grade: 3, count: 4 },
        { grade: 2, count: 4 },
        { grade: 1, count: 3 },
      ],
      facultyRatios: [
        { name: "教育学類", percent: 55 },
        { name: "心理学類", percent: 25 },
        { name: "その他", percent: 20 },
      ],
      atmosphereTags: ["少人数", "やりがい"],
      atmosphereDescription: "子どもたちに寄り添った学習支援を大切にしています。教育に関心のある方にぴったりです。",
      links: [
        {
          label: "公式サイト",
          text: "https://takenoko-support.example.com/",
          url: "https://takenoko-support.example.com/",
        },
      ],
      additionalInfo: "活動にはボランティア保険への加入が必要です。費用はサークルが負担します。",
      reviews: [
        {
          date: "2026/01/28",
          rating: 5,
          grade: "3年",
          department: "人間学群",
          comment: "子どもたちの成長を間近で見られるのが嬉しいです。",
        },
      ],
    },
  },
  {
    id: "c11",
    name: "ディベート研究会",
    category: "学術系",
    description: "社会問題をテーマに議論の力を鍛えています。全国大会への出場経験もあります。",
    tags: ["経験者優遇", "少人数"],
    frequency: "週1回/火",
    members: "約10名",
    detail: {
      activityDays: "毎週 火（週1回）",
      activityTime: "18:30 - 20:30",
      activityPlace: "人文社会学系棟 演習室",
      notices: [
        {
          date: "2026/03/22",
          title: "練習試合のお知らせ",
          body: "4月に他大学との練習試合を予定しています。",
        },
      ],
      gradeMembers: [
        { grade: 3, count: 4 },
        { grade: 2, count: 3 },
        { grade: 1, count: 3 },
      ],
      facultyRatios: [
        { name: "社会学類", percent: 40 },
        { name: "国際総合学類", percent: 40 },
        { name: "その他", percent: 20 },
      ],
      atmosphereTags: ["真面目", "議論好き"],
      atmosphereDescription: "毎回テーマを決めて真剣に議論しています。論理的に考える力が身につきます。",
      links: [
        {
          label: "X（Twitter）",
          text: "@debate_tsukuba_sample",
          url: "https://x.example.com/debate_tsukuba_sample",
        },
      ],
      reviews: [
      ],
    },
  },
  {
    id: "c12",
    name: "よさこい踊り隊 紫峰",
    category: "文化系",
    description: "学園祭や地域のお祭りで演舞を披露しています。踊りの経験がなくても大丈夫です！",
    tags: ["初心者歓迎", "兼サー可能"],
    frequency: "週2〜3回/水・土",
    members: "約60名",
    detail: {
      activityDays: "毎週 水・土（週2回）",
      activityTime: "18:00 - 21:00",
      activityPlace: "体芸エリア 多目的スペース",
      notices: [
        {
          date: "2026/04/09",
          title: "新歓演舞のお知らせ",
          body: "4月18日（土）に新歓演舞を披露します。ぜひ見に来てください！",
        },
        {
          date: "2026/03/14",
          title: "衣装制作スタート",
          body: "今年度の衣装制作を始めました。",
        },
      ],
      gradeMembers: [
        { grade: 4, count: 14 },
        { grade: 3, count: 16 },
        { grade: 2, count: 15 },
        { grade: 1, count: 15 },
      ],
      facultyRatios: [
        { name: "体育専門学群", percent: 30 },
        { name: "芸術専門学群", percent: 30 },
        { name: "その他", percent: 40 },
      ],
      atmosphereTags: ["アットホーム", "初心者歓迎"],
      atmosphereDescription: "踊りの経験がなくても大丈夫！大人数ならではの一体感が魅力です。",
      links: [
        {
          label: "公式サイト",
          text: "https://shiho-yosakoi.example.com/",
          url: "https://shiho-yosakoi.example.com/",
        },
        {
          label: "Instagram",
          text: "@shiho_yosakoi_sample",
          url: "https://instagram.example.com/shiho_yosakoi_sample",
        },
      ],
      reviews: [
        {
          date: "2026/03/26",
          rating: 5,
          grade: "2年",
          department: "体育専門学群",
          comment: "演舞が成功したときの達成感は格別です。",
        },
        {
          date: "2026/02/12",
          rating: 4,
          grade: "1年",
          department: "芸術専門学群",
          comment: "衣装づくりなど踊り以外の活動も楽しいです。",
        },
      ],
    },
  },
];
