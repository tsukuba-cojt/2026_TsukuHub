export type CafeteriaCategory = "食堂" | "弁当" | "パン" | "その他";

export type PaymentMethod = "cash" | "credit" | "paypay";

export type CafeteriaTimeSlot = {
  days: number[];
  open: string;
  close: string;
};

export type CafeteriaHours = {
  lines: string[];
  slots: CafeteriaTimeSlot[];
};

export type CafeteriaMenuItem = {
  name: string;
  price: string;
};

export type CafeteriaNote = {
  text: string;
  isCaution?: boolean;
};

export type CafeteriaReview = {
  date: string;
  rating: number;
  grade: string;
  department: string;
  comment: string;
};

export type Cafeteria = {
  id: string;
  name: string;
  category: CafeteriaCategory;
  area: string;
  location: string;
  phone?: string;
  lat?: number;
  lng?: number;
  hours: CafeteriaHours;
  payments: Record<PaymentMethod, boolean>;
  rating: number;
  reviewCount: number;
  congestion: number[];
  mainMenu?: CafeteriaMenuItem[];
  notes?: CafeteriaNote[];
  sourceUrl: string;
};

export const cafeteriaCategories: CafeteriaCategory[] = ["食堂", "弁当", "パン", "その他"];

export const cafeteriaCategoryClass: Record<CafeteriaCategory, string> = {
  食堂: "isDining",
  弁当: "isBento",
  パン: "isBread",
  その他: "isOther",
};

export const paymentMethods: PaymentMethod[] = ["cash", "credit", "paypay"];

export const paymentLabels: Record<PaymentMethod, string> = {
  cash: "現金",
  credit: "クレジット",
  paypay: "PayPay",
};

export const CONGESTION_START_HOUR = 8;
export const CONGESTION_END_HOUR = 16;
export const CONGESTION_SLOT_MINUTES = 30;

const SLOT_COUNT = ((CONGESTION_END_HOUR - CONGESTION_START_HOUR) * 60) / CONGESTION_SLOT_MINUTES;

const WEEKDAYS = [1, 2, 3, 4, 5];
const MON_TO_SAT = [1, 2, 3, 4, 5, 6];
const WEEKEND = [0, 6];

const KOSEI = "https://kosei.sec.tsukuba.ac.jp/store";
const SUZUYA = "https://ssc.sec.tsukuba.ac.jp/office-of-student-welfare/temprary-menw/suzuyapan";
const TSUKUBA_DEMI =
  "https://ssc.sec.tsukuba.ac.jp/office-of-student-welfare/temprary-menw/koseii-facilities-list2/tsukuba-demi";

const weekday = (line: string, open: string, close: string): CafeteriaHours => ({
  lines: [line],
  slots: [{ days: WEEKDAYS, open, close }],
});

const congestionCurve = (peak: number, shift: number, seed: number): number[] =>
  Array.from({ length: SLOT_COUNT }, (_, index) => {
    const distance = index - (8 + shift);
    const lunch = Math.exp(-(distance * distance) / 3) * peak;
    const base = 14 + ((index * 7 + seed * 13) % 12);
    return Math.min(100, Math.round(base + lunch));
  });

