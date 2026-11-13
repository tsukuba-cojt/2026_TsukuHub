import type { SourceDocument } from "./types";

/**
 * 現在保管している公式卒業要件PDF。
 * editionYear はPDFの版を表し、学生の入学年度を表すものではない。
 */
export const officialCurriculumSources = [
  {
    documentId: "tsukuba-graduation-requirements-2021",
    fileName: "2021.pdf",
    kind: "official_graduation_requirements",
    editionYear: 2021,
    pageCount: 118,
    sha256: "b2be4ed06b4dfdad6a930de6af217c2a3b3664eb307bb97bb7e8d062a06dfd13",
  },
  {
    documentId: "tsukuba-graduation-requirements-2022",
    fileName: "2022.pdf",
    kind: "official_graduation_requirements",
    editionYear: 2022,
    pageCount: 118,
    sha256: "7a61e73099e0f1baa13a1a46ca3e0758c4398fe629526543694013cb573af478",
  },
  {
    documentId: "tsukuba-graduation-requirements-2023",
    fileName: "2023.pdf",
    kind: "official_graduation_requirements",
    editionYear: 2023,
    pageCount: 120,
    sha256: "e3ba733af90a4e273fce25959f00bf6a07ab32c762153c5e69ce4213ef2ca647",
  },
  {
    documentId: "tsukuba-graduation-requirements-2024",
    fileName: "2024.pdf",
    kind: "official_graduation_requirements",
    editionYear: 2024,
    pageCount: 121,
    sha256: "506f814c8dfc630f414cff49f440ac59cf1fda64306d1581cbd605152ef94c54",
  },
  {
    documentId: "tsukuba-graduation-requirements-2025",
    fileName: "2025.pdf",
    kind: "official_graduation_requirements",
    editionYear: 2025,
    pageCount: 127,
    sha256: "54030f8fe0e8d9e096a20e408300381d8f03ccaec08efab0412833c95e890174",
  },
  {
    documentId: "tsukuba-graduation-requirements-2026",
    fileName: "2026.pdf",
    kind: "official_graduation_requirements",
    editionYear: 2026,
    pageCount: 127,
    sha256: "745bab5a17c7612ccdf8aa3e6df3b670e2f224b434e895c3d01b36c0d313030b",
  },
] as const satisfies readonly SourceDocument[];

/** 台帳の並び順に依存せず、版年度から公式PDFを取得する。 */
export const getOfficialCurriculumSource = (
  editionYear: number,
): SourceDocument => {
  const source = officialCurriculumSources.find(
    (candidate) => candidate.editionYear === editionYear,
  );
  if (source === undefined) {
    throw new Error(`公式卒業要件PDFが未登録です: ${editionYear}`);
  }
  return source;
};

