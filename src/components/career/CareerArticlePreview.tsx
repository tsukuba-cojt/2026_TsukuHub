import { ArrowRight, BookOpenCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { extractArticleCover } from "../../lib/articleMarkdown";
import type { CareerArticleRecord } from "../../types/content";
import { useUniversity } from "../university/universityContextValue";

type CareerArticlePreviewProps = {
  articles: CareerArticleRecord[];
};

// キャリアトップの基礎知識セクション。
// 講義・履修トップの履修ガイド（classGuidePanel + careerMiniCard）と同じ見た目にそろえる。
export default function CareerArticlePreview({ articles }: CareerArticlePreviewProps) {
  const { path } = useUniversity();
  const previewItems = articles.slice(0, 3);

  return (
    <section className="classGuidePanel">
      <div className="classGuidePanelHead">
        <h2 className="classGuidePanelTitle">
          <BookOpenCheck aria-hidden="true" />
          就活・長期インターンの基礎知識
        </h2>
        <Link className="classGuidePanelMore" to={path("/career/basics")}>
          基礎知識一覧を見る
          <ChevronRight aria-hidden="true" />
        </Link>
      </div>
      {previewItems.length > 0 ? (
        <div className="careerMiniGrid">
          {previewItems.map((article) => {
            const coverImage = extractArticleCover(article.content)?.src;
            return (
              <Link className="careerMiniCard" to={path(`/career/articles/${article.id}`)} key={article.id}>
                <div className={`careerMiniCover${coverImage ? " hasImage" : ""}`}>
                  {coverImage ? <img src={coverImage} alt="" /> : null}
                  <span>{article.category}</span>
                </div>
                <div className="careerMiniCardBody">
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <strong>
                    詳しく読む <ArrowRight aria-hidden="true" />
                  </strong>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="careerInlineState">まだ掲載がありません。</div>
      )}
    </section>
  );
}