export const mockCafeterias: Cafeteria[] = [
  {
    id: "area1-tsukuba-table",
    name: "第1エリア TSUKUBA TABLE",
    category: "食堂",
    area: "第1エリア",
    location: "第一エリア　1A棟",
    lat: 36.10824,
    lng: 140.1028,
    hours: weekday("11:00~13:30（月~金）", "11:00", "13:30"),
    payments: { cash: true, credit: true, paypay: true },
    rating: 3.9,
    reviewCount: 21,
    congestion: congestionCurve(72, 0, 1),
    notes: [{ text: "週替わりメニューあり" }],
    sourceUrl: `${KOSEI}/store_11`,
  },
  {
    id: "area1-soup-factory",
    name: "第1エリア スープファクトリー",
    category: "その他",
    area: "第1エリア",
    location: "第一エリア　1A棟",
    lat: 36.10824,
    lng: 140.1028,
    hours: {
      lines: ["11:30~14:30（月~金・L.O.14:00）"],
      slots: [{ days: WEEKDAYS, open: "11:30", close: "14:30" }],
    },
    payments: { cash: true, credit: false, paypay: true },
    rating: 3.7,
    reviewCount: 9,
    congestion: congestionCurve(55, 1, 2),
    notes: [{ text: "ハラルメニューあり" }],
    sourceUrl: `${KOSEI}/store_13`,
  },
  {
    id: "area1-suzuya",
    name: "第1エリア 鈴家",
    category: "パン",
    area: "第1エリア",
    location: "第一エリア　1D棟",
    lat: 36.10844,
    lng: 140.10184,
    hours: weekday("11:00~14:00（月~金）", "11:00", "14:00"),
    payments: { cash: true, credit: false, paypay: true },
    rating: 3.6,
    reviewCount: 8,
    congestion: congestionCurve(48, 0, 3),
    sourceUrl: SUZUYA,
  },
  {
    id: "library-starbucks",
    name: "中央図書館 スターバックス",
    category: "その他",
    area: "中央図書館",
    location: "中央図書館",
    lat: 36.1091,
    lng: 140.1014,
    hours: {
      lines: ["8:00~20:00（月~金）", "10:00~18:00（土日祝）"],
      slots: [
        { days: WEEKDAYS, open: "8:00", close: "20:00" },
        { days: WEEKEND, open: "10:00", close: "18:00" },
      ],
    },
    payments: { cash: true, credit: true, paypay: true },
    rating: 3.8,
    reviewCount: 18,
    congestion: congestionCurve(40, 1, 4),
    sourceUrl: `${KOSEI}/store_16`,
  },
  {
    id: "area2-cafeteria",
    name: "第2エリア 食堂",
    category: "食堂",
    area: "第2エリア",
    location: "第二エリア　2B棟1F",
    lat: 36.11102,
    lng: 140.10126,
    phone: "029-858-0871",
    hours: {
      lines: ["8:20~15:00（月~金）", "11:00~13:00（土）"],
      slots: [
        { days: WEEKDAYS, open: "8:20", close: "15:00" },
        { days: [6], open: "11:00", close: "13:00" },
      ],
    },
    payments: { cash: true, credit: false, paypay: false },
    rating: 4.0,
    reviewCount: 32,
    congestion: congestionCurve(78, 0, 5),
    mainMenu: [
      { name: "ハンバーグ各種", price: "720円〜" },
      { name: "チキン料理各種", price: "700円〜" },
      { name: "ポーク料理各種", price: "670円〜" },
      { name: "魚料理各種", price: "670円〜" },
      { name: "中華定食各種", price: "650円〜" },
      { name: "魚和風定食", price: "670円〜" },
      { name: "栄養定食", price: "550円" },
      { name: "丼ぶりもの", price: "500円〜" },
      { name: "カレーライス（普通盛／大盛）", price: "400円／480円" },
      { name: "朝食セット", price: "380円" },
    ],
    notes: [{ text: "土曜は短縮営業中" }, { text: "学外者利用不可", isCaution: true }],
    sourceUrl: `${KOSEI}/store_21`,
  },
  {
    id: "area2-noodle",
    name: "第2エリア 麺処",
    category: "食堂",
    area: "第2エリア",
    location: "第二エリア　2B棟",
    lat: 36.11102,
    lng: 140.10126,
    hours: weekday("11:00~13:00（月~金）", "11:00", "13:00"),
    payments: { cash: true, credit: false, paypay: false },
    rating: 3.5,
    reviewCount: 12,
    congestion: congestionCurve(70, 0, 6),
    sourceUrl: `${KOSEI}/store_21_01`,
  },
  {
    id: "area2-marhaban",
    name: "第2エリア カフェ マルハバン",
    category: "その他",
    area: "第2エリア",
    location: "第二エリア　2B棟",
    lat: 36.11102,
    lng: 140.10126,
    hours: weekday("11:45~14:00（月~金）", "11:45", "14:00"),
    payments: { cash: true, credit: true, paypay: false },
    rating: 3.8,
    reviewCount: 7,
    congestion: congestionCurve(45, 1, 7),
    notes: [{ text: "ハラル" }, { text: "テイクアウトのみ", isCaution: true }],
    sourceUrl: `${KOSEI}/store_22`,
  },
  {
    id: "area2-kona",
    name: "第2エリア 粉とクリーム",
    category: "パン",
    area: "第2エリア",
    location: "第二エリア　2B棟",
    lat: 36.11102,
    lng: 140.10126,
    hours: weekday("11:00~14:00（月~金）", "11:00", "14:00"),
    payments: { cash: true, credit: false, paypay: true },
    rating: 3.7,
    reviewCount: 10,
    congestion: congestionCurve(52, 0, 8),
    sourceUrl: `${KOSEI}/store_23`,
  },
  {
    id: "area3-cafeteria",
    name: "第3エリア 食堂",
    category: "食堂",
    area: "第3エリア",
    location: "第三エリア　3A棟1F",
    lat: 36.1105,
    lng: 140.10069,
    phone: "029-854-7303",
    hours: weekday("11:00~13:30（月~金）", "11:00", "13:30"),
    payments: { cash: true, credit: false, paypay: false },
    rating: 3.9,
    reviewCount: 24,
    congestion: congestionCurve(80, 0, 9),
    notes: [{ text: "うどん・そば＋新メニュー" }],
    sourceUrl: `${KOSEI}/store_31`,
  },
  {
    id: "area3-curry",
    name: "第3エリア カレー",
    category: "食堂",
    area: "第3エリア",
    location: "第三エリア　3A棟",
    lat: 36.1105,
    lng: 140.10069,
    hours: weekday("11:00~14:00（月~金）", "11:00", "14:00"),
    payments: { cash: true, credit: false, paypay: true },
    rating: 3.6,
    reviewCount: 11,
    congestion: congestionCurve(60, 0, 10),
    notes: [{ text: "短縮営業中", isCaution: true }],
    sourceUrl: `${KOSEI}/store_33`,
  },
  {
    id: "area3-kona",
    name: "第3エリア 粉とクリーム",
    category: "パン",
    area: "第3エリア",
    location: "第三エリア　3A棟",
    lat: 36.1105,
    lng: 140.10069,
    hours: {
      lines: ["パン 9:00~17:00", "パスタ 11:00~14:00（月~金）"],
      slots: [{ days: WEEKDAYS, open: "9:00", close: "17:00" }],
    },
    payments: { cash: true, credit: true, paypay: true },
    rating: 3.7,
    reviewCount: 13,
    congestion: congestionCurve(58, 0, 11),
    notes: [{ text: "ハラル弁当あり" }],
    sourceUrl: `${KOSEI}/store_36`,
  },
  {
    id: "area3-suzuya",
    name: "第3エリア 鈴家",
    category: "パン",
    area: "第3エリア",
    location: "第三エリア　3A棟1F",
    lat: 36.1105,
    lng: 140.10069,
    hours: weekday("11:00~14:00（月~金）", "11:00", "14:00"),
    payments: { cash: true, credit: false, paypay: true },
    rating: 3.8,
    reviewCount: 15,
    congestion: congestionCurve(50, 0, 12),
    sourceUrl: SUZUYA,
  },
  {
    id: "research-b-suzuya",
    name: "総合研究棟B 鈴家",
    category: "パン",
    area: "総合研究棟B",
    location: "総合研究棟B",
    lat: 36.1088,
    lng: 140.09982,
    hours: weekday("11:00~13:00（月~金）", "11:00", "13:00"),
    payments: { cash: true, credit: false, paypay: false },
    rating: 3.4,
    reviewCount: 5,
    congestion: congestionCurve(42, 0, 13),
    sourceUrl: SUZUYA,
  },
  {
    id: "research-b-bento",
    name: "総合研究棟B 弁当販売",
    category: "弁当",
    area: "総合研究棟B",
    location: "総合研究棟B 入口",
    lat: 36.1088,
    lng: 140.09982,
    hours: weekday("11:15~12:45（月~金）", "11:15", "12:45"),
    payments: { cash: true, credit: false, paypay: false },
    rating: 3.5,
    reviewCount: 6,
    congestion: congestionCurve(62, 0, 14),
    sourceUrl: `${KOSEI}/store_21`,
  },
  {
    id: "taigei-cafe",
    name: "体芸エリア 喫茶",
    category: "その他",
    area: "体芸エリア",
    location: "体芸福利厚生棟2F",
    lat: 36.10232,
    lng: 140.10329,
    hours: weekday("11:30~12:30（月~金）", "11:30", "12:30"),
    payments: { cash: true, credit: false, paypay: false },
    rating: 3.3,
    reviewCount: 4,
    congestion: congestionCurve(46, 0, 15),
    notes: [{ text: "パン・弁当のみ" }],
    sourceUrl: `${KOSEI}/store_62`,
  },
  {
    id: "taigei-bento",
    name: "体芸エリア 弁当販売",
    category: "弁当",
    area: "体芸エリア",
    location: "5C棟",
    lat: 36.10343,
    lng: 140.10307,
    hours: weekday("11:00~14:00（月~金）", "11:00", "14:00"),
    payments: { cash: true, credit: false, paypay: true },
    rating: 3.6,
    reviewCount: 8,
    congestion: congestionCurve(66, 0, 16),
    notes: [{ text: "売り切れ次第終了", isCaution: true }],
    sourceUrl: `${KOSEI}/98-2`,
  },
  {
    id: "taigei-bread",
    name: "体芸エリア パン販売",
    category: "パン",
    area: "体芸エリア",
    location: "5C棟",
    lat: 36.10343,
    lng: 140.10307,
    hours: weekday("11:00~14:00（月~金）", "11:00", "14:00"),
    payments: { cash: true, credit: false, paypay: false },
    rating: 3.5,
    reviewCount: 5,
    congestion: congestionCurve(44, 0, 17),
    sourceUrl: SUZUYA,
  },
  {
    id: "kasuga-bento",
    name: "春日エリア 弁当販売",
    category: "弁当",
    area: "春日エリア",
    location: "春日エリア　春日福利厚生棟",
    lat: 36.0863,
    lng: 140.1061,
    hours: weekday("11:20~12:40（月~金）", "11:20", "12:40"),
    payments: { cash: true, credit: false, paypay: false },
    rating: 3.8,
    reviewCount: 9,
    congestion: congestionCurve(60, 0, 18),
    notes: [{ text: "弁当のみ" }],
    sourceUrl: `${KOSEI}/store_91`,
  },
  {
    id: "medical-doctors-kitchen",
    name: "医学エリア Doctor's Kitchen",
    category: "食堂",
    area: "医学エリア",
    location: "医学福利厚生棟",
    lat: 36.09322,
    lng: 140.10317,
    hours: {
      lines: ["11:00~14:30（L.O.）", "17:00~20:30（L.O.）（月~土）"],
      slots: [
        { days: MON_TO_SAT, open: "11:00", close: "14:30" },
        { days: MON_TO_SAT, open: "17:00", close: "20:30" },
      ],
    },
    payments: { cash: true, credit: true, paypay: true },
    rating: 4.1,
    reviewCount: 14,
    congestion: congestionCurve(68, 1, 19),
    sourceUrl: `${KOSEI}/store_71`,
  },
  {
    id: "medical-lieben",
    name: "医学エリア リーベン",
    category: "その他",
    area: "医学エリア",
    location: "医学エリア",
    lat: 36.09322,
    lng: 140.10317,
    hours: weekday("9:00~16:00（月~金）", "9:00", "16:00"),
    payments: { cash: true, credit: true, paypay: false },
    rating: 3.6,
    reviewCount: 7,
    congestion: congestionCurve(50, 1, 20),
    notes: [{ text: "9:00~11:00はドリンク・デザートのみ", isCaution: true }],
    sourceUrl: `${KOSEI}/store_72`,
  },
  {
    id: "medical-suzuya",
    name: "医学エリア 鈴家",
    category: "パン",
    area: "医学エリア",
    location: "医学エリア",
    lat: 36.09322,
    lng: 140.10317,
    hours: weekday("11:00~16:00（月~金）", "11:00", "16:00"),
    payments: { cash: true, credit: false, paypay: true },
    rating: 3.5,
    reviewCount: 6,
    congestion: congestionCurve(46, 0, 21),
    sourceUrl: SUZUYA,
  },
  {
    id: "honbu-cafeteria",
    name: "本部棟 食堂",
    category: "食堂",
    area: "本部棟",
    location: "本部棟",
    lat: 36.11142,
    lng: 140.10396,
    hours: weekday("11:00~13:30（月~金）", "11:00", "13:30"),
    payments: { cash: true, credit: false, paypay: false },
    rating: 3.6,
    reviewCount: 10,
    congestion: congestionCurve(64, 0, 22),
    sourceUrl: `${KOSEI}/store_41`,
  },
  {
    id: "honbu-suzuya",
    name: "本部棟 鈴家",
    category: "パン",
    area: "本部棟",
    location: "本部棟",
    lat: 36.11142,
    lng: 140.10396,
    hours: weekday("11:00~14:00（月~金）", "11:00", "14:00"),
    payments: { cash: true, credit: false, paypay: true },
    rating: 3.4,
    reviewCount: 4,
    congestion: congestionCurve(40, 0, 23),
    sourceUrl: SUZUYA,
  },
  {
    id: "kaikan-tsukuba-demi",
    name: "大学会館 筑波デミ",
    category: "食堂",
    area: "大学会館",
    location: "大学会館 本館",
    lat: 36.10543,
    lng: 140.10176,
    phone: "029-855-6306",
    hours: {
      lines: ["ランチ 11:15~13:15（L.O.）", "ディナー 17:00~20:30（月~金）"],
      slots: [
        { days: WEEKDAYS, open: "11:15", close: "13:15" },
        { days: WEEKDAYS, open: "17:00", close: "20:30" },
      ],
    },
    payments: { cash: true, credit: true, paypay: false },
    rating: 4.0,
    reviewCount: 8,
    congestion: congestionCurve(58, 0, 24),
    notes: [{ text: "ディナーは予約制", isCaution: true }, { text: "団体は要連絡" }],
    sourceUrl: TSUKUBA_DEMI,
  },
  {
    id: "kitchen-car",
    name: "キッチンカー",
    category: "その他",
    area: "各エリア",
    location: "各エリア",
    hours: weekday("11:00~14:00（月~金・医学エリアは10:30~13:30）", "11:00", "14:00"),
    payments: { cash: true, credit: false, paypay: true },
    rating: 3.7,
    reviewCount: 12,
    congestion: congestionCurve(54, 0, 25),
    notes: [
      { text: "売り切れ次第終了", isCaution: true },
      { text: "工事のため一部エリア休止", isCaution: true },
    ],
    sourceUrl: `${KOSEI}/store_86-2`,
  },
];

export const mockCafeteriaReviews: CafeteriaReview[] = [
  {
    date: "2026/10/28",
    rating: 4,
    grade: "2年",
    department: "情報学群",
    comment: "サンプルコメント　12時台は混むので、2限が早く終わった日に行くのがおすすめです。",
  },
  {
    date: "2026/10/15",
    rating: 5,
    grade: "3年",
    department: "理工学群",
    comment: "サンプルコメント　ボリュームがあって値段も手頃。授業の合間にさっと食べられます。",
  },
  {
    date: "2026/09/30",
    rating: 3,
    grade: "1年",
    department: "人文・文化学群",
    comment: "サンプルコメント　メニューは豊富ですが、ピーク時は席の確保が少し大変でした。",
  },
];
