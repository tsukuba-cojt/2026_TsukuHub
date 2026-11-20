# Supabase setup

Supabase Dashboard の SQL Editor で、`migrations` 内のSQLをファイル名順に実行します。

1. `20260729090000_career_platform.sql`
2. `20260729120000_content_management.sql`
3. `20260811090000_timetable_history_and_reviews.sql`
4. `20260811121000_security_hardening.sql`
5. `20260813130000_multi_university.sql`

最後のmigrationは、筑波大学・大阪大学、大学別機能、掲載対象、全体管理者許可リスト、大学別RLSを作成し、既存データを筑波大学へ移行します。

誤分類報告の保存で `42501` が発生する場合は、既存の `class_miscategorized_report` テーブルに対して
`migrations/20261113193000_class_miscategorized_report_insert_policy.sql` をSQL Editorで実行します。
ログインユーザー本人の登録メールによるINSERTを許可します。

## Auth Hook

本番では Supabase Dashboard の **Authentication → Hooks → Before User Created** に、Postgres関数 `public.hook_restrict_signup_by_university` を設定してください。クライアントから改ざんされた大学スラッグ、登録停止中の大学、許可外メールドメインをユーザー作成前に拒否します。

ローカル環境とAuth APIの直接呼び出しにも同じ制限を適用するため、migrationは `auth.users` に検証トリガーも作成します。

## パスワード再設定

大学別・企業向け・管理者のログイン画面にある「パスワードをお忘れの方」から、Supabase Auth の再設定メールを送信できます。この機能のセットアップは Supabase Dashboard とフロントエンドのデプロイで完了します。

