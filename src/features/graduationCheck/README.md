# 卒業要件チェック 判定エンジン

成績CSV（TWINS）を入力として卒業要件の充足状況を判定し、UIが表示するだけで済む
判定結果オブジェクトを返す純粋なロジック層。React コンポーネントに依存しない。

## 設計方針

- **判定はすべてクライアント内で完結**する。成績データをサーバーへ送信しない
- 卒業要件はコードに書かず、**学類×入学年度ごとの要件データ**
  （`data/gradRequirementData.ts`）で持つ
- 判定は**必修 → 選択の順**で行い、マッチした科目を候補から消し込む
  （同じ科目の二重計上を防ぐ。選択要件間でも消し込む）
- 単位数は「確定（履修中を除く）」と「見込み（履修中を含む）」の2系統で返す
- 複数の候補科目から合計N単位を求める必修や、科目名指定を含む選択要件にも対応する
- 科目番号が空で評価が「認」の単位認定科目も、まず必修の科目名一致と明示的な選択規則を
  評価する。それでも分類できない場合は、関連科目へ推測配分せず `uncountedCourses` に残す

## 判定パイプライン

処理を次の段階に分けている。単位の誤分類を調べるときは、上から順に確認する。

1. `parseCsv.ts`: TWINS CSVを `Course[]` へ変換
2. `graduationCatalog.ts`: 開講年度別の静的JSONから同一授業番号を補完
3. `selectMatcher.ts`: 1科目が1つの選択規則に該当するか判定
4. `checkCompulsory.ts` / `checkSelect.ts`: 定義順に科目を消し込み
5. `courseAllocation.ts`: 必修・選択・対象外の割り当てと競合候補を記録
6. `progress.ts`: 小区分上限、グループ上限、必要単位を集計
7. `checkGraduation.ts`: 各段階を接続し、GPAを加えてレポート化

`report.details.allocationTraces` には、各科目の最終的な割り当てと、消し込み前に
該当したすべての選択規則が入る。`selectCandidates` が複数ある科目は規則が競合しており、
現在は `ruleIndex` が最小の規則（要件データで先に書かれた規則）へ割り当てられる。
原因調査では、まずこの競合と `uncounted` を確認する。

## 卒業要件データの移行方針

公式PDFから直接 `GradRequirement` を手書きせず、今後は次の3層に分ける。

1. Raw: PDFの原文、表セル、抽出警告を失わず保存
2. `curriculum/`: 出典付きの正規化形式で要件をレビュー・静的検証
3. `GradRequirement`: ブラウザで評価するためのコンパイル済み形式

正規化形式は公式表の科目区分と必修・選択を別軸で保持し、合算条件、読み替え、
年度・経過措置を表現する。否定条件だけで関連科目を確定する規則は検証エラーとし、
未分類の科目を例外区分へ自動計上しない。

## 使い方

```ts
import {
  parseGradesCsv,
  resolveRequirementIds,
  checkGraduationWithCatalog,
} from "../features/graduationCheck";

const { courses, errors } = parseGradesCsv(csvText); // errors はUIで行番号付き表示
const ids = resolveRequirementIds("情報メディア創成学類", 2023); // → ["mast-22"]
// 知識情報・図書館学類は主専攻ごとに3件返る → UIで選択させる
const report = await checkGraduationWithCatalog(courses, ids[0], "tsukuba");
```

公開APIでは必ず `checkGraduationWithCatalog` を使用する。同期版の `checkGraduation` は、
カタログ補完後の判定ロジックを単体テストするための内部関数であり、公開indexからはexportしない。

`report.catalogVerification` には、成績CSVの開講年度を基準として静的カタログで検証できた年度と、
未対応年度が記録される。対応年度のJSON取得に失敗した場合は判定を中止し、未対応年度は結果画面で
未検証として警告する。

## 判定後のDB保存

ログイン利用者の卒業要件確認では、既存の次の接続を維持する。

