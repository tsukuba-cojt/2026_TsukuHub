import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { listAdminCareerArticles } from "../../services/contentService";
import { createNews, deleteNews, updateNews } from "../../services/newsService";
import type { NewsItemRecord } from "../../types/news";

type Article = { id: string; title: string; status: string; published_at: string; description: string; path: string; category: string; universityIds: string[] };

export default function ArticleNewsPicker({ items, onReload }: { items: NewsItemRecord[]; onReload: () => Promise<void> }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const kind = "topic" as const;
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  useEffect(() => {
    void Promise.all([
      listAdminCareerArticles(),
      supabase.from("class_guide_articles").select("id, title, description, published_at, status, class_guide_article_universities(university_id)"),
    ]).then(([career, guides]) => {
      if (guides.error) throw guides.error;
      setArticles([
        ...career.map((item) => ({ ...item, path: `/career/articles/${item.id}`, category: "就活・キャリア", universityIds: item.university_ids ?? [] })),
        ...(guides.data ?? []).map((item) => ({ ...item, path: `/class/guide/${item.id}`, category: "授業・履修", universityIds: item.class_guide_article_universities.map((target) => target.university_id) })),
      ].sort((a, b) => b.published_at.localeCompare(a.published_at)));
    }).catch(() => setError("記事一覧を取得できませんでした。"))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (article: Article) => {
    if (busy) return;
    const existing = items.find((item) => item.source_path === article.path && item.kind === kind);
    setBusy(true); setError("");
    try {
      if (existing?.status === "published") await deleteNews(existing.id);
      else {
        if (article.status !== "published" || !article.universityIds.length) throw new Error("unpublished");
        const input = { kind, title: article.title, category: article.category, description: article.description, published_at: article.published_at, status: "published" as const, source_path: article.path };
        if (existing) await updateNews(existing.id, input, article.universityIds);
        else await createNews(input, article.universityIds);
      }
      await onReload();
    } catch (error) {
      const detail = error as { code?: string; message?: string };
      if (detail.message === "unpublished") setError("公開済みで、掲載対象大学が設定された記事を選んでください。");
      else if (detail.code === "42703" || detail.code === "PGRST204") setError("掲載設定に必要なDBの更新が未適用です。");
      else if (detail.code === "42501") setError("保存権限がありません。管理者アカウントでログインし直してください。");
      else if (detail.code === "23505") setError("この記事はすでに登録されています。画面を再読み込みしてください。");
      else setError(`掲載設定を保存できませんでした。${detail.message ?? "通信状況を確認して再度お試しください。"}`);
    }
    finally { setBusy(false); }
  };

  return <section className="adminPanel">
    <h2>注目トピックに掲載する記事を選ぶ</h2>
    <p>就活・履修記事を選んで掲載できます。公開済みの記事を元記事の対象大学へ掲載し、掲載を外しても元記事は削除されません。タイトル・掲載日は選択時の内容で登録します。</p>
    <div className="adminFilters">
      <p>掲載先：注目トピック</p>
      <label>記事の種類<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">すべて</option><option value="就活・キャリア">就活コンテンツ</option><option value="授業・履修">履修コンテンツ</option></select></label>
      <label>記事を検索<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="タイトルで検索" /></label>
    </div>
    {error && <p className="formError" role="alert">{error}</p>}
    {loading ? <p>記事を読み込み中…</p> : <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>種類</th><th>記事</th><th>公開状態</th><th>掲載設定</th></tr></thead><tbody>
      {articles.filter((article) => (filter === "all" || filter === article.category) && article.title.includes(search)).map((article) => {
        const existing = items.find((item) => item.source_path === article.path && item.kind === kind);
        return <tr key={article.path}><td>{article.category}</td><td><strong>{article.title}</strong><time>{article.published_at}</time></td><td>{article.status === "published" ? "公開中" : "下書き"}{!article.universityIds.length && "（対象大学なし）"}</td><td><label><input type="checkbox" checked={existing?.status === "published"} disabled={busy || (!existing && (article.status !== "published" || !article.universityIds.length))} onChange={() => void toggle(article)} />{existing ? "掲載を外す" : "掲載する"}</label></td></tr>;
      })}
      {articles.filter((article) => (filter === "all" || filter === article.category) && article.title.includes(search)).length === 0 && <tr><td colSpan={4}>該当する記事はありません。</td></tr>}
    </tbody></table></div>}
  </section>;
}
