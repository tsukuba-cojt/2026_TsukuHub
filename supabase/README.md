# Supabase setup

Supabase Dashboard の SQL Editor で、`migrations` 内のSQLをファイル名順に実行します。

1. `20260729090000_career_platform.sql`
2. `20260729120000_content_management.sql`
3. `20260811090000_timetable_history_and_reviews.sql`
4. `20260811121000_security_hardening.sql`
5. `20260813130000_multi_university.sql`

最後のmigrationは、筑波大学・大阪大学、大学別機能、掲載対象、全体管理者許可リスト、大学別RLSを作成し、既存データを筑波大学へ移行します。

## Auth Hook

本番では Supabase Dashboard の **Authentication → Hooks → Before User Created** に、Postgres関数 `public.hook_restrict_signup_by_university` を設定してください。クライアントから改ざんされた大学スラッグ、登録停止中の大学、許可外メールドメインをユーザー作成前に拒否します。

ローカル環境とAuth APIの直接呼び出しにも同じ制限を適用するため、migrationは `auth.users` に検証トリガーも作成します。

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
