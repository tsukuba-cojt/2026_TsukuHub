### .env.localの設定
`2026-Tsukuhub/`直下に`.env.local`を作成

```
VITE_SUPABASE_URL=NEED_TO_REPLACE
VITE_SUPABASE_PUBLISHABLE_KEY=NEED_TO_REPLACE
```

これら二つのパラメータはsupabaseのdashboardから確認可能。


### 起動方法
`2026-Tsukuhub/` ディレクトリにおいてターミナルを開き、次を実行
```
npm install

npm run dev
```
`http://localhost:5173` にアクセスすると、ローカルで作成したWebアプリを開ける。


ターミナルで`q + Enter`を入力して終了。