/** 建築士指定科目表。卒業要件PDFとは別台帳にし、対象課程・入学年度は本文で確認する。 */
export const officialArchitectCourseSources = [
  {
    documentId: "tsukuba-architect-course-list-urban-admission-2023",
    fileName: "工学システム_建築士科目.pdf",
    kind: "other",
    editionYear: 2023,
    pageCount: 2,
    sha256: "176d6aac33398b409e70b1161cbeb3441bf4bf0f1207cd7d11842743117d5589",
    provenanceNote: "利用者配置。本文は社会工学類・都市計画主専攻、対象入学2023、変更認定2023-03-28。ファイル名とは課程が異なるため都市計画の参考資料として保持。工シスには別途取得した正式資料を使用。",
  },
  {
    documentId: "tsukuba-architect-course-list-art-admission-2023",
    fileName: "芸術_建築士科目.pdf",
    kind: "other",
    editionYear: 2025,
    pageCount: 2,
    sha256: "3211f72d8fceffe64445d2244d5b15e419864d9feca53a7402063cb3c4c2835b",
    provenanceNote: "利用者配置。本文は芸術専門学群、対象入学2023、変更認定2025-03-25。認定日を対象入学年度と混同しない。",
  },
  {
    documentId: "tsukuba-qualification-guide-2023",
    fileName: "資格取得_2023.pdf",
    kind: "other",
    editionYear: 2023,
    pageCount: 93,
    sha256: "3203d223fe4d5934da842a20137b7365f9abd572575d900211b7554336a30f43",
    sourceUrl: "https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/4.pdf",
    retrievedAt: "2026-10-28",
    provenanceNote: "利用者の明示的なネット検索依頼に基づき取得。工シス・エネメカ指定科目表の年度別根拠。",
  },
  {
    documentId: "tsukuba-qualification-guide-2024",
    fileName: "資格取得_2024.pdf",
    kind: "other",
    editionYear: 2024,
    pageCount: 93,
    sha256: "ddfa2581579c5856258df4653f8a22887181825beca41fbd238b94a8b3c175bb",
    sourceUrl: "https://www.tsukuba.ac.jp/education/ug-courses-directory/2024/pdf/4.pdf",
    retrievedAt: "2026-10-28",
    provenanceNote: "利用者の明示的なネット検索依頼に基づき取得。工シス・エネメカ指定科目表の年度別根拠。",
  },
  {
    documentId: "tsukuba-qualification-guide-2025",
    fileName: "資格取得_2025.pdf",
    kind: "other",
    editionYear: 2025,
    pageCount: 95,
    sha256: "2f351c8dd6abc7ad61135aa660de11f3f88fb11c8da73ffd64a69f3a51bc0901",
    sourceUrl: "https://www.tsukuba.ac.jp/education/ug-courses-directory/2025/pdf/4.pdf",
    retrievedAt: "2026-10-28",
    provenanceNote: "利用者の明示的なネット検索依頼に基づき取得。工シス・エネメカ指定科目表の年度別根拠。",
  },
  {
    documentId: "tsukuba-qualification-guide-2026",
    fileName: "資格取得_2026.pdf",
    kind: "other",
    editionYear: 2026,
    pageCount: 94,
    sha256: "2d61139b67d25efcca4bb24eb64af499466a2ca205fed3b9d8d5cb5d391b5949",
    sourceUrl: "https://www.tsukuba.ac.jp/education/ug-courses-directory/2026/pdf/4.pdf",
    retrievedAt: "2026-10-28",
    provenanceNote: "利用者の明示的なネット検索依頼に基づき取得。工シス・エネメカ指定科目表の年度別根拠。",
  },
  {
    documentId: "tsukuba-esys-architect-admission-2023",
    fileName: "工学システム_建築士指定科目2023.pdf",
    kind: "other",
    editionYear: 2025,
    pageCount: 2,
    sha256: "f1bb552c0be3e84651d6aa277ddf602eee5d18eb05121ec02874fbf51749017b",
    sourceUrl: "https://www.jaeic.or.jp/assets/pdf/shiteikamoku-1k-202604/1_0811129260_2023_212038.pdf",
    retrievedAt: "2026-10-28",
    provenanceNote: "工学システム学類エネルギー・メカニクス向け。対象入学年度と資料の公開・認定年度を区別する。",
  },
  {
    documentId: "tsukuba-esys-architect-guide-2024",
    fileName: "工学システム_建築士履修手引き2024.pdf",
    kind: "other",
    editionYear: 2024,
    pageCount: 4,
    sha256: "a86c303d1b4d66b48297d26f28f35c4dce4a4aa18a7dfc7f2f6946b4ea33505f",
    sourceUrl: "https://www.esys.tsukuba.ac.jp/wordpress/wp-content/uploads/2024/06/FY2024_tebiki_36-39.pdf",
    retrievedAt: "2026-10-28",
    provenanceNote: "工学システム学類エネルギー・メカニクス向け。対象入学年度と資料の公開・認定年度を区別する。",
  },
  {
    documentId: "tsukuba-esys-architect-guide-2026",
    fileName: "工学システム_建築士履修手引き2026.pdf",
    kind: "other",
    editionYear: 2026,
    pageCount: 4,
    sha256: "5c2f808806f756f6f101f7f12d99ce97e7c0a4d979bc902d1d9a778054401bac",
    sourceUrl: "https://www.esys.tsukuba.ac.jp/wordpress/wp-content/uploads/2026/04/tebiki2026_30-33.pdf",
    retrievedAt: "2026-10-28",
    provenanceNote: "工学システム学類エネルギー・メカニクス向け。対象入学年度と資料の公開・認定年度を区別する。",
  },
] as const satisfies readonly SourceDocument[];

