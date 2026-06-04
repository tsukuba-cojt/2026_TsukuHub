import { Link, useParams } from "react-router-dom";
import "../styles/classdetail.css";

type ClassDetail = {
  id: number;
  name: string;
  teacher: string;
  code: string;
  module: string;
  period: string;
  unit: number;
  department: string;
  gradeMethod: string;
  rating: number;
  reviews: number;
  files: number;
  tags: string[];
  syllabus: string;
};

const classDetails: ClassDetail[] = [
  {
    id: 1,
    name: "メディア情報学概論",
    teacher: "山田 太郎",
    code: "GA12345",
    module: "春AB",
    period: "月曜3限",
    unit: 2,
    department: "情報メディア創成学類",
    gradeMethod: "期末レポート 60%、出席・小課題 40%",
    rating: 4.2,
    reviews: 12,
    files: 4,
    tags: ["楽単", "出席あり", "レポート"],
    syllabus:
      "メディア情報学の基礎的な考え方を学び、情報メディアと社会の関係について理解を深める授業です。",
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
    gradeMethod: "期末試験 70%、演習課題 30%",
    rating: 3.8,
    reviews: 9,
    files: 2,
    tags: ["試験あり", "SQL", "中級"],
    syllabus:
      "データベース、SQL、正規化、トランザクション処理など、データ工学の基礎を扱います。",
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
    gradeMethod: "レポート 50%、授業内課題 50%",
    rating: 4.6,
    reviews: 21,
    files: 7,
    tags: ["人気", "レポート", "おすすめ"],
    syllabus:
      "人間の知覚・認知の仕組みについて、心理学的・認知科学的な観点から学びます。",
  },
];

const reviewItems = [
  {
    id: 1,
    rating: 5,
    category: "楽単",
    year: "2024年度",
    comment:
      "内容はかなり分かりやすく、毎回の授業を聞いていればレポートも書きやすかったです。初めてこの分野を学ぶ人にもおすすめです。",
  },
  {
    id: 2,
    rating: 4,
    category: "授業内容",
    year: "2023年度",
    comment:
      "課題は少しありますが、授業内容は面白かったです。スライドが整理されていて復習しやすいです。",
  },
  {
    id: 3,
    rating: 3,
    category: "成績評価",
    year: "2023年度",
    comment:
      "レポートの評価基準がやや分かりにくい部分がありました。早めに準備すると安心です。",
  },
];

export default function ClassDetailPage() {
  const { id } = useParams();
  const classItem = classDetails.find((item) => item.id === Number(id));

  if (!classItem) {
    return (
      <main className="class-detail-page">
        <div className="detail-container">
          <p>授業が見つかりませんでした。</p>
          <Link to="/class">授業一覧に戻る</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="class-detail-page">
      <div className="detail-container">
        <div className="detail-breadcrumb">
          <Link to="/">ホーム</Link>
          <span>＞</span>
          <Link to="/class">授業・履修</Link>
          <span>＞</span>
          <span>{classItem.name}</span>
        </div>

        <section className="detail-hero">
          <div className="detail-main-info">
            <div className="detail-tags">
              <span>{classItem.department}</span>
              <span>{classItem.code}</span>
            </div>

            <h1>{classItem.name}</h1>

            <div className="detail-meta">
              <span>担当教員：{classItem.teacher}</span>
              <span>{classItem.module}</span>
              <span>{classItem.period}</span>
              <span>{classItem.unit}単位</span>
            </div>

            <div className="detail-rating-row">
              <strong>{classItem.rating.toFixed(1)}</strong>
              <span>★★★★★</span>
              <p>{classItem.reviews}件の口コミ</p>
            </div>
          </div>

          <div className="detail-actions">
            <button>♡ ブックマーク</button>
            <button>口コミを投稿</button>
            <button>ファイルを投稿</button>
          </div>
        </section>

        <section className="detail-tabs">
          <a href="#reviews">口コミ</a>
          <a href="#files">ファイル</a>
          <a href="#info">授業情報</a>
          <a href="#syllabus">シラバス</a>
        </section>

        <div className="detail-layout">
          <section className="detail-content">
            <section className="detail-section" id="reviews">
              <div className="section-heading">
                <div>
                  <h2>口コミ一覧</h2>
                  <p>受講した学生の口コミを確認できます。</p>
                </div>

                <select defaultValue="new">
                  <option value="new">新規順</option>
                  <option value="rating">評価順</option>
                  <option value="helpful">参考順</option>
                </select>
              </div>

              <div className="review-list">
                {reviewItems.map((review) => (
                  <article className="review-card" key={review.id}>
                    <div className="review-top">
                      <div>
                        <strong>{"★".repeat(review.rating)}</strong>
                        <span>{"☆".repeat(5 - review.rating)}</span>
                      </div>
                      <p>{review.year}</p>
                    </div>

                    <span className="review-category">{review.category}</span>

                    <p className="review-comment">{review.comment}</p>

                    <div className="review-bottom">
                      <button>参考になった</button>
                      <button>通報</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="detail-section" id="files">
              <h2>ファイル</h2>
              <div className="file-card">
                <div>
                  <strong>授業メモ・過去レポート</strong>
                  <p>この授業に関連する資料をアップロード・閲覧できます。</p>
                </div>
                <button>ファイルを見る</button>
              </div>
            </section>

            <section className="detail-section" id="syllabus">
              <h2>シラバス</h2>
              <p className="syllabus-text">{classItem.syllabus}</p>
              <button className="outline-button">公式シラバスを見る</button>
            </section>
          </section>

          <aside className="detail-sidebar" id="info">
            <h2>授業情報</h2>

            <dl>
              <div>
                <dt>授業名</dt>
                <dd>{classItem.name}</dd>
              </div>

              <div>
                <dt>授業コード</dt>
                <dd>{classItem.code}</dd>
              </div>

              <div>
                <dt>先生</dt>
                <dd>{classItem.teacher}</dd>
              </div>

              <div>
                <dt>曜日時限</dt>
                <dd>{classItem.period}</dd>
              </div>

              <div>
                <dt>単位数</dt>
                <dd>{classItem.unit}単位</dd>
              </div>

              <div>
                <dt>開設学類</dt>
                <dd>{classItem.department}</dd>
              </div>

              <div>
                <dt>成績評価方法</dt>
                <dd>{classItem.gradeMethod}</dd>
              </div>
            </dl>

            <div className="sidebar-tags">
              {classItem.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}