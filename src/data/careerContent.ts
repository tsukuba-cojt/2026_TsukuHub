export type CareerArticle = { id: string; category: string; title: string; description: string; publishedAt: string; readMinutes: number };
export type AlumniStory = {
  id: string; graduationYear: number; faculty: string; destination: string; role: string;
  title: string; summary: string; tags: string[]; startedAt: string; targetIndustries: string;
  challenge: string; actions: string; advice: string; currentWork: string;
};

export const careerArticles: CareerArticle[] = [
  { id: "schedule", category: "就活準備", title: "就活はいつから？学年別の準備リスト", description: "授業や研究と両立しながら進めるための、無理のないスケジュールを紹介します。", publishedAt: "2026-07-20", readMinutes: 6 },
  { id: "internship", category: "長期インターン", title: "初めての長期インターン選びで確認したいこと", description: "仕事内容、勤務条件、成長環境を求人票から読み取るポイントを整理します。", publishedAt: "2026-07-12", readMinutes: 7 },
  { id: "interview", category: "面接対策", title: "研究や授業の経験を面接で伝える方法", description: "専門外の相手にも伝わるように、経験を短く組み立てる方法を解説します。", publishedAt: "2026-07-03", readMinutes: 5 },
];

export const alumniStories: AlumniStory[] = [
  { id: "sample-engineer", graduationYear: 2025, faculty: "情報学群（サンプル）", destination: "IT・SaaS業界", role: "ソフトウェアエンジニア", title: "研究と開発経験を、自分の言葉で結び直した就活", summary: "大学院進学と就職で迷いながら、自分が大切にしたい働き方を整理したサンプル体験記です。", tags: ["エンジニア", "長期インターン"], startedAt: "学部3年の夏", targetIndustries: "IT、教育サービス", challenge: "研究内容と企業での仕事のつながりを説明すること", actions: "長期インターンでチーム開発を経験し、週ごとに学びを言語化しました。", advice: "周囲の速さではなく、自分が確かめたいことから行動を決めてください。", currentWork: "学習支援プロダクトの機能開発（サンプル）" },
  { id: "sample-business", graduationYear: 2024, faculty: "社会・国際学群（サンプル）", destination: "コンサルティング業界", role: "ビジネスコンサルタント", title: "興味の広さを、課題解決という軸にまとめた", summary: "業界を絞れない悩みから、仕事選びの軸を見つけたサンプル体験記です。", tags: ["営業・ビジネス", "自己分析"], startedAt: "学部3年の春", targetIndustries: "コンサルティング、メーカー", challenge: "関心のある業界が多く、志望理由がぼやけたこと", actions: "OB・OG訪問のたびに仕事内容と自分の反応を記録しました。", advice: "最初から一つに決めず、会った人や仕事から仮説を更新してみてください。", currentWork: "地域企業の新規事業支援（サンプル）" },
  { id: "sample-marketer", graduationYear: 2023, faculty: "人文・文化学群（サンプル）", destination: "メディア業界", role: "マーケター", title: "課外活動の小さな工夫を、仕事の強みに変えた", summary: "サークル広報の経験を起点にキャリアを考えたサンプル体験記です。", tags: ["マーケティング", "課外活動"], startedAt: "学部2年の冬", targetIndustries: "広告、メディア、IT", challenge: "自分には特別な実績がないと思い込んでいたこと", actions: "日々の改善を数字と行動に分け、ポートフォリオとしてまとめました。", advice: "目立つ成果だけでなく、考えて改善した過程を大切にしてください。", currentWork: "Webサービスのコンテンツ企画（サンプル）" },
];