/** Q05/Q06の利用者依頼による公開資料調査。卒業細則の年度選択には混ぜない。 */
type SupplementarySourceDocument = Omit<SourceDocument, "editionYear"> & { editionYear?: number };

export const officialSupplementarySources = [
  {
    "documentId": "tsukuba-je-common-list-retrieved-20261028",
    "fileName": "JapanExpert_共通科目表_取得20261028.pdf",
    "kind": "other",
    "pageCount": 1,
    "sha256": "4e641c943dded7f7ba9c5dd699b805f9c926f97be2aff9a95d6714bc41204c00",
    "sourceUrl": "https://jp-ex.tsukuba.ac.jp/jp/wp-content/uploads/2025/05/8c8616d34792571af67a0dd107015d9d.pdf",
    "retrievedAt": "2026-10-28",
    "provenanceNote": "適用入学年度・改訂日は本文に明記なし。2025/05はURLの年月で、適用年度の証明ではない。"
  },
  {
    "documentId": "tsukuba-je-art-model-retrieved-20261028",
    "fileName": "日本芸術_カリキュラムモデル_取得20261028.pdf",
    "kind": "other",
    "pageCount": 1,
    "sha256": "4f72f4253ef5ba2cb9cebf4cee56a553f4efb1a4aa3c17b320f46d54387098ff",
    "sourceUrl": "https://jp-ex.tsukuba.ac.jp/jp/wp-content/uploads/2025/04/e3362df8f8abe3b2f638f84f44f98bac.pdf",
    "retrievedAt": "2026-10-28",
    "provenanceNote": "ビジュアルデザイン領域の履修例。卒業要件表・年度別指定一覧の代用にしない。"
  },
  {
    "documentId": "tsukuba-humanities-guide-2023",
    "fileName": "人文_履修の手引2023.pdf",
    "kind": "other",
    "pageCount": 46,
    "sha256": "82056393a931c99491ddf3d699008ae27fa2b86afa94f374a2084d07cfadca94",
    "sourceUrl": "https://www.jinbun.tsukuba.ac.jp/wp-content/uploads/sites/2/2026/07/2023-guide.pdf",
    "retrievedAt": "2026-10-28",
    "provenanceNote": "2023年度入学者用。URLの2026/07と対象入学年度を区別。変更はTWINS掲示で確認する。",
    "editionYear": 2023
  },
  {
    "documentId": "tsukuba-humanities-guide-2024",
    "fileName": "人文_履修の手引2024.pdf",
    "kind": "other",
    "pageCount": 46,
    "sha256": "eb1be25a13eea9bbedf774e87f0658fbdc59d003350235fa0f8dfa420b9acf44",
    "sourceUrl": "https://www.jinbun.tsukuba.ac.jp/wp-content/uploads/sites/2/2026/07/2024-guide.pdf",
    "retrievedAt": "2026-10-28",
    "provenanceNote": "2024年度入学者用。URLの2026/07と対象入学年度を区別。変更はTWINS掲示で確認する。",
    "editionYear": 2024
  },
  {
    "documentId": "tsukuba-humanities-guide-2025",
    "fileName": "人文_履修の手引2025.pdf",
    "kind": "other",
    "pageCount": 46,
    "sha256": "5e00259ec815ee11354a4b4a6a156e0390664cd279f26a1914942c58e724f0e2",
    "sourceUrl": "https://www.jinbun.tsukuba.ac.jp/wp-content/uploads/sites/2/2026/07/2025-guide.pdf",
    "retrievedAt": "2026-10-28",
    "provenanceNote": "2025年度入学者用。URLの2026/07と対象入学年度を区別。変更はTWINS掲示で確認する。",
    "editionYear": 2025
  },
  {
    "documentId": "tsukuba-humanities-guide-2026",
    "fileName": "人文_履修の手引2026.pdf",
    "kind": "other",
    "pageCount": 46,
    "sha256": "dc1fc3922ffaea330803beb61283b9c43754d265dea2847626a41b06c9204929",
    "sourceUrl": "https://www.jinbun.tsukuba.ac.jp/wp-content/uploads/sites/2/2026/07/2026-guide.pdf",
    "retrievedAt": "2026-10-28",
    "provenanceNote": "2026年度入学者用。URLの2026/07と対象入学年度を区別。変更はTWINS掲示で確認する。",
    "editionYear": 2026
  },
  {
    "documentId": "tsukuba-social-guide-2024",
    "fileName": "社会_履修の手引2024.pdf",
    "kind": "other",
    "pageCount": 37,
    "sha256": "a883cf0b754eb81ef4c1b1a025f87328a07a0c134575b90a53b927cf0f4c50a0",
    "sourceUrl": "https://shakai.tsukuba.ac.jp/wp-content/uploads/sites/42/2024/03/23c5ce02a8d0d095da9962b95327fdab.pdf",
    "retrievedAt": "2026-10-28",
    "provenanceNote": "PDF33頁の経済学履修ガイドはBC/FHを別途掲示指定としている。",
    "editionYear": 2024
  },
  {
    "documentId": "tsukuba-social-guide-2026",
    "fileName": "社会_履修の手引2026.pdf",
    "kind": "other",
    "pageCount": 30,
    "sha256": "ddd89f55bda8efc5019f5585be622189cea278e1f23df3a8887247ad60bb75d2",
    "sourceUrl": "https://shakai.tsukuba.ac.jp/wp-content/uploads/sites/42/2026/03/c68447558683da2c96b9519bb57a1934.pdf",
    "retrievedAt": "2026-10-28",
    "provenanceNote": "PDF27頁でもBC/FHを別途掲示指定。全番号一覧は本冊子では確定しない。",
    "editionYear": 2026
  },
  {
    "documentId": "tsukuba-international-guide-2026",
    "fileName": "国際総合_履修ガイド2026.pdf",
    "kind": "other",
    "pageCount": 36,
    "sha256": "fb13e9327eeae0c406e0b5f10639e110ffe21229220b6e9b76c7e175f1e205f3",
    "sourceUrl": "https://www.kokusai.tsukuba.ac.jp/curriculum/pdf/r08guide.pdf",
    "retrievedAt": "2026-10-28",
    "provenanceNote": "開設区分・履修案内の補足。2023〜2025入学者への遡及適用は未確認。",
    "editionYear": 2026
  },
  {
    "documentId": "tsukuba-art-offered-courses-2025",
    "fileName": "芸術_開設授業科目2025.pdf",
    "kind": "other",
    "pageCount": 31,
    "sha256": "a0132e85f2e4b0e3a1021abfad2c9d7546108d18a19e6084e98bacfd8033bb8b",
    "sourceUrl": "https://www.tsukuba.ac.jp/education/ug-courses-openclass/2025/pdf/art-design.pdf",
    "retrievedAt": "2026-10-28",
    "provenanceNote": "開講年度の番号・名称・単位を確認する資料。適用入学年度の要件は別途卒業細則による。",
    "editionYear": 2025
  },
  {
    "documentId": "tsukuba-art-offered-courses-2026",
    "fileName": "芸術_開設授業科目2026.pdf",
    "kind": "other",
    "pageCount": 34,
    "sha256": "fae6ea4cd334274e317cc7130f1c3094218f0d6c00013cfee3a9a774b1679416",
    "sourceUrl": "https://www.tsukuba.ac.jp/education/ug-courses-openclass/2026/pdf/art-design.pdf",
    "retrievedAt": "2026-10-28",
    "provenanceNote": "開講年度の番号・名称・単位を確認する資料。適用入学年度の要件は別途卒業細則による。",
    "editionYear": 2026
  }
] as const satisfies readonly SupplementarySourceDocument[];