1. **Authentication → URL Configuration** で **Site URL** を本番の TsukuHub の URL に設定します。**Redirect URLs** に以下を追加し、`https://app.example.com` は実際の本番オリジンに置き換えます。大学を追加した場合は、大学のスラッグに対応する URL も追加します。開発用には、使用するオリジンで同じパスを登録します。Vite の標準オリジンは `http://localhost:5173` です。 [Supabase の Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

   ```text
   https://app.example.com/tsukuba/auth/reset-password
   https://app.example.com/osaka/auth/reset-password
   https://app.example.com/company/auth/reset-password
   https://app.example.com/admin/auth/reset-password
   ```

2. **Authentication → Email → Templates → Reset password** を確認します。Supabase 標準の `{{ .ConfirmationURL }}` を含むテンプレートを利用できます。大学や企業のメールサービスがリンクを先に開いて失効させる場合は、下記のテンプレートに変更すると、利用者が画面で新しいパスワードを送信した時点でリンクを検証します。メール配信サービス側でリンクのクリック計測を無効にしてください。 [メールテンプレート](https://supabase.com/docs/guides/auth/auth-email-templates)・[メールリンクの有効性](https://supabase.com/docs/guides/deployment/going-into-prod#email-link-validity)

   ```html
   <h2>TsukuHubのパスワード再設定</h2>
   <p>以下のリンクから新しいパスワードを設定してください。</p>
   <p><a href="{{ .RedirectTo }}#token_hash={{ .TokenHash }}">パスワードを再設定する</a></p>
   <p>心当たりがない場合は、このメールを破棄してください。</p>
   ```

3. 一般利用者に送るには、**Authentication → Email → SMTP Settings** の **Enable custom SMTP** を有効にし、送信元アドレス・名前・SMTP 接続情報を保存します。たとえば既存のメール基盤と同じ Resend を使う場合は、認証済みドメインの送信元アドレス、ホスト `smtp.resend.com`、ポート `465`、ユーザー名 `resend`、パスワード欄に Resend API キーを入力します。応募通知の Edge Function と Auth の SMTP は個別に設定します。Supabase 標準の送信サービスはプロジェクトチームのメールアドレス宛に限られます。 [Supabase の Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)・[Resend の設定手順](https://resend.com/docs/send-with-supabase-smtp)

4. フロントエンドをデプロイし、登録済みのテストアカウントで再設定メールを送ります。メール内のリンクから新しいパスワードを保存し、ログイン画面で新しいパスワードが使えることを確認してください。有効期限切れや使用済みのメールリンクでは、新しい再設定メールを送信できます。

## 初期大学設定

- 筑波大学: `/tsukuba`、`u.tsukuba.ac.jp`、一般登録可、全機能公開
- 大阪大学: `/osaka`、`ecs.osaka-u.ac.jp`、一般登録停止、授業系4機能は準備中
- 全体管理者許可メール:
  - `u867137d@ecs.osaka-u.ac.jp`
  - `s2412438@u.tsukuba.ac.jp`

許可メールは登録停止と大学ドメイン制限を越えて登録できますが、存在しない大学や停止中の大学には登録できません。

## RLS統合テスト

ローカルSupabase起動後、次を実行します。テストデータはトランザクション末尾でロールバックされます。

```bash
docker exec -i supabase_db_2026_TsukuHub \
  psql -U postgres -d postgres < supabase/tests/multi_university_rls.sql
```

## ローカル管理者

ローカル開発用の `s9999999@u.tsukuba.ac.jp` は `global_admin` のまま維持します。本番用migrationではこのユーザーを作成しません。管理画面は `/admin`、大学画面は大学ごとのURLからログインしてください。

## 応募通知メール

管理画面の求人登録・編集で募集者メールアドレスを設定します。連絡先は管理者だけが閲覧できる `internship_recruiter_contacts` に保存します。応募を保存した後、画面から `send-application-notification` を呼び出し、募集者へResendで通知します。返信先は応募者のメールです。

送信失敗でも応募は保存されます。応募完了画面の再送ボタンはメール通知だけを再試行します。送信済みの記録とResendの冪等キーにより、再送時の重複送信を防ぎます。送信済みはResend APIの受付成功を表し、受信箱への配達確認とは区別します。

必要なEdge Function secrets: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `APPLICATION_SUPABASE_ANON_KEY`, `APPLICATION_SUPABASE_SERVICE_ROLE_KEY`。後者2つには対象プロジェクトの有効なキーを設定します。秘密鍵をフロントエンドの環境変数に設定しないでください。関数は `auth.getUser` で認証し、応募者本人の応募だけを送信できます。

追加migrationは `20261023090000_internship_recruiter_contacts.sql` と `20261023100000_application_email_notifications.sql` です。旧 `company_contact_email` が存在する場合は、既存の連絡先を引き継ぎます。

```bash
supabase functions deploy send-application-notification --use-api
npx deno test --allow-env --allow-net supabase/functions/send-application-notification/index_test.ts
npm test
npm run build
```


応募者の入力したメールアドレスにも応募受付メールを送信します。企業向け通知と独立して送信履歴を管理し、再送時は未送信分だけを送ります。`20261115090000_application_confirmation_emails.sql` を適用後、`send-application-notification` を再デプロイしてください。

## 企業向け採用管理

`20261115100000_company_portal.sql` を適用し、フロントエンドをデプロイします。
Supabase Auth の Redirect URLs に本番オリジンの `/company/login` を追加してください。メール認証は有効のまま利用します。

1. 全体管理者が `/admin/company-access` で対象求人と担当者のメールアドレスを登録します。既存の募集者通知メール設定とは独立しています。
2. 担当者に `/company/login` のURLを案内します。初回は同画面からアカウントを登録し、確認メールでメール認証を完了してからログインします。既存アカウントも利用できます。担当者追加時の案内メールは自動送信されません。
3. `/company` で担当求人への応募を検索・絞り込み、詳細で応募フォームの内容と連絡先を確認できます。選考状況の更新は学生の応募一覧にも反映されます。選考状況の更新メールは送信しません。
4. 担当者の権限を解除すると、次のAPIリクエストから閲覧・更新できなくなります。

権限は求人単位です。同じ企業の複数求人を担当する場合はそれぞれ登録してください。メール認証済みのAuthユーザーと登録メールアドレスをDB側で照合します。企業専用の新規アカウントに学生プロフィールや大学アクセス権限は付与しません。管理者メモは企業向けAPIに含めません。企業は辞退済みの応募を変更できません。

権限の回帰テストは `psql "$DATABASE_URL" -f supabase/tests/company_portal.sql` で実行します。テスト用DBで実行してください。テストデータはロールバックされます。

### 選考メモ・面接予定・応募管理の拡張

`20261115110000_company_recruiting_workflow.sql` と `20261115111000_company_review_conflict_status.sql` を順に適用すると、企業担当者は応募詳細で選考メモ、お気に入り、次の対応と期限、面接日時・URLを保存できます。同じ求人の担当者間で共有され、学生や他社からは参照できません。メモの競合時は上書きを拒否し、入力内容を保持して再読み込みを案内します。競合には自動再試行されない `PT409`（HTTP 409）を使用します。

選考状況・メモ・予定の更新履歴に日時と操作した担当者のメールアドレスを記録します。履歴の記録は今回のマイグレーション適用後の企業画面からの更新が対象です。管理者画面からの変更・過去の変更は遡って記録しません。

企業ダッシュボードは求人別集計、選考状況別集計、今後の面接予定と、卒業予定年・複数キーワード・お気に入り・対応期限による絞り込み、並び替え、20件ごとのページ切り替えに対応します。絞り込み条件はURLに保持され、応募詳細から一覧に戻った際も維持されます。対応期限は日本時間の今日まで、かつ選考継続中の応募を対象とします。面接日時も日本時間で入力・表示します。

CSV出力は絞り込み後の全件が対象です。UTF-8 BOM付きで出力し、数式として解釈される値を無効化します。選考メモ・応募の自由記述・面接URLはCSVには含みません。「連絡メールを作成」はメールアプリで下書きを開きます。メールの自動送信や学生への面接通知・カレンダー連携は行いません。
