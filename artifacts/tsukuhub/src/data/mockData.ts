import { ContentItem, Category } from "../types";

export const mockItems: ContentItem[] = [
  {
    id: "course-1",
    title: "データ工学概論",
    category: "授業・履修",
    tags: ["情報科学", "専門必修"],
    summary: "データベースの基礎と最新のデータ処理技術を学ぶ",
    body: "この授業では、リレーショナルデータベースの仕組みからNoSQL、ビッグデータ処理まで幅広く学びます。",
    updatedAt: "2023-10-01",
    instructor: "山田教授",
    semester: "Spring",
    schedule: "Tue 3rd period",
    credits: 2,
    ratings: {
      overall: 4,
      difficulty: 3,
      workload: 3,
      attendance: 4,
    },
    testFormat: "筆記",
    reviews: [
      {
        id: "r1",
        author: "情報メディア創成学類 3年",
        overall: 4,
        difficulty: 3,
        workload: 3,
        attendance: 4,
        testFormat: "筆記",
        studyMethod: "過去問を解く",
        comment: "先生の説明が丁寧で分かりやすい。課題は少し多めですが、しっかりやれば単位は取れます。",
        createdAt: "2023-09-15"
      }
    ]
  },
  {
    id: "course-2",
    title: "プログラミング入門",
    category: "授業・履修",
    tags: ["プログラミング", "初心者向け"],
    summary: "Pythonを用いたプログラミングの基礎",
    body: "プログラミング未経験者を対象に、Pythonを用いてプログラミングの基礎的な概念を学びます。",
    updatedAt: "2023-09-25",
    instructor: "田中教授",
    semester: "Spring",
    schedule: "Mon/Wed 2nd",
    credits: 2,
    ratings: {
      overall: 5,
      difficulty: 2,
      workload: 2,
      attendance: 5,
    },
    testFormat: "レポート",
    reviews: []
  },
  {
    id: "course-3",
    title: "メディアアート論",
    category: "授業・履修",
    tags: ["アート", "教養"],
    summary: "デジタルメディアを用いた芸術表現の歴史と現在",
    body: "テクノロジーとアートの融合について、歴史的な視点と現代の作品を通して考察します。",
    updatedAt: "2023-09-20",
    instructor: "鈴木教授",
    semester: "Fall",
    schedule: "Thu 4th",
    credits: 2,
    ratings: {
      overall: 4,
      difficulty: 2,
      workload: 3,
      attendance: 3,
    },
    testFormat: "レポート",
    reviews: []
  },
  {
    id: "course-4",
    title: "知覚認知心理学",
    category: "授業・履修",
    tags: ["心理学", "人間科学"],
    summary: "人間の知覚と認知のメカニズム",
    body: "人間がどのように世界を認識し、記憶し、思考するのかについて、心理学的なアプローチから学びます。",
    updatedAt: "2023-09-18",
    instructor: "佐藤教授",
    semester: "Spring",
    schedule: "Fri 2nd",
    credits: 2,
    ratings: {
      overall: 3,
      difficulty: 4,
      workload: 4,
      attendance: 4,
    },
    testFormat: "筆記",
    reviews: []
  },
  {
    id: "course-5",
    title: "統計学",
    category: "授業・履修",
    tags: ["数学", "データ分析"],
    summary: "データ分析の基礎となる統計学",
    body: "記述統計から推測統計まで、データ分析に必要な統計学の基礎を体系的に学びます。",
    updatedAt: "2023-09-10",
    instructor: "伊藤教授",
    semester: "Fall",
    schedule: "Mon 5th",
    credits: 2,
    ratings: {
      overall: 4,
      difficulty: 4,
      workload: 3,
      attendance: 3,
    },
    testFormat: "筆記",
    reviews: []
  },
  {
    id: "career-1",
    title: "長期インターン募集 (IT系スタートアップ)",
    category: "就活・キャリア",
    tags: ["長期インターン", "エンジニア"],
    summary: "つくば発のスタートアップでのWebエンジニアインターン",
    body: "React/Node.jsを用いた実務経験が積める長期インターンです。時給1200円〜、週2日から応相談。",
    updatedAt: "2023-10-05"
  },
  {
    id: "career-2",
    title: "サマーインターン締切情報",
    category: "就活・キャリア",
    tags: ["サマーインターン", "締切"],
    summary: "主要企業のサマーインターンエントリー締切まとめ",
    body: "コンサル、IT、メーカーなど主要企業のサマーインターン締切情報を随時更新しています。",
    updatedAt: "2023-06-01"
  },
  {
    id: "career-3",
    title: "ES対策完全ガイド",
    category: "就活・キャリア",
    tags: ["ES", "面接対策"],
    summary: "先輩が教える、通るESの書き方",
    body: "内定をもらった先輩たちの実例をもとに、ガクチカや志望動機の書き方を徹底解説します。",
    updatedAt: "2023-05-15"
  },
  {
    id: "career-4",
    title: "面接対策イベント",
    category: "就活・キャリア",
    tags: ["イベント", "面接対策"],
    summary: "OBOGによる模擬面接イベント開催のお知らせ",
    body: "来月、キャリアセンター主催で模擬面接イベントが開催されます。参加登録受付中です。",
    updatedAt: "2023-08-20"
  },
  {
    id: "career-5",
    title: "Tsukuba Intern掲載企業紹介",
    category: "就活・キャリア",
    tags: ["インターン", "企業紹介"],
    summary: "筑波大生向けのインターン求人サイトの紹介",
    body: "筑波大生を積極的に採用している企業のインターン情報がまとまっています。",
    updatedAt: "2023-07-10"
  },
  {
    id: "club-1",
    title: "筑波大学サッカー部",
    category: "サークル・課外活動",
    tags: ["体育会", "サッカー"],
    summary: "全国大会常連の強豪サッカー部",
    body: "週6日活動しています。マネージャーも募集中です。",
    updatedAt: "2023-04-01"
  },
  {
    id: "club-2",
    title: "吹奏楽団",
    category: "サークル・課外活動",
    tags: ["音楽", "吹奏楽"],
    summary: "年2回の定期演奏会に向けて活動中",
    body: "初心者から経験者まで幅広く在籍しています。楽器の貸し出しもあります。",
    updatedAt: "2023-04-05"
  },
  {
    id: "club-3",
    title: "起業家研究会",
    category: "サークル・課外活動",
    tags: ["ビジネス", "起業"],
    summary: "学生起業を目指す仲間のコミュニティ",
    body: "ビジネスプランコンテストへの参加や、実際のサービス開発を行っています。",
    updatedAt: "2023-04-10"
  },
  {
    id: "club-4",
    title: "国際交流サークルTIA",
    category: "サークル・課外活動",
    tags: ["国際交流", "言語"],
    summary: "留学生との交流イベントを定期開催",
    body: "英語カフェや文化交流パーティーなどを開催しています。語学力を伸ばしたい方におすすめです。",
    updatedAt: "2023-04-12"
  },
  {
    id: "club-5",
    title: "軽音楽部",
    category: "サークル・課外活動",
    tags: ["音楽", "バンド"],
    summary: "学内最大規模の音楽サークル",
    body: "ジャンル問わず様々なバンドが活動しています。初心者歓迎！",
    updatedAt: "2023-04-15"
  },
  {
    id: "life-1",
    title: "第三エリア食堂ガイド",
    category: "生活・便利情報",
    tags: ["学食", "ランチ"],
    summary: "三エリアの食堂のおすすめメニューと混雑時間帯",
    body: "おすすめはチキン竜田定食。お昼休み直後は非常に混雑するため、少し時間をずらすのがコツです。",
    updatedAt: "2023-10-02"
  },
  {
    id: "life-2",
    title: "中央図書館周辺カフェ",
    category: "生活・便利情報",
    tags: ["カフェ", "勉強スポット"],
    summary: "勉強に集中できる図書館周辺のカフェまとめ",
    body: "Wi-Fiと電源が完備されている、学生に人気のカフェをリストアップしました。",
    updatedAt: "2023-09-28"
  },
  {
    id: "life-3",
    title: "一人暮らしの始め方",
    category: "生活・便利情報",
    tags: ["一人暮らし", "新入生"],
    summary: "つくばでの物件探しから引っ越しまでの手順",
    body: "おすすめのエリア（天久保、春日など）の特徴と、家賃相場について解説します。",
    updatedAt: "2023-02-15"
  },
  {
    id: "life-4",
    title: "自転車修理スポット情報",
    category: "生活・便利情報",
    tags: ["自転車", "トラブル"],
    summary: "キャンパス内・周辺の自転車屋まとめ",
    body: "パンクなどの急なトラブル時に頼れる、大学周辺の自転車屋さんの営業時間と場所です。",
    updatedAt: "2023-05-10"
  },
  {
    id: "life-5",
    title: "つくば駅周辺飲食店まとめ",
    category: "生活・便利情報",
    tags: ["グルメ", "つくば駅"],
    summary: "サークルの打ち上げに使えるお店",
    body: "大人数で入れて、学生向けのコースがある居酒屋やレストランのリストです。",
    updatedAt: "2023-06-20"
  }
];

export const searchContent = (query: string, category?: string, tags: string[] = []) => {
  return mockItems.filter(item => {
    const matchQuery = !query || 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.summary.toLowerCase().includes(query.toLowerCase());
    const matchCategory = !category || category === "すべて" || item.category === category;
    const matchTags = tags.length === 0 || tags.some(tag => item.tags.includes(tag));
    return matchQuery && matchCategory && matchTags;
  });
};
