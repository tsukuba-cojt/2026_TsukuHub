import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Megaphone } from "lucide-react";
import CircleSubPage from "../components/circle/CircleSubPage";
import ListingPagination from "../components/career/ListingPagination";
import ListingResultBar from "../components/career/ListingResultBar";
import { getCircleNotices, mockCircles } from "../components/circle/mockCircles";
import { paginateItems } from "../lib/listingSearch";

type NoticeSortKey = "newest" | "oldest";

const sortOptions: { key: NoticeSortKey; label: string }[] = [
  { key: "newest", label: "新着順" },
  { key: "oldest", label: "古い順" },
];

function CircleNoticeList() {
  const { circleId } = useParams<{ circleId: string }>();
  const circle = mockCircles.find((item) => item.id === circleId);
  const [sort, setSort] = useState<NoticeSortKey>("newest");
  const [page, setPage] = useState(1);

  const notices = useMemo(() => {
    const items = circle ? getCircleNotices(circle) : [];
    return sort === "newest" ? items : [...items].reverse();
  }, [circle, sort]);
  const paged = useMemo(() => paginateItems(notices, page), [notices, page]);

  return (
    <CircleSubPage circle={circle} circleId={circleId} label="お知らせ一覧">
      <section className="sidebarCard circleDetailCard circleSubPageCard">
        <div className="circleDetailCardHead">
          <h1>
            <Megaphone aria-hidden="true" />
            サークルからのお知らせ
          </h1>
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
          <div className="careerInlineState">まだお知らせはありません。</div>
        ) : (
          <ul className="circleDetailNotices circleSubPageNotices">
            {paged.items.map((notice) => (
              <li key={`${notice.date}-${notice.title}`}>
                <time className="circleNumber">{notice.date}</time>
                <div>
                  <strong>{notice.title}</strong>
                  <p>{notice.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <ListingPagination page={page} pageCount={paged.pageCount} onPageChange={setPage} />
      </section>
    </CircleSubPage>
  );
}

export default CircleNoticeList;
