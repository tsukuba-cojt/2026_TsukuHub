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
