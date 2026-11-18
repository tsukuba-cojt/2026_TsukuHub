import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MessageCircleMore } from "lucide-react";
import CircleSubPage from "../components/circle/CircleSubPage";
import ListingPagination from "../components/career/ListingPagination";
import ListingResultBar from "../components/career/ListingResultBar";
import RatingStars from "../components/class/RatingStars";
import { getCircleReviews, mockCircles } from "../components/circle/mockCircles";
import { paginateItems } from "../lib/listingSearch";

type ReviewSortKey = "newest" | "highest" | "lowest";

const sortOptions: { key: ReviewSortKey; label: string }[] = [
  { key: "newest", label: "新着順" },
  { key: "highest", label: "評価が高い順" },
  { key: "lowest", label: "評価が低い順" },
];

function CircleReviewList() {
  const { circleId } = useParams<{ circleId: string }>();
  const circle = mockCircles.find((item) => item.id === circleId);
  const [sort, setSort] = useState<ReviewSortKey>("newest");
  const [page, setPage] = useState(1);

  const allReviews = useMemo(() => (circle ? getCircleReviews(circle) : []), [circle]);
  const reviews = useMemo(() => {
    if (sort === "highest") return [...allReviews].sort((a, b) => b.rating - a.rating);
    if (sort === "lowest") return [...allReviews].sort((a, b) => a.rating - b.rating);
    return allReviews;
  }, [allReviews, sort]);
  const paged = useMemo(() => paginateItems(reviews, page), [reviews, page]);

  const reviewCount = allReviews.length;
  const averageRating = reviewCount ? allReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0;

  return (
    <CircleSubPage circle={circle} circleId={circleId} label="口コミ一覧">
      <section className="sidebarCard circleDetailCard circleSubPageCard">
        <div className="circleDetailCardHead">
          <h1>
            <MessageCircleMore aria-hidden="true" />
            口コミ一覧
          </h1>
        </div>
        <div className="sidebarScoreRow circleDetailScore circleSubPageScore">
          <strong className="circleNumber">{averageRating.toFixed(1)}</strong>
          <RatingStars rating={averageRating} />
          <span>
            (<span className="circleNumber">{reviewCount}</span>件の評価)
          </span>
        </div>

        <ListingResultBar
          start={paged.start}
          end={paged.end}
          total={paged.total}
          filtering={false}
          sort={sort}
          sortOptions={sortOptions}
          onSort={(key) => {
            setSort(key);
            setPage(1);
          }}
        />

        {paged.items.length === 0 ? (
          <div className="careerInlineState">まだ口コミはありません。</div>
        ) : (
          <ul className="circleSubPageReviews">
            {paged.items.map((review) => (
              <li key={`${review.date}-${review.comment}`}>
                <time className="circleNumber">{review.date}</time>
                <div className="circleDetailReviewMeta">
                  <RatingStars rating={review.rating} />
                  <span>
                    {review.grade} {review.department}
                  </span>
                </div>
                <p>{review.comment}</p>
              </li>
            ))}
          </ul>
        )}

        <ListingPagination page={page} pageCount={paged.pageCount} onPageChange={setPage} />
      </section>
    </CircleSubPage>
  );
}

export default CircleReviewList;