```text
GraduationCheckReport
  -> buildTimetableHistoriesFromGraduationReport
  -> saveTimetableHistories
  -> timetable_histories / timetable_history_courses
```

`Course.year` はTWINS成績CSVの開講年度列から取得し、年度別履歴と各科目行の
`academic_year`として保存する。生の成績CSV自体はDBへ送信しない。

判定結果の `uncountedCourses` には、利用者がこの画面内で正しい区分へ移動できるUIを表示する。
分類後は既存の区分上限を含めて単位を再集計するが、DBへは保存せず、ページを離れると破棄する。
将来の匿名回答蓄積用コードとマイグレーションは用意しているが、現在のUIからは接続していない。
将来案のデータ形式は `docs/course-classification-responses.md` を参照する。

## 区分マッピング

要件データの選択科目グループ（表示名）→ TsukuHub 5区分の対応は
`categoryMapping.ts` に集約している。

| グループ表示名（要件データ） | TsukuHub区分キー | 表示名 |
| --- | --- | --- |
| （必修判定の結果） | `compulsory` | 必修科目 |
| 専門科目選択 | `specialized` | 選択科目（専門） |
| 専門基礎科目選択 | `specializedFoundation` | 選択科目（専門基礎） |
| 共通科目選択 | `common` | 選択科目（共通） |
| 関連科目選択 | `related` | 選択科目（関連） |

対応が取れないグループは `details.unmappedGroupUnits` に単位数のみ記録し、
5区分の集計には含めない。

## 対応範囲

要件データが存在する学類・入学年度のみ（現在: 情報メディア創成学類
2021 / 2022〜2024 / 2025、情報科学類（ソフトウェアサイエンス・情報システム・
知能情報メディア）2022〜2026、工学システム学類（知的・機能工学システム・
エネルギー・メカニクス）2022〜2026、数学類・物理学類2022〜2026、
化学類2022〜2026、応用理工学類（応用物理・電子・量子工学・物性工学・
物質・分子工学）2022〜2026、
生物学類・生物資源学類・地球学類2022〜2026、社会工学類（社会経済システム・
経営工学・都市計画）2022〜2026、
人文学類（哲学・史学・考古学・民俗学・言語学）、比較文化学類、
日本語・日本文化学類、社会学類（社会学・法学・政治学・経済学）、
国際総合学類（国際関係学・国際開発学）、教育学類、心理学類、障害科学類、
医学類、看護学類、医療科学類、体育専門学群、芸術専門学群はいずれも2022〜2026、
知識情報・図書館学類（知識科学・
知識情報システム・情報資源経営）2021 / 2022〜2024）。
`resolveRequirementIds` が空配列を返したら対応外。

UIのプルダウン（学類 → 専攻 → 入学年度）は `data/supportedDepartments.ts` を
唯一のデータ定義として参照する。対応学類・専攻を増やすときは、要件データを
`data/requirements/` の学類別ファイルと `RequirementId` に足したうえで、
`supportedDepartments` に1件追加すればプルダウンに反映される（UIの修正は不要）。
選択結果から要件データキーを引くのは `resolveRequirementId(学類キー, 専攻キー, 入学年度)`。

## テスト

```
npm test
```

`tests/` に必修3記法・選択の消し込み・区分集計・GPA・A率のユニットテストがある。

## ライセンス・帰属

このディレクトリの判定ロジックと要件データは
[Mimori256/Graduation-Checker](https://github.com/Mimori256/Graduation-Checker)
（Mozilla Public License 2.0）を基に改変したもの。MPL-2.0 はファイル単位の
コピーレフトであり、由来するファイルには MPL-2.0 のヘッダを記載している。
これらのファイルの改変版を配布する場合も MPL-2.0 の条件（ソース入手可能性の
確保・ライセンス表示の維持）に従うこと。ライセンス全文は同梱の
[LICENSE](./LICENSE) を参照。
