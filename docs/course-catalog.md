# 年度別授業カタログ

授業情報はSupabaseのテーブルではなく、`public/data/courses/`の静的JSONとして配信する。
ブラウザが複数年度を一括取得しないよう、年度ごとにファイルを分割している。

| 開講年度 | ファイル | 固定CSV |
| --- | --- | --- |
| 2023 | `tsukuba-2023.json` | `kdb-20240331.csv` |
| 2024 | `tsukuba-2024.json` | `kdb-20250331.csv` |
| 2025 | `tsukuba-2025.json` | `kdb-20251031.csv` |
| 2026 | `tsukuba-2026.json` | `kdb-20261016.csv` |

2023〜2026年度は、上流リポジトリのコミットとSHA-256を固定する。各JSONは開講年度、
元CSVのスナップショット日、URL、SHA-256、行数、スキップ件数、解析警告件数を保持する。
各授業にも `academic_year` を付与し、同じ科目番号が複数年度に存在しても区別する。

## 再生成

固定済みの2026年度データだけを再生成・検証する。

```sh
npm run sync:courses
```

授業JSONと卒業要件用の派生JSON、カリキュラム検証用スナップショットを一括再生成する。

```sh
npm run sync:catalog-assets
```

授業JSONを変更せず、卒業要件チェックで使う軽量な同一授業グループJSONだけを再生成する。

```sh
npm run sync:graduation-catalog
```

ダウンロード済みCSVから特定年度だけを生成する場合は、`YEAR=PATH`を渡す。

```sh
npm run sync:courses -- 2023=path/to/kdb-20240331.csv
```

旧年度CSVにはヘッダーと教室列があるため、生成処理は固定列位置ではなくヘッダー名から
教員・概要・備考を解決する。科目番号が空の継続行は記録件数へ残したうえで授業一覧から除外する。

## アプリからの利用

`listCatalogCourses(slug, academicYear)`、`getCatalogCourse(slug, code, academicYear)`、
`getCatalogCoursesByCodes(slugOrId, codes, academicYear)`で年度を指定できる。年度を省略した場合は
現行年度の `{slug}-2026.json` を読む。授業検索画面では選択中の年度ファイルだけを取得する。
ブラウザ内のカタログキャッシュは直近2年度までとし、年度切り替えを繰り返しても全年度分を
メモリへ保持し続けない。

卒業要件チェックは成績CSVに含まれる開講年度に対応した
`public/data/graduation/{slug}-{academicYear}-cross-listings.json`だけを取得する。同一授業として
除外区分でも開講されている科目を、補集合形式の関連科目へ誤って算入しないために使用する。
成績データはサーバーへ送らず、ブラウザ内で静的JSONと照合する。
