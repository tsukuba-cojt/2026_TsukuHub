# 卒業要件の正規化形式

現在の実装状況、未解決事項、次の作業手順は
[`CURRENT_STATUS.md`](./CURRENT_STATUS.md) にまとめている。

このディレクトリは、PDF抽出直後のRaw JSONとブラウザ判定用データの間に置く、
レビュー可能な正規化形式を定義する。

正規化移行の対応範囲は2023〜2026年度入学者である。留年等により標準修業年限を超えて
在籍するケースは対象外とし、既存のレガシー判定データは移行完了まで変更しない。

```text
公式PDF
  -> Raw（原文・セル・警告を保持）
  -> NormalizedCurriculum（このディレクトリ）
  -> 静的検証・人手承認
  -> GradRequirement（当面のブラウザ実行形式）
```

## 設計上の重要事項

- 公式表の「専門等の区分」と「必修・選択等」を `placement` の別軸で保持する
- 単位数の表示文字列は判定に使わず、`exact` / `minimum` / `maximum` を使う
- 小区分をまたぐ条件は `aggregateConstraints` へ分離する
- 読み替えは `equivalencies` へ分離する
- 履修順序、GPA、未構造化の条件は `additionalConstraints` へ分離する
- すべての要件と合算制約に公式資料の `sourceRefs` を持たせる
- PDFの版年度と入学年度、PDFページと印刷ページ表示を混同しない
- 関係する表セル・注記を `sourceCoverage` ですべて棚卸しする
- 否定条件だけの matcher は静的検証でエラーにする
- 公式の補集合条件は `all_courses` で母集合を明示してから除外条件を記述する
- 成績CSVにない組織・タグ等は `MatcherResolution` で科目番号・科目名へ解決する
- 一致なしは `unclassified`、複数一致は原則 `ambiguous` とし、関連科目へ流さない
- `approved` でない要件を実行用形式へコンパイルしない

## 現行形式との関係

既存の `GradRequirement` はすぐには廃止しない。移行期間中はコンパイル済みの
実行形式として扱い、学類単位で正規化データへ移行する。正規化データと既存結果を
比較する回帰テストを通した後に、データの参照先を切り替える。

4年度分のPDF比較と、それを踏まえた処理手順は
[`yearly-pdf-analysis.md`](./yearly-pdf-analysis.md) を参照する。

実データ検証は `pilots/coinsSoftwareScience2023.ts`、
`pilots/coinsSoftwareScience2024.ts`、`pilots/coinsSoftwareScience2025.ts`、
`pilots/coinsSoftwareScience2026.ts` に置いている。
各年度の二重開設は対応するKDB固定
スナップショットから解決済みだが、個別許可等が残るため、現時点では意図的にコンパイル不可である。
カタログの出典と再生成手順は `catalog/README.md` を参照する。

