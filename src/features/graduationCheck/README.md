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

## 使い方

```ts
import {
  parseGradesCsv,
  resolveRequirementIds,
  checkGraduation,
} from "../features/graduationCheck";

const { courses, errors } = parseGradesCsv(csvText); // errors はUIで行番号付き表示
const ids = resolveRequirementIds("情報メディア創成学類", 2023); // → ["mast-22"]
// 知識情報・図書館学類は主専攻ごとに3件返る → UIで選択させる
const report = checkGraduation(courses, ids[0]);
```

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
2023〜2024 / 2025、知識情報・図書館学類（知識科学・知識情報システム・
情報資源経営）2023〜2024）。`resolveRequirementIds` が空配列を返したら対応外。

UIのプルダウン（学類 → 専攻 → 入学年度）は `data/supportedDepartments.ts` を
唯一のデータ定義として参照する。対応学類・専攻を増やすときは、要件データを
`data/gradRequirementData.ts` と `RequirementId` に足したうえで、
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
