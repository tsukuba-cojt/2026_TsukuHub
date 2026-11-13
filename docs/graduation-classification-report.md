# 卒業要件チェックの誤分類報告

詳細画面の「誤分類を報告」で、同じ結果ページ内の報告画面へ切り替える。
科目番号・科目名を残し、単位数・成績・詳細・口コミの4列を「変更後の分類」の選択ボタンへ置き換える。
各区分が現在の分類を表す。変更先は現在と異なる5区分から選択でき、未分類は候補に含めない。同じボタンを再度押すと解除する。
同じ分類内の同じ科目番号・科目名は再履修などで複数行あっても1件にまとめる。

メールはログイン中のユーザーの登録情報から取得し、手入力・修正はできない。未ログイン・メール未登録・認証確認中は報告できない。
選択した科目だけ「報告内容を確認」で確認し、「この内容で報告を送信」でSupabaseの `class_miscategorized_report` へ一括保存する。
送信中は再送信・選択変更・画面内の戻るボタンを無効化する。失敗時は選択内容を保持して再試行できる。成功時は選択と確認表示を解除する。
テストモードは確認のみ利用でき、保存しない。
分類結果や取得単位数も変更しない。詳細画面へ戻るとフォームは破棄する。

## データ構造

`src/features/graduationCheck/classificationReport.ts` の `ClassificationReport[]` を画面内の確認データとする。1科目につき以下の5項目。

| キー | 型 | 内容 |
| --- | --- | --- |
| reporterEmail | string | 報告ユーザーのメールアドレス（前後の空白を除去） |
| courseCode | string | 科目番号（空文字も許可） |
| courseName | string | 科目名 |
| originalClassification | ReportClassification | 報告画面を開いた時点の分類 |
| correctedClassification | CategoryKey | ユーザーが選んだ正しい分類（5区分のみ） |

変更前の分類値は既存の `CategoryKey` に `unclassified` を追加したもの。変更後の分類値は `CategoryKey` のみとする。
`compulsory`（必修）、`specialized`（専門）、`specializedFoundation`（専門基礎）、`common`（共通）、`related`（関連）、`unclassified`（未分類）。表示名は結果レポートから取得する。

```json
[
  {
    "reporterEmail": "student@example.com",
    "courseCode": "GA12345",
    "courseName": "テスト科目",
    "originalClassification": "specialized",
    "correctedClassification": "related"
  }
]
```

`buildClassificationReports` がメール形式、1件以上の選択、科目名の存在、変更前後の分類が異なることを検証する。科目番号がなくても報告でき、空文字のまま送信予定データに含める。
保存処理は `src/services/classMiscategorizedReportService.ts`。呼び出し元からメールを受け取らず、`supabase.auth.getUser()` で登録メールを取得し、入力検証後に次の列へ変換する。

| DB列（すべてtext） | 取得元 |
| --- | --- |
| mail | 認証ユーザーの登録メール |
| classname | courseName |
| classnumber | courseCode（空文字を許可） |
| miscategorize | originalClassification |
| suggestedcategorize | correctedClassification |

実DBの列名は `suggestedcategorize`。当初の共有定義にあった `suggestcategorize` とは異なる。読み取り専用のAPI確認で、後者は PostgreSQL `42703`（列が存在しない）を返すことを確認済み。

DB内の分類値は既存の `class_categorize` に合わせ、専門基礎だけ `specialized_foundation` とする。他は `compulsory`、`specialized`、`common`、`related`、`unclassified`。変更後には未分類を選択できない。
## 保存権限の設定（42501への対応）

`42501` はテーブルのINSERT権限不足やRLSポリシーによる拒否を示す。
Supabase DashboardのSQL Editorで `supabase/migrations/20261113193000_class_miscategorized_report_insert_policy.sql` を実行する。
このSQLはRLSを有効化し、`authenticated` にINSERT権限と、`mail` が認証済みJWTの登録メールと一致する場合のみ許可するINSERTポリシーを追加する。
科目番号の空文字を許可する。SELECT・UPDATE・DELETEの権限やポリシーは追加しない。
リポジトリへのSQLファイル追加だけでは本番DBへ反映されない。

適用後、ログイン中の画面から再度報告する。DB上で検証する場合は `supabase/tests/class_miscategorized_report_rls.sql` を使う（末尾でロールバック）。
なお、既存の別ポリシーにRESTRICTIVE条件がある場合や、ID列に連番シーケンスを使う場合は、追加の条件・シーケンス権限も確認する。
