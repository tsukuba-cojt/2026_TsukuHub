// 口コミのモックデータモジュール。
// 口コミ用の DB（Supabase テーブル）は後日用意するため、当面はここから読む。
// DB 移行時はこの Review 型に合わせた取得関数を実装し、
// ClassDetail.tsx / ClassReviewCard.tsx の読み込み元だけ差し替えればよい。

export type Review = {
  id: string;
  rating: number; // 1〜5
  grade: string; // 学年（例：3年）
  department: string; // 学群・学類
  comment: string;
  date: string; // YYYY/MM/DD
  helpfulCount: number;
  tags: string[];
  files?: string[]; // 添付ファイル名（無ければ非表示）
};

export const mockReviews: Review[] = [
  {
    id: "r1",
    rating: 4,
    grade: "3年",
    department: "情報学群",
    comment:
      "サンプルコメント　Pythonの基礎から丁寧に学べます！課題は多めだけど質問はしやすいです\nデータ分析に興味がある人にはおすすめ",
    date: "2026/05/20",
    helpfulCount: 21,
    tags: ["課題が多い"],
  },
  {
    id: "r2",
    rating: 5,
    grade: "2年",
    department: "理工学群",
    comment:
      "毎回の講義資料がとてもわかりやすく、独学では挫折しがちな統計の基礎もすんなり理解できました。期末試験は講義内容をきちんと復習していれば十分対応できます。実データを使った演習が多く、手を動かしながら学べるのが良かったです。TAのサポートも手厚く、課題でつまずいてもすぐに質問できる環境が整っています。プログラミング未経験の友人も最後までついていけていたので、幅広い人におすすめできる授業だと思います。",
    date: "2026/05/12",
    helpfulCount: 34,
    tags: ["わかりやすい", "実践的"],
    files: ["過去問まとめ.pdf"],
  },
  {
    id: "r3",
    rating: 4,
    grade: "3年",
    department: "情報学群",
    comment:
      "サンプルコメント　Pythonの基礎から丁寧に学べます！課題は多めだけど質問はしやすいです\nデータ分析に興味がある人にはおすすめ",
    date: "2026/05/10",
    helpfulCount: 8,
    tags: ["先生が優しい"],
  },
  {
    id: "r4",
    rating: 3,
    grade: "1年",
    department: "総合学域群",
    comment:
      "内容は面白いが、毎週の課題がかなり重いので他の授業との兼ね合いに注意。",
    date: "2026/04/28",
    helpfulCount: 5,
    tags: ["課題が多い"],
  },
  {
    id: "r5",
    rating: 5,
    grade: "4年",
    department: "情報学群",
    comment:
      "研究で機械学習を使う予定の人は絶対に取っておくべき。基礎が固まります。",
    date: "2026/04/15",
    helpfulCount: 13,
    tags: ["実践的", "わかりやすい"],
  },
];

// 関連授業のモック（DB に関連情報が入り次第差し替える）
export type RelatedCourse = {
  title: string;
  code: string;
};

export const mockRelatedCourses: RelatedCourse[] = [
  { title: "データサイエンス基礎", code: "AB2006" },
  { title: "統計学入門", code: "AB0311" },
];
