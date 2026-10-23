# CSVによる卒業要件判定テスト

`test_graduation_check.py` は `../data/*.csv` をすべて読み込み、同名の `*.expected.json` に記載した期待結果と比較する統合テストである。データディレクトリ名は既存の `data` を使用する。

## 構成と処理

```text
tests/
├── data/
│   ├── mast-2023-mixed.csv
│   ├── mast-2023-mixed.expected.json
│   ├── coins-ss-2023-mixed.csv
│   ├── coins-ss-2023-mixed.expected.json
│   ├── math-2023-mixed.csv
│   └── math-2023-mixed.expected.json
└── script/
    ├── test_graduation_check.py
    └── run_graduation_check.ts
```

1. Pythonが実CSVと期待結果のJSONを読み込む。
2. `run_graduation_check.ts` が画面と同じ `resolveRequirementId` で学類・主専攻・入学年度に対応する要件を選ぶ。
3. 本番の `parseGradesCsv` と `checkGraduationWithCatalog` でCSVを解析・判定する。
4. Pythonが返された解析結果・判定結果を期待値と比較する。

ブラウザの `fetch` のみ、`public/data/graduation/` にある実際の年度別カタログJSONの読み込みに置き換える。CSV解析・カタログ照合・単位集計・GPA計算はモックに置き換えない。通信やDB保存は行わない。

## 検証内容

| 項目 | 確認する内容 |
| --- | --- |
| CSV解析 | 読み取れた科目数、パースエラー一覧 |
| 要件選択 | 学類・主専攻・入学年度から選ばれた要件ID |
| カタログ照合 | 照合した開講年度と未対応年度 |
| 単位集計 | 必要単位、取得単位、履修中を含む見込み単位、不足単位 |
| 区分別集計 | 必修・専門・専門基礎・共通・関連の必要単位、取得単位と見込み単位 |
| 卒業要件の充足 | 全体の充足結果、指定した必修科目・科目群の充足結果 |
| GPA・A率 | GPA、GPA対象単位、A率 |
| 科目の分類 | 全科目の割り当て先。D評価でも分類先を保持し、取得単位には含めないこと |
| データの配置 | CSVと期待結果のJSONが1対1で存在すること。CSVが0件の場合も失敗する |

現在のデータは3学類分であり、全対応学類・全専攻・全年度を網羅しているわけではない。Reactの開始ボタン、同意画面、ログイン状態別の保存、結果画面への遷移はこのテストの対象外である。

## 実行方法

プロジェクトのNode.js環境と、`npm ci` で導入した依存パッケージ、Python 3.10以上を使用する。Python用の追加パッケージは不要。

`src` ディレクトリから実行する。

```bash
python3 features/graduationCheck/tests/script/test_graduation_check.py
```

TypeScriptはプロジェクトに導入済みのコンパイラで一時ディレクトリへコンパイルし、終了後に削除する。実行場所のカレントディレクトリに依存せず、スクリプト自身の場所からデータを探索する。

`unittest` の表示は1テストで、その中のCSVごとのサブテストとして3ケースを実行する。失敗するとCSV名と不一致の項目を表示する。

## 他学類・他専攻のケース追加

`data/` に次の2ファイルを追加する。Python・TypeScriptの変更は不要。

- `<ケース名>.csv`：TWINSと同じ列構成の架空の成績データ。科目番号はケース内で重複させない。
- `<ケース名>.expected.json`：画面での選択条件と、独立に計算・確認した期待結果。

JSONの形は既存ファイルを参照する。

```json
{
  "selection": {
    "departmentKey": "math",
    "majorKey": "math",
    "admissionYear": 2023
  },
  "expected": {
    "courseCount": 9,
    "csvErrors": [],
    "requirement": { "id": "math-22" },
    "summary": {},
    "categories": {},
    "gpa": {},
    "assignments": {}
  }
}
```

上記は構造の説明用であり、空のオブジェクト部分には既存ケースと同様に具体的な期待値を記入する。`selection` のキーは `data/supportedDepartments.ts` の定義に合わせる。

`assignments` は「科目番号 → `compulsory` / `specialized` / `specializedFoundation` / `common` / `related` / `uncounted`」を全科目分指定し、完全一致で比較する。それ以外のオブジェクトは指定項目の部分一致、配列は全要素の一致、浮動小数点数は小数点以下9桁の精度で比較する。

## 確認結果

2026年10月23日時点で3ケースすべて成功。別の一時ディレクトリにコピーしたCSVの単位数を変更すると失敗すること、期待結果のJSONを欠落させると失敗することも確認した。
