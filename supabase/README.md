# Supabase setup

Supabase Dashboard の SQL Editor で、次の順にファイル全体を実行します。

1. `migrations/20260729090000_career_platform.sql`
2. `migrations/20260729120000_content_management.sql`
3. 必要な場合のみ `seed.sql`（サンプルデータ）

最初の migration が `profiles.role` と `is_admin()` を作成します。`column "role" of relation "profiles" does not exist` が出る場合は、管理者設定SQLより先に1番を実行してください。

管理者にするユーザーのUUIDを Authentication > Users で確認し、SQL Editorで次を実行します。

```sql
update public.profiles
set role = 'admin'
where id = '対象ユーザーのUUID';
```

反映後は一度ログアウトしてからログインし直し、`/admin` にアクセスします。
