/*未使用。今後検索機能が追加された場合のために残しておく*/



import { useSearchParams } from 'react-router-dom';

export default function SearchPage() {
  // useSearchParamsを使って、URLの「?」以降のパラメータを操作できるようにします
  const [searchParams] = useSearchParams();

  // 「q」という名前のパラメータ（キーワード）を取得します
  // URLが /search?q=プログラミング だった場合、keywordには "プログラミング" が入ります
  const keyword = searchParams.get('q') || '';

  return (
    <div style={{ maxWidth: '1180px', margin: '40px auto', padding: '0 24px' }}>
      <h2>検索結果</h2>
      
      {keyword ? (
        <p>「<strong>{keyword}</strong>」の検索結果を表示しています。</p>
      ) : (
        <p>検索キーワードが指定されていません。</p>
      )}

      {/* ここに、keyword を使ってバックエンドAPIからデータを取得したり、
          記事・授業データなどをフィルタリングして表示するロジックを実装します */}
      <div className="search-results-list">
        {/* 結果一覧のコンポーネントなど */}
      </div>
    </div>
  );
}