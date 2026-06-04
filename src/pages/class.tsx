import Header from "../components/Header";
import "../styles/Class.css";
import { Link } from "react-router-dom";
type ClassItem = {
  id: number;
  name: string;
  teacher: string;
  code: string;
  module: string;
  period: string;
  unit: number;
  department: string;
  reviews: number;
  files: number;
  rating: number;
  tags: string[];
};

const classItems: ClassItem[] = [
  {
    id: 1,
    name: "メディア情報学概論",
    teacher: "山田 太郎",
    code: "GA12345",
    module: "春AB",
    period: "月曜3限",
    unit: 2,
    department: "情報メディア創成学類",
    reviews: 12,
    files: 4,
    rating: 4.2,
    tags: ["楽単", "出席あり", "レポート"],
  },
  {
    id: 2,
    name: "データ工学概論",
    teacher: "佐藤 花子",
    code: "GB23456",
    module: "春C",
    period: "火曜2限",
    unit: 2,
    department: "情報科学類",
    reviews: 9,
    files: 2,
    rating: 3.8,
    tags: ["試験あり", "SQL", "中級"],
  },
  {
    id: 3,
    name: "知覚認知心理学",
    teacher: "鈴木 一郎",
    code: "GC34567",
    module: "秋AB",
    period: "木曜4限",
    unit: 2,
    department: "心理学類",
    reviews: 21,
    files: 7,
    rating: 4.6,
    tags: ["人気", "レポート", "おすすめ"],
  },
];

export default function ClassPage() {
  return (
    <div className="class-page">
      <Header />

      <main className="class-main">
        <section className="class-hero">
          <p className="breadcrumb">ホーム ＞ 授業・履修</p>

          <div className="class-title-row">
            <div>
              <p className="section-label">Class Search</p>
              <h1>授業・履修</h1>
              <p>
                授業名、授業コード、開設学類、曜日・時限から、
                自分に合った授業を探せます。
              </p>
            </div>

            <div className="bookmark-card">
              <span>保存した授業</span>
              <strong>0件</strong>
            </div>
          </div>

          <div className="search-panel">
            <div className="main-search-box">
              <input type="text" placeholder="授業名・先生・コードで検索" />
              <button>検索</button>
            </div>

            <div className="filter-grid">
              <select defaultValue="">
                <option value="">モジュール</option>
                <option>春A</option>
                <option>春AB</option>
                <option>春C</option>
                <option>秋AB</option>
                <option>秋C</option>
              </select>

              <select defaultValue="">
                <option value="">開設学類</option>
                <option>情報メディア創成学類</option>
                <option>情報科学類</option>
                <option>知識情報・図書館学類</option>
                <option>社会工学類</option>
                <option>工学システム学類</option>
              </select>

              <select defaultValue="">
                <option value="">曜日・時限</option>
                <option>月曜1限</option>
                <option>月曜2限</option>
                <option>火曜3限</option>
                <option>水曜4限</option>
                <option>金曜5限</option>
              </select>
            </div>
          </div>
        </section>

        <section className="content-layout">
          <aside className="class-filter-sidebar">
            <h3>詳細検索</h3>

            <div className="filter-block">
              <p>評価</p>
              <label>
                <input type="checkbox" />
                4.0以上
              </label>
              <label>
                <input type="checkbox" />
                3.5以上
              </label>
            </div>

            <div className="filter-block">
              <p>授業情報</p>
              <label>
                <input type="checkbox" />
                口コミあり
              </label>
              <label>
                <input type="checkbox" />
                ファイルあり
              </label>
              <label>
                <input type="checkbox" />
                ブックマーク済み
              </label>
            </div>

            <div className="filter-block">
              <p>タグ</p>
              <label>
                <input type="checkbox" />
                楽単
              </label>
              <label>
                <input type="checkbox" />
                レポート
              </label>
              <label>
                <input type="checkbox" />
                試験あり
              </label>
            </div>
          </aside>

          <section className="class-results">
            <div className="result-header">
              <div>
                <h2>授業一覧</h2>
                <p>条件に合う授業を表示しています。</p>
              </div>
              <span>{classItems.length}件</span>
            </div>

             <div className="class-card-list">
              {classItems.map((item) => (
                <article className="class-card" key={item.id}>
                  <Link
                    to={`/class/${item.id}`}
                    className="class-card-link"
                    aria-label={`${item.name}の詳細を見る`}
                  />

                  <div className="class-card-main">
                    <div className="class-meta-row">
                      <span>{item.code}</span>
                      <span>{item.department}</span>
                    </div>

                    <h3>{item.name}</h3>

                    <p className="teacher">担当教員：{item.teacher}</p>

                    <div className="class-info-row">
                      <span>{item.module}</span>
                      <span>{item.period}</span>
                      <span>{item.unit}単位</span>
                    </div>

                    <div className="tag-row">
                      {item.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="class-card-side">
                    <button className="bookmark-button">♡</button>

                    <div className="rating">
                      <strong>{item.rating.toFixed(1)}</strong>
                      <span>★★★★★</span>
                    </div>

                    <div className="sub-stats">
                      <span>口コミ {item.reviews}件</span>
                      <span>ファイル {item.files}件</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="pagination">
              <button>前へ</button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <button>次へ</button>
            </div>
          </section>
        </section>
      </main>

      <nav className="mobile-bottom-nav">
        <button>🏠<span>ホーム</span></button>
        <button className="active">📘<span>履修</span></button>
        <button>🔍<span>検索</span></button>
        <button>🤖<span>AI相談</span></button>
        <button>👤<span>マイ</span></button>
      </nav>
    </div>
  );
}
